import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	input: 'client_src/index.mjs',
	output: {
		file: 'app/client.js',
		format: 'es'
	},
	plugins: [
		resolve({
			// use "module" field for ES6 module if possible
			module: true, // Default: true

			// use "jsnext:main" if possible
			// – see https://github.com/rollup/rollup/wiki/jsnext:main
			jsnext: true, // Default: false

			// use "main" field or index.js, even if it's not an ES6 module
			// (needs to be converted from CommonJS to ES6
			// – see https://github.com/rollup/rollup-plugin-commonjs
			main: true, // Default: true

			// some package.json files have a `browser` field which
			// specifies alternative files to load for people bundling
			// for the browser. If that's you, use this option, otherwise
			// pkg.browser will be ignored
			browser: true, // Default: false

			// not all files you want to resolve are .js files
			extensions: ['.mjs', '.js', '.jsx', '.json'], // Default: [ '.mjs', '.js', '.json', '.node' ]
		}),
		
		commonjs({
			
		})
	]
};
