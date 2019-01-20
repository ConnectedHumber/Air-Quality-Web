import os from 'os';
import path from 'path';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import { terser } from "rollup-plugin-terser";

import postcss_import from 'postcss-import';
import postcss_copy from 'postcss-copy';

let plugins = [
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
		
	}),
	
	postcss({
		plugins: [
			postcss_import({}),
			postcss_copy({
				dest: "app",
				template: "resources/[name].[ext]"
			})
			// postcss_url(),
			// postcss_url({
			// 	url: "copy",
			// 	basePath: path.resolve("."),
			// 	assetPath: "resources"
			// })
		],
		// Save it to a .css file - we'll reference it ourselves thank you 
		// very much
		extract: true,
		sourceMap: true,
		//minimize: true, // Causes an error at the moment for some reason
	})
];

if(process.env.NODE_ENV == "production") {
	console.log("[config] In production environment - minifying JS");
	plugins.push(terser({
		numWorkers: os.cpus().length,
		compress: {
			ecma: 6
		}
	}));
}

export default {
	input: 'client_src/js/index.mjs',
	output: {
		file: 'app/app.js',
		format: 'esm'
	},
	plugins
};
