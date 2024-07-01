module.exports = {
  stories: ['../docs/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/vue-webpack5',
    options: {}
  },
  core: {
    builder: 'webpack5',
  },
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push(
      {
        test: /\.(js|jsx|ts|tsx|vue)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-typescript',
                '@vue/babel-preset-jsx' // Include the Vue JSX preset
              ],
              plugins: [
                ['@babel/plugin-proposal-decorators', { legacy: true }], // Use decorators in legacy mode
                ['@babel/plugin-proposal-class-properties'],
                // Add any other Babel plugins you need
              ],
            },
          },
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false,
          },
        },
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              outputPath: 'assets/images',
            },
          },
        ],
      }
    );
    config.resolve.extensions.push('.js', '.jsx', '.ts', '.tsx', '.vue');
    return config;
  },
};
