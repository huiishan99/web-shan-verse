declare const trustedInlineHtmlBrand: unique symbol;

export type TrustedInlineHtml = string & {
  readonly [trustedInlineHtmlBrand]: true;
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char] ?? char));
}

export function asTrustedInlineHtml(value: string): TrustedInlineHtml {
  return value as TrustedInlineHtml;
}
