import { addons } from '@storybook/addons';
import { create } from '@storybook/theming';
import logo from '../docs/assets/logo.png';

const theme = create({
  base: 'light', // 可以是 'light' 或 'dark'
  // brandTitle: 'Monorepo For Vue2', // 自定义左上角的标题
  // brandUrl: 'https://example.com', // 自定义点击标题时的链接
  brandImage: logo, // 自定义品牌图像的 URL
});

addons.setConfig({
  theme,
});

const customCss = `
  .sidebar-header a img {
    contrast(1.2) brightness(1.1);
  }
`;

const style = document.createElement('style');
style.innerHTML = customCss;
document.head.appendChild(style);