import OscdMenuOpen from '@omicronenergy/oscd-menu-open';
import OscdMenuSave from '@omicronenergy/oscd-menu-save';
import OscdEditorSource from '@omicronenergy/oscd-editor-source';

import OscdEditorIED from '../dist/oscd-editor-ied.js';

const oscdShell = document.querySelector('oscd-shell');
if (oscdShell) {
  oscdShell.registry.define('oscd-menu-open', OscdMenuOpen);
  oscdShell.registry.define('oscd-menu-save', OscdMenuSave);
  oscdShell.registry.define('oscd-editor-ied', OscdEditorIED);
  oscdShell.registry.define('oscd-editor-source', OscdEditorSource);
}

export const plugins = {
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
