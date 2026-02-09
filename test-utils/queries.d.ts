export declare function getNamedElement(doc: XMLDocument, localName: string, name: string): Element | null;
export declare function getFirstChildElement(element: Element, localName: string): Element | null;
export declare function getFirstBySelector(doc: XMLDocument | Element, selector: string): Element | null;
export declare function getFirstAndAssertBySelector(doc: XMLDocument | Element, selector: string): Element;
export declare const findIconButtonByIconName: (container: Element, iconName: string) => import("@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js").OscdIconButton | undefined;
