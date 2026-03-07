const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

/** @type {import('metro-config').MetroConfig} */
const customConfig = {
  resolver: {
    // Ensure TypeScript extensions are included
    sourceExts: [
      ...defaultConfig.resolver.sourceExts,
      'ts',
      'tsx'
    ]
  },
  transformer: {
    // If you later add SVG support, uncomment this:
    // babelTransformerPath: require.resolve('react-native-svg-transformer'),
  }
};

module.exports = mergeConfig(defaultConfig, customConfig);

