import { cosmiconfigSync } from 'cosmiconfig';
import defaultsDeep from 'lodash.defaultsdeep';
import path from 'path';
import fs from 'fs';
import { ConfigOptions } from './types';
import { getDefaultConfig } from './validations';
import getHashedSvelteComponents from './getHashedSvelteComponents';

function getConfig(context?: string): ConfigOptions {
  const explorerSync = cosmiconfigSync('elder');
  const explorerSearch = explorerSync.search();
  let loadedConfig = {};
  if (explorerSearch && explorerSearch.config) {
    loadedConfig = explorerSearch.config;
  }

  const defaultConfig = getDefaultConfig();
  const config: ConfigOptions = defaultsDeep(loadedConfig, defaultConfig);

  const rootDir = config.rootDir === 'process.cwd()' ? process.cwd() : path.resolve(config.rootDir);
  config.rootDir = rootDir;
  config.srcDir = path.resolve(rootDir, config.srcDir);
  config.distDir = path.resolve(rootDir, config.distDir);

  const ssrComponents = path.resolve(config.rootDir, './___ELDER___/compiled/');
  const clientComponents = path.resolve(config.distDir, './svelte/');

  config.$$internal = {
    ssrComponents,
    clientComponents,
    hashedComponents: getHashedSvelteComponents({ ssrComponents, clientComponents }),
  };

  if (config.debug.automagic && (!context || context !== 'build')) {
    console.log(
      `debug.automagic:: Your elder.config.js has debug.automagic = true. We call this chatty mode, but it is designed to show you the things we're doing automatically so you're aware. To turn it off set debug.automagic = 'false'`,
    );
  }

  return config;
}

export default getConfig;
