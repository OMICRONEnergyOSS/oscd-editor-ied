[![Tests](https://github.com/OMICRONEnergyOSS/oscd-editor-ied/actions/workflows/test.yml/badge.svg)](https://github.com/OMICRONEnergyOSS/oscd-editor-ied/actions/workflows/test.yml) ![NPM Version](https://img.shields.io/npm/v/@omicronenergy/oscd-editor-ied)

# OpenSCD IED Editor

An [OpenSCD](https://openscd.org) plugin for viewing and editing IEDs and their
access points, logical devices, logical nodes, and data in IEC 61850 SCL
documents.

## Development

Install dependencies and start the demo development server:

```sh
npm install
npm run start
```

The demo is served from `demo/index.html`. Other common commands:

| Command | Purpose |
| --- | --- |
| `npm run lint` | Check the code |
| `npm run format` | Apply lint fixes and formatting |
| `npm test` | Build and run the unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:visual` | Run visual regression tests |
| `npm run build` | Build the development output |
| `npm run bundle` | Bundle the plugin and demo |

## Tooling

Shared lint, build, bundle, test, and development-server tooling is provided by
[`@omicronenergy/oscd-tooling`](https://github.com/OMICRONEnergyOSS/oscd-tooling)
and invoked through the `oscd` CLI. The local `tsconfig.json` and
`eslint.config.js` extend its shared configs. The local `rollup.config.js`
extends the shared Rollup config to copy the Ace editor assets required by the
demo.

&copy; 2025 OMICRON electronics GmbH

## License

[Apache-2.0](LICENSE)
