"""Build the complete, same-origin Zhuque web font from its pinned release."""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import re
from tempfile import TemporaryDirectory

import brotli
import fontTools
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.unicodedata import script


PROJECT = Path(__file__).resolve().parents[1]
FONT_DIRECTORY = PROJECT / "public/fonts/zhuque"
MANIFEST = PROJECT / "src/data/zhuque-font.json"
HOT_CHARACTERS = PROJECT / "src/data/zhuque-hot-characters.json"
FAMILY = "Zhuque Fangsong Complete"
RELEASE = "v0.212"
RELEASE_URL = f"https://github.com/TrionesType/zhuque/releases/tag/{RELEASE}"
TTF_SHA256 = "558c62730844fe54ba220146ed62f859d4e2880188d92d985f8921c6e3743bc4"
FONTTOOLS_VERSION = "4.62.1"
BROTLI_VERSION = "1.2.0"
HAN_PER_FILE = 320
HOT_GROUPS = ("blog-ui", "beyond")
GENERATED_NAME = re.compile(
    r"(?:zhuque\.[a-f0-9]{16}\.css|zhuque-(?:base|blog-ui|beyond|han-\d+)\.[a-f0-9]{16}\.woff2)"
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def unicode_range(codepoints):
    points = sorted(codepoints)
    start = end = points[0]
    ranges = []
    for point in points[1:]:
        if point == end + 1:
            end = point
            continue
        ranges.append((start, end))
        start = end = point
    ranges.append((start, end))
    return ", ".join(f"U+{start:X}" + (f"-{end:X}" if end != start else "") for start, end in ranges)


def variations(font):
    return {(base, selector): glyph for table in font["cmap"].tables if table.format == 14
            for selector, records in table.uvsDict.items() for base, glyph in records}


def verify_glyph(source, source_name, delivered, delivered_name, label):
    require(source["hmtx"][source_name] == delivered["hmtx"][delivered_name], f"Metrics differ for {label}")
    source_coords = source["glyf"][source_name].getCoordinates(source["glyf"])
    delivered_coords = delivered["glyf"][delivered_name].getCoordinates(delivered["glyf"])
    require(source_coords == delivered_coords, f"Outline differs for {label}")


def build_face(source_bytes, source, codepoints, variant_map):
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.recalc_timestamp = False
    selectors = {selector for _, selector in variant_map}
    font = subset.load_font(BytesIO(source_bytes), options)
    builder = subset.Subsetter(options=options)
    builder.populate(unicodes=codepoints | selectors)
    builder.subset(font)
    output = BytesIO()
    subset.save_font(font, output, options)
    data = output.getvalue()

    delivered = TTFont(BytesIO(data))
    delivered_cmap = delivered.getBestCmap()
    delivered_variants = variations(delivered)
    require(set(delivered_cmap) == codepoints, "Font file cmap differs from its assigned Unicode characters")
    require(delivered_variants.keys() == variant_map.keys(), "Font file variation sequences differ")
    source_cmap = source.getBestCmap()
    for point, glyph in delivered_cmap.items():
        verify_glyph(source, source_cmap[point], delivered, glyph, f"U+{point:X}")
    for (base, selector), glyph in delivered_variants.items():
        source_glyph = variant_map[base, selector]
        if source_glyph is None or glyph is None:
            require(source_glyph is glyph, f"Default variation differs for U+{base:X}/U+{selector:X}")
        else:
            verify_glyph(source, source_glyph, delivered, glyph, f"U+{base:X}/U+{selector:X}")
    return data


def public_asset(prefix, extension, data):
    digest = sha256(data).hexdigest()
    name = f"{prefix}.{digest[:16]}.{extension}"
    return FONT_DIRECTORY / name, {"href": f"/fonts/zhuque/{name}", "sha256": digest, "bytes": len(data)}


def build(source_bytes, hot_characters):
    require(sha256(source_bytes).hexdigest() == TTF_SHA256, f"The input must be the original {RELEASE} TTF")
    source = TTFont(BytesIO(source_bytes))
    all_points = set(source.getBestCmap())
    variant_map = variations(source)
    require(all(base in all_points and selector not in all_points for base, selector in variant_map),
            "Unexpected variation-selector mapping in the source")

    # Keep alphabetic shaping, punctuation, and every variation sequence in one
    # face. The source has no multi-glyph layout rules involving its Han glyphs.
    base_points = {point for point in all_points if script(chr(point)) != "Hani"}
    base_points.update(base for base, _ in variant_map)
    partitions = [("base", base_points, variant_map)]
    remaining_han = all_points - base_points
    require(isinstance(hot_characters, dict) and set(hot_characters) == set(HOT_GROUPS),
            f"Hot characters must define {', '.join(HOT_GROUPS)}")
    for name in HOT_GROUPS:
        characters = hot_characters[name]
        require(isinstance(characters, str) and len(characters) == len(set(characters)) and bool(characters),
                f"Hot characters for {name} must be a nonempty string of distinct characters")
        points = set(map(ord, characters))
        require(points <= remaining_han, f"Hot characters for {name} overlap or are absent from the Han partitions")
        remaining_han -= points
        partitions.append((name, points, {}))
    han = sorted(remaining_han)
    partitions.extend((f"han-{number:02}", set(han[start:start + HAN_PER_FILE]), {})
                      for number, start in enumerate(range(0, len(han), HAN_PER_FILE), 1))

    assets = {}
    font_files = []
    css_faces = []
    covered = set()
    for name, points, font_variants in partitions:
        selectors = {selector for _, selector in font_variants}
        css_points = points | selectors
        require(covered.isdisjoint(css_points), f"Unicode ranges overlap in {name}")
        covered.update(css_points)
        font_data = build_face(source_bytes, source, points, font_variants)
        path, metadata = public_asset(f"zhuque-{name}", "woff2", font_data)
        ranges = unicode_range(css_points)
        assets[path] = font_data
        font_files.append({**metadata, "codepoints": len(points), "unicodeRange": ranges})
        css_faces.append(
            "@font-face {\n"
            f"  font-family: '{FAMILY}';\n"
            f"  src: url('{metadata['href']}') format('woff2');\n"
            "  font-weight: 400;\n"
            "  font-style: normal;\n"
            "  font-display: swap;\n"
            f"  unicode-range: {ranges};\n"
            "}\n"
        )
    require(covered == all_points | {selector for _, selector in variant_map}, "Incomplete Unicode coverage")

    css = ("/* Generated by scripts/vendor-zhuque-font.py. */\n" + "\n".join(css_faces)).encode("utf-8")
    path, styles = public_asset("zhuque", "css", css)
    assets[path] = css
    encoded_points = ",".join(f"{point:X}" for point in sorted(all_points)).encode("ascii")
    manifest = {
        "schemaVersion": 1,
        "family": FAMILY,
        "source": {
            "releaseUrl": RELEASE_URL,
            "version": RELEASE,
            "ttfFile": "ZhuqueFangsong-Regular.ttf",
            "ttfSha256": TTF_SHA256,
            "licenseHref": "/fonts/ZhuqueFangsong-OFL.txt",
            "glyphs": source["maxp"].numGlyphs,
            "codepoints": len(all_points),
            "codepointsSha256": sha256(encoded_points).hexdigest(),
            "variationSequences": [[base, selector] for base, selector in sorted(variant_map)],
        },
        "build": {"fontTools": FONTTOOLS_VERSION, "brotli": BROTLI_VERSION, "hanPerFile": HAN_PER_FILE,
                  "hotCharacters": HOT_CHARACTERS.relative_to(PROJECT).as_posix()},
        "css": styles,
        "files": font_files,
    }
    assets[MANIFEST] = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    return assets, manifest


def publish(path, data, *, immutable):
    if path.exists():
        if path.read_bytes() == data:
            return
        require(not immutable, f"Content-addressed file already has different bytes: {path.relative_to(PROJECT)}")
    with TemporaryDirectory(prefix=".zhuque-", dir=path.parent) as directory:
        temporary = Path(directory) / path.name
        temporary.write_bytes(data)
        if immutable:
            try:
                path.hardlink_to(temporary)
            except FileExistsError:
                require(path.resolve() == path and path.read_bytes() == data,
                        f"Content-addressed file was created concurrently with different bytes: {path.relative_to(PROJECT)}")
        else:
            temporary.replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ttf", type=Path, help=f"Path to the original {RELEASE} ZhuqueFangsong-Regular.ttf")
    parser.add_argument("--check", action="store_true", help="Verify the generated files without writing them")
    args = parser.parse_args()
    require(fontTools.__version__ == FONTTOOLS_VERSION and brotli.__version__ == BROTLI_VERSION,
            f"Use fontTools {FONTTOOLS_VERSION} and Brotli {BROTLI_VERSION}")
    assets, manifest = build(args.ttf.read_bytes(), json.loads(HOT_CHARACTERS.read_text(encoding="utf-8")))
    stale = {path for path in FONT_DIRECTORY.glob("*")
             if GENERATED_NAME.fullmatch(path.name) and path not in assets}
    for path in {FONT_DIRECTORY, *assets, *stale}:
        require(path.resolve() == path, f"Generated path passes through a link: {path.relative_to(PROJECT)}")
    if args.check:
        require(not stale, "Unexpected generated files: " + ", ".join(sorted(path.name for path in stale)))
        for path, data in assets.items():
            require(path.is_file() and path.read_bytes() == data, f"Generated file differs: {path.relative_to(PROJECT)}")
    else:
        FONT_DIRECTORY.mkdir(parents=True, exist_ok=True)
        for path, data in assets.items():
            publish(path, data, immutable=path != MANIFEST)
        for path in stale:
            path.unlink(missing_ok=True)
    files = manifest["files"]
    print(f"{len(files)} WOFF2 files, {len(manifest['source']['variationSequences'])} variation sequences, "
          f"{manifest['source']['codepoints']:,} codepoints, {sum(item['bytes'] for item in files):,} font bytes")


if __name__ == "__main__":
    main()
