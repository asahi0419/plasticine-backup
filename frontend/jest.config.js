module.exports = {
  verbose: true,
  silent: true,
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|svg|ttf|woff|woff2)$': '<rootDir>/test/mocks/file.js',
    '\\.(css)$': '<rootDir>/test/mocks/style.js',
    '@amcharts/amcharts5/themes/Animated': '<rootDir>/test/mocks/file.js'
  },
  setupFiles: [
    '<rootDir>/test/enzyme.config.js',
    '<rootDir>/test/globals.js',
  ],
  roots: [
    '<rootDir>/src',
  ],
  cacheDirectory: 'test/cache',
  testEnvironment: 'jsdom'
};
