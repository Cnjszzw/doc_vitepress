import { defineConfig } from 'vitepress'
import { withSidebar } from 'vitepress-sidebar'
import { fileURLToPath, URL } from 'node:url'

// VitePress 原生配置
const vitePressOptions = {
  title: "INFO.CENTER",
  description: "Documentation site using vitepress.",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: '文档', link: '/defaultDoc/Intro.md' },
      { text: '隐私', link: '/privateDoc/test.md' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
    // 移除原有的 sidebar 配置（由插件自动生成）
  }
}

// 合并侧边栏配置为一个数组
const vitePressSidebarOptions = [
  {
    documentRootPath: './docs', // 文档根目录路径
    scanStartPath: 'defaultDoc',
    resolvePath: '/defaultDoc/',
    collapsed: true,      // 默认展开侧边栏
    capitalizeFirst: true  // 标题首字母大写
  },
  {
    documentRootPath: './docs', // 文档根目录路径
    scanStartPath: 'privateDoc',
    resolvePath: '/privateDoc/',
    collapsed: true,      // 默认展开侧边栏
    capitalizeFirst: true  // 标题首字母大写
  }
];

// 合并配置并导出
export default defineConfig(
    withSidebar(vitePressOptions, vitePressSidebarOptions)
)