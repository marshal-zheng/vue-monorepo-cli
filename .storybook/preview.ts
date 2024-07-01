import { DocsPage, DocsContainer } from '@storybook/blocks';

export const parameters = {
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
