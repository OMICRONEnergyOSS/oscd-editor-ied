import '@webcomponents/scoped-custom-element-registry';
import '@omicronenergy/oscd-shell/oscd-shell.js';
import OscdMenuOpen from '@omicronenergy/oscd-menu-open';
import OscdMenuSave from '@omicronenergy/oscd-menu-save';
import OscdEditorSource from '@omicronenergy/oscd-editor-source';

import { OscdEditorIED } from '@omicronenergy/oscd-editor-ied/oscd-editor-ied.js';

const originalDefine = customElements.define.bind(customElements);
customElements.define = (name, constructor) => {
  if (customElements.get(name)) {
    console.info(
      `Custom element ${name} is already defined, skipping definition.`,
    );
    return;
  }
  return originalDefine(name, constructor);
};

const plugins = {
  menu: [
    {
      name: 'Open File',
      translations: { de: 'Datei öffnen' },
      icon: 'folder_open',
      tagName: 'oscd-menu-open',
    },
    {
      name: 'Save File',
      translations: { de: 'Datei speichern' },
      icon: 'save',
      requireDoc: true,
      tagName: 'oscd-menu-save',
    },
  ],
  editor: [
    {
      name: 'IED Editor',
      translations: { de: 'IED Editor' },
      icon: 'developer_board',
      requireDoc: true,
      tagName: 'oscd-editor-ied',
    },
    {
      name: 'Source Editor',
      translations: { de: 'Source Editor' },
      icon: 'code',
      requireDoc: true,
      tagName: 'oscd-editor-source',
    },
  ],
};

const oscdShell = document.querySelector('oscd-shell');
if (oscdShell) {
  oscdShell.registry.define('oscd-menu-open', OscdMenuOpen);
  oscdShell.registry.define('oscd-menu-save', OscdMenuSave);
  oscdShell.registry.define('oscd-editor-ied', OscdEditorIED);
  oscdShell.registry.define('oscd-editor-source', OscdEditorSource);
  oscdShell.plugins = plugins;

  const params = new URL(document.location).searchParams;
  for (const [name, value] of params) {
    oscdShell.setAttribute(name, value);
  }

  const filename = 'sample.scd';
  const sample = await fetch(filename).then(r => r.text());
  oscdShell.docs = {
    [filename]: new DOMParser().parseFromString(sample, 'application/xml'),
  };
  oscdShell.docName = filename;
}
