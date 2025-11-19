import OscdMenuOpen from '@omicronenergy/oscd-menu-open';
import OscdMenuSave from '@omicronenergy/oscd-menu-save';
import OscdBackgroundEditV1 from '@omicronenergy/oscd-background-editv1';

import OscdEditorIED from '../src/oscd-editor-ied.js';

import {
  registerTranslateConfig,
  use,
} from '../plugins/openscd.github.io/_snowpack/pkg/lit-translate.js';
import { loader as sprinteinsTranslationLoader } from '../plugins/openscd.github.io/openscd/dist/translations/loader.js';

/*test */

registerTranslateConfig({
  loader: sprinteinsTranslationLoader,
  empty: key => key,
});
use('en');

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
