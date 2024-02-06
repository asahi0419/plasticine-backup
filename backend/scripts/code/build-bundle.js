import * as esbuild from 'esbuild';
import fs from 'fs';
import url from 'url';

await esbuild.build({
  entryPoints: ['index.js'],
  packages: 'external',
  outfile: 'index.cjs',
  bundle: true,
  format: 'cjs',
  target: 'node18',
  platform: 'node',
  alias: {
    'lodash-es': 'lodash',
  },
  plugins: [
    {
      name: 'import.meta.url',
      setup({ onLoad }) {
        onLoad({ filter: /()/, namespace: 'file' }, args => {
          let code = fs.readFileSync(args.path, 'utf8');
          code = code.replace(
            /\bimport\.meta\.url\b/g,
            JSON.stringify(url.pathToFileURL(args.path))
          );
          return { contents: code };
        });
      }
    },
  ],
});
