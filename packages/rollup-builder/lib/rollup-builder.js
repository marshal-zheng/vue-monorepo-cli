#!/usr/bin/env node

// import typescript from '@rollup/plugin-typescript';
const rollup = require('rollup');
const path = require('path');
const vue = require('rollup-plugin-vue');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
// const scss = require('rollup-plugin-scss');
const babel = require('@rollup/plugin-babel').default;


const currentWorkingPath = process.cwd();
// Little refactor from where we get the code
const { src = '', name = '' } = require(path.join(currentWorkingPath, 'package.json'));
// build input path using the src
const inputPath = path.join(currentWorkingPath, src);
// Little hack to just get the file name
const fileName = name.replace('@cddev/', '');

// see below for details on the options
const inputOptions = {
  input: inputPath,
  external: ['vue'],
  plugins: [
    resolve({
      browser: true,
      extensions: ['.js', '.vue', '.tsx', '.ts']
    }),
    commonjs(),
    vue({
      css: true, // Dynamically inject CSS as a <style> tag
      compileTemplate: true // Explicitly convert template to render function
    }),
    typescript({
      tsconfig: `${path.resolve(currentWorkingPath, '../../')}/tsconfig.json`,
      'outDir': './dist/types'
    }),
    
    babel({
      presets: ['@babel/preset-env', '@vue/babel-preset-jsx'],  // Assuming no React is used
      // plugins: [
      //   '@vue/babel-plugin-jsx'
      // ],
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx']
    })
  ]
};
const outputOptions = [
  {
    file: `dist/${fileName}.cjs.js`,
    format: 'cjs',
  },
  {
    file: `dist/${fileName}.esm.js`,
    format: 'esm'
  }
];
async function build() {
  // create bundle
  const bundle = await rollup.rollup(inputOptions);
  // loop through the options and write individual bundles
  outputOptions.forEach(async (options) => {
    await bundle.write(options);
  });
}
build();