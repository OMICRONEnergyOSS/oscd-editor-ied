import { LitElement } from 'lit';
import { parseDoc } from './test-files.js';
import { getFirstAndAssertBySelector } from './queries.js';
import { ComponentTestHarness, getAncestors } from './test-harness.js';

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

export async function createContainerTestHarness<T extends LitElement>(
  options: ContainerTestHarnessOptions<T>,
): Promise<ContainerTestHarness<T>> {
  const doc = parseDoc(options.docContents);
  const element = getFirstAndAssertBySelector(doc, options.elementSelector);
  const instanceElement = options.instanceSelector
    ? getFirstAndAssertBySelector(doc, options.instanceSelector)
    : null;
  const ancestors = options.resolveAncestors
    ? options.resolveAncestors({ doc, element, instanceElement })
    : getAncestors(doc, options.ancestorsSelectors ?? []);

  const container = await options.createContainer({
    doc,
    element,
    instanceElement,
    ancestors,
  });
  await container.updateComplete;

  const baseHarness = new ComponentTestHarness(container);

  return {
    container,
    doc,
    element,
    instanceElement,
    ancestors,
    editor: baseHarness.editor,
    commitSpy: baseHarness.commitSpy,
    reset: () => baseHarness.commitSpy.resetHistory(),
    dispose: () => baseHarness.dispose(),
  };
}
