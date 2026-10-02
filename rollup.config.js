import base from '@omicronenergy/oscd-tooling/configs/rollup.config.js';
import copy from 'rollup-plugin-copy';

const [lib, demo] = base;

export default [
  lib,
  {
    ...demo,
    plugins: [
      ...demo.plugins,
      // the IED editor uses oscd-scl-dialogs (which uses ace-editor), so bundle
      // the ace-editor assets alongside the demo build.
      copy({
        targets: [
          {
            src: 'node_modules/ace-builds/src-noconflict/*.js',
            dest: 'dist/demo/ace',
          },
        ],
        verbose: true,
        flatten: true,
      }),
    ],
  },
];
