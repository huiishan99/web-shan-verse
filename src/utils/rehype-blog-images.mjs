const IMAGE_SIZES = new Set(['normal', 'wide', 'small', 'full']);

function parseImageTitle(title) {
  if (typeof title !== 'string' || title.trim() === '') {
    return { size: 'normal', caption: '' };
  }

  const text = title.trim();
  const colonIndex = text.indexOf(':');
  const head = (colonIndex >= 0 ? text.slice(0, colonIndex) : text).trim().toLowerCase();
  const tail = colonIndex >= 0 ? text.slice(colonIndex + 1).trim() : '';

  if (IMAGE_SIZES.has(head)) {
    return { size: head, caption: tail };
  }

  return { size: 'normal', caption: text };
}

function isSingleImageParagraph(node) {
  return (
    node?.type === 'element' &&
    node.tagName === 'p' &&
    Array.isArray(node.children) &&
    node.children.length === 1 &&
    node.children[0]?.type === 'element' &&
    node.children[0].tagName === 'img'
  );
}

function toFigure(node) {
  const image = node.children[0];
  const properties = image.properties || {};
  const { size, caption } = parseImageTitle(properties.title);

  image.properties = {
    ...properties,
    title: undefined,
    loading: properties.loading || 'lazy',
    decoding: properties.decoding || 'async',
  };

  const figure = {
    type: 'element',
    tagName: 'figure',
    properties: {
      className: ['blog-figure', `blog-figure--${size}`],
    },
    children: [image],
  };

  if (caption) {
    figure.children.push({
      type: 'element',
      tagName: 'figcaption',
      properties: {},
      children: [{ type: 'text', value: caption }],
    });
  }

  return figure;
}

function transform(node) {
  if (!node || !Array.isArray(node.children)) return;

  node.children = node.children.map((child) => {
    if (isSingleImageParagraph(child)) {
      return toFigure(child);
    }

    transform(child);
    return child;
  });
}

export default function rehypeBlogImages() {
  return (tree) => {
    transform(tree);
  };
}
