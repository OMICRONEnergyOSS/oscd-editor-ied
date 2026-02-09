import { LitElement } from 'lit';
import { ComponentTestHarness } from './test-harness.js';
type AncestorResolver = (context: {
    doc: XMLDocument;
    element: Element;
    instanceElement: Element | null;
}) => Element[];
export type ContainerTestHarnessOptions<T extends LitElement> = {
    docContents: string;
    elementSelector: string;
    instanceSelector?: string;
    ancestorsSelectors?: string[];
    resolveAncestors?: AncestorResolver;
    createContainer: (context: {
        doc: XMLDocument;
        element: Element;
        instanceElement: Element | null;
        ancestors: Element[];
    }) => Promise<T>;
};
export type ContainerTestHarness<T extends LitElement> = {
    container: T;
    doc: XMLDocument;
    element: Element;
    instanceElement: Element | null;
    ancestors: Element[];
    editor: ComponentTestHarness['editor'];
    commitSpy: ComponentTestHarness['commitSpy'];
    reset(): void;
    dispose(): Promise<void>;
};
export declare function createContainerTestHarness<T extends LitElement>(options: ContainerTestHarnessOptions<T>): Promise<ContainerTestHarness<T>>;
export {};
