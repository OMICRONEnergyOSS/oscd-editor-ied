import OscdMenuOpen from '@omicronenergy/oscd-menu-open';
import OscdMenuSave from '@omicronenergy/oscd-menu-save';
import OscdBackgroundEditV1 from '@omicronenergy/oscd-background-editv1';

import OscdEditorIED from '../dist/oscd-editor-ied.js';

const oscdShell = document.querySelector('oscd-shell');
if (oscdShell) {
  oscdShell.registry.define('oscd-menu-open', OscdMenuOpen);
  oscdShell.registry.define('oscd-menu-save', OscdMenuSave);
  oscdShell.registry.define('oscd-background-editv1', OscdBackgroundEditV1);

  oscdShell.registry.define('oscd-editor-ied', OscdEditorIED);
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
      translations: { de: 'Vorlagenmenüelement' },
      icon: 'edit',
      requireDoc: true,
      tagName: 'oscd-editor-ied',
    },
  ],
  background: [
    {
      name: 'EditV1 Events Listener',
      icon: 'none',
      requireDoc: true,
      tagName: 'oscd-background-editv1',
    },
  ],
};
