const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = {
  resolver: {
    // Add '.ts' and '.tsx' to the list of source extensions
    sourceExts: [...getDefaultConfig(__dirname).resolver.sourceExts, 'ts', 'tsx'],
  },
  // Metro transforms all code with Babel, which handles the TypeScript compilation
  // based on your babel.config.js and tsconfig.json files
  transformer: {
    // You may need to add custom transformers here for specific assets like SVG
    // babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);