module.exports = {
  stories: [
    '../src/core/*.stories.tsx',
    '../src/core/**/*.stories.tsx',
    '../src/components/**/*.stories.tsx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/react',
};
