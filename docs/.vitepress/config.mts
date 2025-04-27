import { defineConfig } from 'vitepress'
import { withSidebar } from 'vitepress-sidebar'

// VitePress 原生配置
const vitePressOptions = {
  title: "INFO.CENTER",
  description: "Documentation site using vitepress.",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/companyDoc/temp.md' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
    // 移除原有的 sidebar 配置（由插件自动生成）
  }
}

// 侧边栏插件配置
const vitePressSidebarOptions = {
  documentRootPath: './docs', // 文档根目录路径
  collapsed: true,      // 默认展开侧边栏
  capitalizeFirst: true  // 标题首字母大写
}

// 合并配置并导出
export default defineConfig(
    withSidebar(vitePressOptions, vitePressSidebarOptions)
)