export function getNamedElement(
  doc: XMLDocument,
  localName: string,
  name: string,
): Element | null {
  const namespace = doc.documentElement.namespaceURI ?? null;
  return (
    Array.from(doc.getElementsByTagNameNS(namespace, localName)).find(
      element => element.getAttribute('name') === name,
    ) ?? null
  );
}

export function getFirstChildElement(
  element: Element,
  localName: string,
): Element | null {
  const namespace = element.ownerDocument.documentElement.namespaceURI ?? null;
  return (
    Array.from(element.getElementsByTagNameNS(namespace, localName)).find(
      child => child.parentElement === element,
    ) ?? null
  );
}

export function getFirstBySelector(
  doc: XMLDocument,
  selector: string,
): Element | null {
  return doc.querySelector(selector);
}

export function getFirstAndAssertBySelector(
  doc: XMLDocument,
  selector: string,
): Element {
  const element = doc.querySelector(selector);
  if (!element) {
    throw new Error(`Expected element for selector: ${selector}`);
  }
  return element;
}
