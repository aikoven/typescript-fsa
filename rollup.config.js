import typescript from '@alexlur/rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import execute from 'rollup-plugin-execute';

const moduleName = 'TypeScriptFSA';

const env = process.env.NODE_ENV;
const config = {
  entry: './src/index.ts',
  format: 'umd',
  exports: 'named',
  moduleName,
  plugins: [
    typescript(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
};

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    }),
    execute([
      'cp lib/index.d.ts dist/typescript-fsa.d.ts',
      `echo "export as namespace ${moduleName};" >> dist/typescript-fsa.d.ts`
    ])
  );
}

export default config;
