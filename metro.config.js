const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

/** @type {import('metro-config').MetroConfig} */
const customConfig = {
  resolver: {
    sourceExts: [
      ...defaultConfig.resolver.sourceExts,
      'ts',
      'tsx'
    ]
  },
  transformer: {
    // Add custom transformers here if needed
  }
};

module.exports = mergeConfig(defaultConfig, customConfig);