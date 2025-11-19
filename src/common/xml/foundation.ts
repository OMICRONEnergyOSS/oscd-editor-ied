/**
 * Format xml string in "pretty print" style and return as a string
 * @param xml - xml document as a string
 * @param tab - character to use as a tab
 * @returns string with pretty print formatting
 */
export function formatXml(xml: string, tab?: string): string {
  let formatted = '',
    indent = '';

  if (!tab) {
    tab = '\t';
  }
  xml.split(/>\s*</).forEach(function (node) {
    if (node.match(/^\/\w/)) {
      indent = indent.substring(tab!.length);
    }
    formatted += indent + '<' + node + '>\r\n';
    if (node.match(/^<?\w[^>]*[^/]$/)) {
      indent += tab;
    }
  });
  return formatted.substring(1, formatted.length - 3);
}

export function getChildElementsByTagName(
  element: Element | null | undefined,
  tag: string | null | undefined,
): Element[] {
  if (!element || !tag) {
    return [];
  }
  return Array.from(element.children).filter(
    element => element.tagName === tag,
  );
}
