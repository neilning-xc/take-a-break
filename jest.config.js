module.exports = {
  testURL: 'http://localhost/',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/.erb/mocks/fileMock.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  moduleDirectories: ['node_modules', 'build/app/node_modules', 'src'],
  setupFiles: ['./.erb/scripts/check-build-exists.js', 'jest-date-mock'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  // coverageDirectory: 'src',
  collectCoverageFrom: [
    'src/**/*.{ts,js,tsx}',
    '!src/**/*.d.ts',
    '!src/constants.ts',
  ],
};
