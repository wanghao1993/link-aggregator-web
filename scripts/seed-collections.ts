/**
 * 批量创建高质量集合的脚本
 * 运行方式: npx tsx scripts/seed-collections.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载 .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 50个高质量集合数据
const collectionsData = [
  // ========== AI/ML 分类 ==========
  {
    title: 'AI 编程助手大全',
    description: '收集最强大的AI编程助手工具，帮助开发者提高编码效率，包括代码补全、代码审查、调试等AI驱动的开发工具。',
    category: 'ai',
    tags: ['AI', '编程工具', '效率'],
    links: [
      { title: 'GitHub Copilot', url: 'https://github.com/features/copilot', description: 'GitHub官方AI编程助手，智能代码建议和自动补全' },
      { title: 'Cursor', url: 'https://cursor.sh', description: 'AI原生代码编辑器，深度集成了AI编程能力' },
      { title: 'Claude', url: 'https://claude.ai', description: 'Anthropic的AI助手，擅长代码解释和复杂编程任务' },
      { title: 'ChatGPT', url: 'https://chat.openai.com', description: 'OpenAI的通用AI助手，可帮助解决各种编程问题' },
      { title: 'Codeium', url: 'https://codeium.com', description: '免费的AI代码补全工具，支持多种IDE' },
      { title: 'Tabnine', url: 'https://www.tabnine.com', description: 'AI代码补全工具，支持所有主流编程语言' },
    ],
  },
  {
    title: 'AI 图像生成工具精选',
    description: '精选最优秀的AI图像生成工具，涵盖艺术创作、设计辅助、图片编辑等多个场景，释放你的创意潜能。',
    category: 'ai',
    tags: ['AI', '图像生成', '设计'],
    links: [
      { title: 'Midjourney', url: 'https://www.midjourney.com', description: '顶级AI艺术生成平台，创造令人惊叹的艺术作品' },
      { title: 'DALL-E 3', url: 'https://openai.com/dall-e-3', description: 'OpenAI的文本转图像模型，精准理解复杂提示词' },
      { title: 'Stable Diffusion', url: 'https://stability.ai', description: '开源AI图像生成模型，可本地部署运行' },
      { title: 'Leonardo.ai', url: 'https://leonardo.ai', description: '专注于游戏资产和艺术创作的AI图像平台' },
      { title: 'Ideogram', url: 'https://ideogram.ai', description: '擅长生成包含精确文字的AI图像' },
      { title: 'Flux', url: 'https://flux1.ai', description: '新一代开源图像生成模型，效果惊艳' },
    ],
  },
  {
    title: '大语言模型(LLM)开发资源',
    description: '大语言模型开发的完整资源指南，包括模型选择、微调技巧、RAG实现、提示工程等核心内容。',
    category: 'ai',
    tags: ['LLM', '机器学习', '开发'],
    links: [
      { title: 'Hugging Face', url: 'https://huggingface.co', description: 'AI模型和数据集的托管平台，开源社区核心' },
      { title: 'LangChain', url: 'https://www.langchain.com', description: 'LLM应用开发框架，简化AI应用构建' },
      { title: 'Ollama', url: 'https://ollama.ai', description: '本地运行大语言模型的便捷工具' },
      { title: 'LlamaIndex', url: 'https://www.llamaindex.ai', description: '构建RAG应用的数据框架' },
      { title: 'OpenAI API Docs', url: 'https://platform.openai.com/docs', description: 'OpenAI官方API文档和使用指南' },
      { title: 'Anthropic API', url: 'https://docs.anthropic.com', description: 'Claude API官方文档' },
    ],
  },
  {
    title: '机器学习学习路线',
    description: '从零开始学习机器学习的完整路线图，包含入门教程、进阶课程、实践项目和必备工具。',
    category: 'ai',
    tags: ['机器学习', '学习资源', '教程'],
    links: [
      { title: 'Coursera Machine Learning', url: 'https://www.coursera.org/learn/machine-learning', description: 'Andrew Ng的经典机器学习课程' },
      { title: 'Fast.ai', url: 'https://www.fast.ai', description: '实用的深度学习课程，面向开发者' },
      { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', description: '免费的机器学习微课程，边学边练' },
      { title: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/neural-networks', description: '神经网络的可视化讲解' },
      { title: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', description: 'Google官方机器学习速成课程' },
      { title: 'Papers With Code', url: 'https://paperswithcode.com', description: '最新AI论文与代码实现' },
    ],
  },
  {
    title: 'AI 自动化工具集合',
    description: '提升工作效率的AI自动化工具合集，涵盖工作流自动化、内容生成、数据分析等多个领域。',
    category: 'ai',
    tags: ['AI', '自动化', '效率'],
    links: [
      { title: 'Zapier AI', url: 'https://zapier.com/ai', description: 'AI增强的工作流自动化平台' },
      { title: 'Make (Integromat)', url: 'https://www.make.com', description: '可视化自动化工作流构建器' },
      { title: 'n8n', url: 'https://n8n.io', description: '开源的工作流自动化工具' },
      { title: 'AutoGPT', url: 'https://github.com/Significant-Gravitas/AutoGPT', description: '自主AI代理框架' },
      { title: 'CrewAI', url: 'https://www.crewai.com', description: '多AI代理协作框架' },
      { title: 'Relevance AI', url: 'https://relevanceai.com', description: '构建AI工作流的低代码平台' },
    ],
  },

  // ========== Web开发分类 ==========
  {
    title: '前端框架对比与选择',
    description: '主流前端框架的对比分析和选择指南，帮助你根据项目需求做出最佳技术选型决策。',
    category: 'web',
    tags: ['前端', '框架', 'React'],
    links: [
      { title: 'React 官方文档', url: 'https://react.dev', description: 'React官方文档，包含最新Hooks和最佳实践' },
      { title: 'Vue.js', url: 'https://vuejs.org', description: '渐进式JavaScript框架，易学易用' },
      { title: 'Svelte', url: 'https://svelte.dev', description: '编译时框架，无需虚拟DOM，性能优异' },
      { title: 'Solid.js', url: 'https://www.solidjs.com', description: '高性能响应式前端框架' },
      { title: 'Angular', url: 'https://angular.io', description: '企业级前端框架，完整的开发方案' },
      { title: 'Qwik', url: 'https://qwik.builder.io', description: '下一代前端框架，极致的加载性能' },
    ],
  },
  {
    title: 'Next.js 全栈开发资源',
    description: 'Next.js全栈开发的完整资源集合，从入门到精通，涵盖路由、渲染、数据获取、部署等核心知识点。',
    category: 'web',
    tags: ['Next.js', 'React', '全栈'],
    links: [
      { title: 'Next.js 官方文档', url: 'https://nextjs.org/docs', description: 'Next.js官方文档，最权威的学习资源' },
      { title: 'Next.js Learn', url: 'https://nextjs.org/learn', description: '官方免费交互式教程' },
      { title: 'Vercel Templates', url: 'https://vercel.com/templates', description: 'Next.js项目模板集合' },
      { title: 'Next.js Examples', url: 'https://github.com/vercel/next.js/tree/canary/examples', description: '官方示例代码库' },
      { title: 'T3 Stack', url: 'https://create.t3.gg', description: 'Next.js全栈最佳实践脚手架' },
      { title: 'Next.js Conf', url: 'https://nextjs.org/conf', description: 'Next.js年度大会视频资源' },
    ],
  },
  {
    title: 'CSS 框架与工具精选',
    description: '提升CSS开发效率的框架和工具合集，从原子化CSS到组件库，满足不同项目需求。',
    category: 'web',
    tags: ['CSS', '样式', '前端'],
    links: [
      { title: 'Tailwind CSS', url: 'https://tailwindcss.com', description: '原子化CSS框架，快速构建现代UI' },
      { title: 'shadcn/ui', url: 'https://ui.shadcn.com', description: '高质量React组件库，可复制可定制' },
      { title: 'Radix UI', url: 'https://www.radix-ui.com', description: '无样式的可访问UI组件原语' },
      { title: 'Framer Motion', url: 'https://www.framer.com/motion', description: 'React动画库，流畅的交互动效' },
      { title: 'CSS Tricks', url: 'https://css-tricks.com', description: 'CSS技巧和前端开发知识库' },
      { title: 'Modern CSS', url: 'https://moderncss.dev', description: '现代CSS解决方案集合' },
    ],
  },
  {
    title: 'JavaScript 类型安全实践',
    description: 'JavaScript/TypeScript类型安全的最佳实践和工具集合，提升代码质量和开发体验。',
    category: 'web',
    tags: ['TypeScript', 'JavaScript', '类型'],
    links: [
      { title: 'TypeScript 官方文档', url: 'https://www.typescriptlang.org/docs', description: 'TypeScript官方文档和手册' },
      { title: 'Total TypeScript', url: 'https://www.totaltypescript.com', description: 'TypeScript深度教程和技巧' },
      { title: 'Zod', url: 'https://zod.dev', description: 'TypeScript优先的模式验证库' },
      { title: 'tRPC', url: 'https://trpc.io', description: '端到端类型安全的API开发' },
      { title: 'Type Challenges', url: 'https://github.com/type-challenges/type-challenges', description: 'TypeScript类型体操练习' },
      { title: 'Effect-TS', url: 'https://effect.website', description: '函数式编程和类型安全的工具集' },
    ],
  },
  {
    title: '前端测试完全指南',
    description: '前端测试的工具、框架和最佳实践，覆盖单元测试、集成测试、E2E测试等多种测试类型。',
    category: 'web',
    tags: ['测试', '前端', '质量'],
    links: [
      { title: 'Vitest', url: 'https://vitest.dev', description: 'Vite原生测试框架，极速体验' },
      { title: 'Jest', url: 'https://jestjs.io', description: '流行的JavaScript测试框架' },
      { title: 'Playwright', url: 'https://playwright.dev', description: '跨浏览器E2E测试框架' },
      { title: 'Cypress', url: 'https://www.cypress.io', description: '前端E2E测试的优雅选择' },
      { title: 'Testing Library', url: 'https://testing-library.com', description: '以用户为中心的测试工具集' },
      { title: 'Storybook', url: 'https://storybook.js.org', description: 'UI组件开发和测试工具' },
    ],
  },

  // ========== 设计分类 ==========
  {
    title: 'UI/UX 设计工具大全',
    description: '专业设计师必备的UI/UX设计工具集合，从原型设计到设计系统，全流程设计工具覆盖。',
    category: 'design',
    tags: ['设计', 'UI', 'UX'],
    links: [
      { title: 'Figma', url: 'https://www.figma.com', description: '协作设计工具，行业标准' },
      { title: 'Sketch', url: 'https://www.sketch.com', description: 'Mac上的专业UI设计工具' },
      { title: 'Adobe XD', url: 'https://www.adobe.com/products/xd.html', description: 'Adobe的设计和原型工具' },
      { title: 'Framer', url: 'https://www.framer.com', description: '可交互的原型设计平台' },
      { title: 'Principle', url: 'https://principleformac.com', description: 'Mac上的交互动效设计工具' },
      { title: 'InVision', url: 'https://www.invisionapp.com', description: '数字产品设计平台' },
    ],
  },
  {
    title: '设计系统与组件库',
    description: '知名企业和开源项目的设计系统参考，学习最佳设计规范和组件设计模式。',
    category: 'design',
    tags: ['设计系统', '组件库', 'UI'],
    links: [
      { title: 'Material Design', url: 'https://m3.material.io', description: 'Google的设计系统规范' },
      { title: 'Apple Human Interface', url: 'https://developer.apple.com/design/', description: 'Apple人机界面指南' },
      { title: 'Ant Design', url: 'https://ant.design', description: '企业级UI设计系统' },
      { title: 'Chakra UI', url: 'https://chakra-ui.com', description: '模块化、可访问的组件库' },
      { title: 'MUI', url: 'https://mui.com', description: 'React Material Design组件库' },
      { title: 'Fluent UI', url: 'https://fluentui.microsoft.com', description: '微软的跨平台设计系统' },
    ],
  },
  {
    title: '配色方案与色彩工具',
    description: '精选的配色方案生成器和色彩工具，帮助设计师快速找到完美的配色组合。',
    category: 'design',
    tags: ['配色', '色彩', '设计工具'],
    links: [
      { title: 'Coolors', url: 'https://coolors.co', description: '快速配色方案生成器' },
      { title: 'Tailwind Colors', url: 'https://tailwindcolor.com', description: '精选的现代配色方案' },
      { title: 'Adobe Color', url: 'https://color.adobe.com', description: '专业配色工具和社区方案' },
      { title: 'ColorHunt', url: 'https://colorhunt.co', description: '设计师配色灵感库' },
      { title: 'Realtime Colors', url: 'https://www.realtime.colors', description: '实时预览配色在UI上的效果' },
      { title: 'Khroma', url: 'https://www.khroma.co', description: 'AI学习的个性化配色工具' },
    ],
  },
  {
    title: '图标资源大全',
    description: '海量图标资源集合，涵盖各种风格的图标库，满足不同设计需求。',
    category: 'design',
    tags: ['图标', '设计资源', 'SVG'],
    links: [
      { title: 'Lucide Icons', url: 'https://lucide.dev', description: '美丽的开源图标库' },
      { title: 'Heroicons', url: 'https://heroicons.com', description: 'Tailwind团队设计的图标' },
      { title: 'Phosphor Icons', url: 'https://phosphoricons.com', description: '灵活的图标系列' },
      { title: 'Iconify', url: 'https://iconify.design', description: '统一的图标框架，集合100+图标库' },
      { title: 'Feather Icons', url: 'https://feathericons.com', description: '简洁的开源图标' },
      { title: 'Tabler Icons', url: 'https://tabler-icons.io', description: '1400+精美的开源SVG图标' },
    ],
  },
  {
    title: '字体资源与排版指南',
    description: '精选的免费商用字体资源和排版指南，提升设计的专业性和可读性。',
    category: 'design',
    tags: ['字体', '排版', '设计资源'],
    links: [
      { title: 'Google Fonts', url: 'https://fonts.google.com', description: '免费的网络字体库' },
      { title: 'Fontshare', url: 'https://www.fontshare.com', description: '高质量免费字体' },
      { title: 'Font Squirrel', url: 'https://www.fontsquirrel.com', description: '免费商用字体下载' },
      { title: 'Typewolf', url: 'https://www.typewolf.com', description: '字体灵感和搭配指南' },
      { title: 'Fonts In Use', url: 'https://fontsinuse.com', description: '字体应用案例库' },
      { title: 'Variable Fonts', url: 'https://v-fonts.com', description: '可变字体资源库' },
    ],
  },

  // ========== 移动开发分类 ==========
  {
    title: 'React Native 开发资源',
    description: 'React Native跨平台开发的完整资源集合，从入门教程到高级架构模式。',
    category: 'mobile',
    tags: ['React Native', '移动开发', '跨平台'],
    links: [
      { title: 'React Native 官方文档', url: 'https://reactnative.dev', description: 'React Native官方文档' },
      { title: 'Expo', url: 'https://expo.dev', description: 'React Native开发框架，简化开发流程' },
      { title: 'React Native Paper', url: 'https://callstack.github.io/react-native-paper', description: 'Material Design组件库' },
      { title: 'Tamagui', url: 'https://tamagui.dev', description: '高性能React Native UI工具包' },
      { title: 'React Native Reanimated', url: 'https://docs.swmansion.com/react-native-reanimated', description: '强大的动画库' },
      { title: 'React Native Directory', url: 'https://reactnative.directory', description: 'React Native库资源目录' },
    ],
  },
  {
    title: 'Flutter 开发完全指南',
    description: 'Flutter跨平台开发的全面指南，涵盖Dart语言、UI组件、状态管理等核心内容。',
    category: 'mobile',
    tags: ['Flutter', 'Dart', '跨平台'],
    links: [
      { title: 'Flutter 官方文档', url: 'https://flutter.dev', description: 'Flutter官方文档和教程' },
      { title: 'Dart 官方文档', url: 'https://dart.dev/guides', description: 'Dart语言官方指南' },
      { title: 'Flutter Gallery', url: 'https://gallery.flutter.dev', description: 'Flutter组件演示应用' },
      { title: 'Pub.dev', url: 'https://pub.dev', description: 'Dart和Flutter包仓库' },
      { title: 'Flutter Samples', url: 'https://flutter.github.io/samples', description: 'Flutter示例代码库' },
      { title: 'Riverpod', url: 'https://riverpod.dev', description: 'Flutter状态管理解决方案' },
    ],
  },
  {
    title: 'iOS 开发资源合集',
    description: 'iOS原生开发的精选资源，包括Swift语言、SwiftUI、UIKit等内容。',
    category: 'mobile',
    tags: ['iOS', 'Swift', 'Apple'],
    links: [
      { title: 'Swift 官方文档', url: 'https://swift.org/documentation', description: 'Swift语言官方文档' },
      { title: 'SwiftUI Tutorials', url: 'https://developer.apple.com/tutorials/swiftui', description: 'Apple官方SwiftUI教程' },
      { title: 'Hacking with Swift', url: 'https://www.hackingwithswift.com', description: 'Swift和SwiftUI免费教程' },
      { title: 'Swift by Sundell', url: 'https://www.swiftbysundell.com', description: 'Swift开发周报和文章' },
      { title: 'Ray Wenderlich', url: 'https://www.kodeco.com/ios', description: '高质量iOS教程平台' },
      { title: 'SwiftUI Lab', url: 'https://swiftui-lab.com', description: 'SwiftUI深度教程和技巧' },
    ],
  },
  {
    title: 'Android 开发资源合集',
    description: 'Android原生开发的精选资源，涵盖Kotlin语言、Jetpack Compose、架构组件等。',
    category: 'mobile',
    tags: ['Android', 'Kotlin', 'Jetpack'],
    links: [
      { title: 'Android Developers', url: 'https://developer.android.com', description: 'Android官方开发者网站' },
      { title: 'Jetpack Compose', url: 'https://developer.android.com/jetpack/compose', description: '现代Android UI工具包' },
      { title: 'Kotlin 官方文档', url: 'https://kotlinlang.org/docs', description: 'Kotlin语言官方文档' },
      { title: 'Android Codelabs', url: 'https://codelabs.developers.google.com/?platform=android', description: 'Google官方实践教程' },
      { title: 'Android Weekly', url: 'https://androidweekly.net', description: 'Android开发周报' },
      { title: 'ProAndroidDev', url: 'https://proandroiddev.com', description: 'Android开发Medium博客' },
    ],
  },

  // ========== DevOps分类 ==========
  {
    title: 'Docker 容器化开发指南',
    description: 'Docker容器化开发的完整资源，从基础概念到生产部署的最佳实践。',
    category: 'devops',
    tags: ['Docker', '容器', 'DevOps'],
    links: [
      { title: 'Docker 官方文档', url: 'https://docs.docker.com', description: 'Docker官方文档和教程' },
      { title: 'Docker Hub', url: 'https://hub.docker.com', description: '容器镜像仓库' },
      { title: 'Play with Docker', url: 'https://labs.play-with-docker.com', description: '在线Docker实验室' },
      { title: 'Docker Curriculum', url: 'https://docker-curriculum.com', description: 'Docker入门教程' },
      { title: 'Docker Best Practices', url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices', description: 'Dockerfile最佳实践' },
      { title: 'Dive', url: 'https://github.com/wagoodman/dive', description: 'Docker镜像分析工具' },
    ],
  },
  {
    title: 'Kubernetes 学习路径',
    description: 'Kubernetes容器编排的学习路径，从入门到CKA认证的完整资源。',
    category: 'devops',
    tags: ['Kubernetes', 'K8s', '容器编排'],
    links: [
      { title: 'Kubernetes 官方文档', url: 'https://kubernetes.io/docs', description: 'Kubernetes官方文档' },
      { title: 'Kubernetes Interactive Tutorials', url: 'https://kubernetes.io/docs/tutorials', description: '官方交互式教程' },
      { title: 'Katacoda Kubernetes', url: 'https://www.katacoda.com/courses/kubernetes', description: '在线Kubernetes实验环境' },
      { title: 'Kubernetes The Hard Way', url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way', description: '从头搭建K8s集群教程' },
      { title: 'Helm', url: 'https://helm.sh', description: 'Kubernetes包管理器' },
      { title: 'CNCF Landscape', url: 'https://landscape.cncf.io', description: '云原生技术全景图' },
    ],
  },
  {
    title: 'CI/CD 工具选型指南',
    description: '主流CI/CD工具的对比和最佳实践，帮助团队选择合适的持续集成方案。',
    category: 'devops',
    tags: ['CI/CD', '自动化', 'DevOps'],
    links: [
      { title: 'GitHub Actions', url: 'https://github.com/features/actions', description: 'GitHub原生CI/CD解决方案' },
      { title: 'GitLab CI', url: 'https://docs.gitlab.com/ee/ci', description: 'GitLab内置CI/CD' },
      { title: 'CircleCI', url: 'https://circleci.com', description: '云端CI/CD平台' },
      { title: 'Jenkins', url: 'https://www.jenkins.io', description: '开源自动化服务器' },
      { title: 'ArgoCD', url: 'https://argo-cd.readthedocs.io', description: 'GitOps持续交付工具' },
      { title: 'Tekton', url: 'https://tekton.dev', description: '云原生CI/CD框架' },
    ],
  },
  {
    title: '云服务平台对比',
    description: '主流云服务平台的功能对比和选型指南，涵盖AWS、GCP、Azure等。',
    category: 'devops',
    tags: ['云服务', 'AWS', '基础设施'],
    links: [
      { title: 'AWS Documentation', url: 'https://docs.aws.amazon.com', description: 'AWS官方文档' },
      { title: 'Google Cloud', url: 'https://cloud.google.com/docs', description: 'GCP官方文档' },
      { title: 'Azure Documentation', url: 'https://learn.microsoft.com/azure', description: 'Azure官方文档' },
      { title: 'Vercel', url: 'https://vercel.com/docs', description: '前端部署平台' },
      { title: 'Cloudflare', url: 'https://developers.cloudflare.com', description: '边缘计算和CDN平台' },
      { title: 'Railway', url: 'https://railway.app', description: '简化的部署平台' },
    ],
  },

  // ========== 数据科学分类 ==========
  {
    title: 'Python 数据科学工具栈',
    description: 'Python数据科学生态系统的核心工具和库，从数据处理到机器学习全覆盖。',
    category: 'data',
    tags: ['Python', '数据科学', '机器学习'],
    links: [
      { title: 'NumPy', url: 'https://numpy.org', description: 'Python科学计算基础库' },
      { title: 'Pandas', url: 'https://pandas.pydata.org', description: '数据分析处理库' },
      { title: 'Scikit-learn', url: 'https://scikit-learn.org', description: '机器学习算法库' },
      { title: 'Matplotlib', url: 'https://matplotlib.org', description: 'Python绑图库' },
      { title: 'Jupyter', url: 'https://jupyter.org', description: '交互式计算笔记本' },
      { title: 'Polars', url: 'https://pola-rs.github.io/polars', description: '高性能DataFrame库' },
    ],
  },
  {
    title: '数据可视化工具精选',
    description: '精选的数据可视化工具和库，将数据转化为直观美观的图表和仪表板。',
    category: 'data',
    tags: ['数据可视化', '图表', 'Dashboard'],
    links: [
      { title: 'D3.js', url: 'https://d3js.org', description: '数据驱动的文档可视化库' },
      { title: 'Chart.js', url: 'https://www.chartjs.org', description: '简单灵活的图表库' },
      { title: 'Observable', url: 'https://observablehq.com', description: '数据可视化协作平台' },
      { title: 'Tableau', url: 'https://www.tableau.com', description: '商业智能可视化工具' },
      { title: 'Metabase', url: 'https://www.metabase.com', description: '开源BI工具' },
      { title: 'Recharts', url: 'https://recharts.org', description: 'React图表库' },
    ],
  },
  {
    title: 'SQL 数据库学习资源',
    description: 'SQL和关系型数据库的学习资源，从基础查询到高级优化技巧。',
    category: 'data',
    tags: ['SQL', '数据库', '后端'],
    links: [
      { title: 'PostgreSQL', url: 'https://www.postgresql.org/docs', description: 'PostgreSQL官方文档' },
      { title: 'MySQL', url: 'https://dev.mysql.com/doc', description: 'MySQL官方文档' },
      { title: 'SQL Tutorial', url: 'https://www.sqltutorial.org', description: 'SQL入门教程' },
      { title: 'SQLZoo', url: 'https://sqlzoo.net', description: '交互式SQL练习' },
      { title: 'Use The Index, Luke', url: 'https://use-the-index-luke.com', description: 'SQL索引优化教程' },
      { title: 'DB Fiddle', url: 'https://www.db-fiddle.com', description: '在线SQL测试工具' },
    ],
  },
  {
    title: 'NoSQL 数据库选型',
    description: 'NoSQL数据库的类型、特点和选型指南，涵盖文档、键值、图数据库等。',
    category: 'data',
    tags: ['NoSQL', '数据库', 'MongoDB'],
    links: [
      { title: 'MongoDB', url: 'https://www.mongodb.com/docs', description: '文档数据库官方文档' },
      { title: 'Redis', url: 'https://redis.io/docs', description: '内存键值数据库' },
      { title: 'Supabase', url: 'https://supabase.com/docs', description: '开源Firebase替代方案' },
      { title: 'PlanetScale', url: 'https://planetscale.com/docs', description: '无服务器MySQL' },
      { title: 'Neo4j', url: 'https://neo4j.com/docs', description: '图数据库官方文档' },
      { title: 'Elasticsearch', url: 'https://www.elastic.co/guide', description: '搜索和分析引擎' },
    ],
  },

  // ========== 安全分类 ==========
  {
    title: 'Web 安全入门指南',
    description: 'Web应用安全的基础知识和常见漏洞防护，保护你的应用免受攻击。',
    category: 'security',
    tags: ['安全', 'Web安全', '漏洞防护'],
    links: [
      { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten', description: 'Web应用十大安全风险' },
      { title: 'OWASP Cheat Sheet', url: 'https://cheatsheetseries.owasp.org', description: '安全开发速查表' },
      { title: 'PortSwigger Web Academy', url: 'https://portswigger.net/web-security', description: '免费Web安全学院' },
      { title: 'HackerOne', url: 'https://www.hackerone.com', description: '漏洞赏金平台' },
      { title: 'Security Headers', url: 'https://securityheaders.com', description: 'HTTP安全头检测' },
      { title: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', description: '数据泄露检测' },
    ],
  },
  {
    title: '密码学基础与实践',
    description: '密码学的基础概念和实际应用，包括加密算法、哈希、数字签名等。',
    category: 'security',
    tags: ['密码学', '加密', '安全'],
    links: [
      { title: 'Cryptobook', url: 'https://cryptobook.nakov.com', description: '免费密码学书籍' },
      { title: 'Practical Cryptography', url: 'https://practicalcryptography.com', description: '实用密码学教程' },
      { title: 'libsodium', url: 'https://libsodium.gitbook.io/doc', description: '现代加密库文档' },
      { title: 'Let\'s Encrypt', url: 'https://letsencrypt.org/docs', description: '免费SSL证书' },
      { title: '1Password Blog', url: 'https://blog.1password.com', description: '密码学和安全博客' },
      { title: 'Crypto 101', url: 'https://www.crypto101.io', description: '密码学入门书籍' },
    ],
  },
  {
    title: 'API 安全最佳实践',
    description: 'API安全的设计原则和防护措施，确保接口的认证、授权和数据安全。',
    category: 'security',
    tags: ['API', '安全', '认证'],
    links: [
      { title: 'OWASP API Security', url: 'https://owasp.org/www-project-api-security', description: 'API安全Top 10' },
      { title: 'OAuth 2.0', url: 'https://oauth.net/2', description: 'OAuth 2.0授权框架' },
      { title: 'JWT.io', url: 'https://jwt.io', description: 'JSON Web Token调试器' },
      { title: 'Auth0 Docs', url: 'https://auth0.com/docs', description: '身份认证文档' },
      { title: 'API Security Best Practices', url: 'https://github.com/OWASP/API-Security', description: 'API安全最佳实践' },
      { title: 'Clerk', url: 'https://clerk.com/docs', description: '现代用户管理平台' },
    ],
  },

  // ========== 生产力工具分类 ==========
  {
    title: '开发者效率工具',
    description: '提升开发效率的工具集合，包括代码片段、文档工具、终端增强等。',
    category: 'productivity',
    tags: ['效率', '工具', '开发'],
    links: [
      { title: 'Raycast', url: 'https://www.raycast.com', description: 'Mac效率启动器' },
      { title: 'Alfred', url: 'https://www.alfredapp.com', description: 'Mac效率和生产力工具' },
      { title: 'BetterTouchTool', url: 'https://folivora.ai', description: 'Mac触控板增强工具' },
      { title: 'Rectangle', url: 'https://rectangleapp.com', description: '窗口管理工具' },
      { title: 'Keyboard Maestro', url: 'https://www.keyboardmaestro.com', description: 'Mac自动化工具' },
      { title: 'CleanShot X', url: 'https://cleanshot.com', description: 'Mac截图和录屏工具' },
    ],
  },
  {
    title: '知识管理与笔记工具',
    description: '构建个人知识库的工具和方法，从笔记应用到第二大脑的搭建。',
    category: 'productivity',
    tags: ['笔记', '知识管理', '效率'],
    links: [
      { title: 'Notion', url: 'https://www.notion.so', description: '一体化工作空间' },
      { title: 'Obsidian', url: 'https://obsidian.md', description: '本地优先的知识库' },
      { title: 'Logseq', url: 'https://logseq.com', description: '隐私优先的知识管理' },
      { title: 'Roam Research', url: 'https://roamresearch.com', description: '双向链接笔记工具' },
      { title: 'Reflect', url: 'https://reflect.app', description: 'AI增强的笔记应用' },
      { title: 'Heptabase', url: 'https://heptabase.com', description: '可视化知识管理' },
    ],
  },
  {
    title: '远程协作工具',
    description: '远程团队的协作工具集合，涵盖沟通、项目管理、文档协作等多个方面。',
    category: 'productivity',
    tags: ['协作', '远程工作', '团队'],
    links: [
      { title: 'Slack', url: 'https://slack.com', description: '团队沟通协作平台' },
      { title: 'Linear', url: 'https://linear.app', description: '现代化项目管理工具' },
      { title: 'Loom', url: 'https://www.loom.com', description: '异步视频消息工具' },
      { title: 'Miro', url: 'https://miro.com', description: '在线白板协作工具' },
      { title: 'Figma', url: 'https://www.figma.com', description: '设计协作平台' },
      { title: 'Cal.com', url: 'https://cal.com', description: '开源日程安排工具' },
    ],
  },
  {
    title: '写作与内容创作工具',
    description: '写作者和内容创作者必备的工具集合，提升写作效率和质量。',
    category: 'productivity',
    tags: ['写作', '内容创作', '效率'],
    links: [
      { title: 'Notion', url: 'https://notion.so', description: '多功能协作和写作平台' },
      { title: 'Craft', url: 'https://www.craft.do', description: '美观的文档写作工具' },
      { title: 'Ulysses', url: 'https://ulysses.app', description: 'Mac专业写作软件' },
      { title: 'iA Writer', url: 'https://ia.net/writer', description: '专注写作体验' },
      { title: 'Bear', url: 'https://bear.app', description: '优雅的Markdown笔记' },
      { title: 'Typora', url: 'https://typora.io', description: '所见即所得Markdown编辑器' },
    ],
  },

  // ========== 工具分类 ==========
  {
    title: '开发者必备浏览器扩展',
    description: '提升开发效率的浏览器扩展集合，涵盖调试、测试、设计等各个方面。',
    category: 'tools',
    tags: ['浏览器扩展', '开发工具', 'Chrome'],
    links: [
      { title: 'React DevTools', url: 'https://react.dev/learn/react-developer-tools', description: 'React调试工具' },
      { title: 'Vue DevTools', url: 'https://devtools.vuejs.org', description: 'Vue调试工具' },
      { title: 'Wappalyzer', url: 'https://www.wappalyzer.com', description: '网站技术栈识别' },
      { title: 'ColorZilla', url: 'https://www.colorzilla.com', description: '网页取色器' },
      { title: 'Responsive Viewer', url: 'https://chrome.google.com/webstore/detail/responsive-viewer', description: '响应式测试工具' },
      { title: 'uBlock Origin', url: 'https://ublockorigin.com', description: '高效广告拦截器' },
    ],
  },
  {
    title: '终端工具与配置',
    description: '提升终端体验的工具和配置，打造高效美观的命令行工作环境。',
    category: 'tools',
    tags: ['终端', 'CLI', 'Shell'],
    links: [
      { title: 'iTerm2', url: 'https://iterm2.com', description: 'Mac终端增强' },
      { title: 'Warp', url: 'https://www.warp.dev', description: 'AI增强的现代终端' },
      { title: 'Starship', url: 'https://starship.rs', description: '跨平台的Prompt美化' },
      { title: 'Oh My Zsh', url: 'https://ohmyz.sh', description: 'Zsh配置框架' },
      { title: 'Fish Shell', url: 'https://fishshell.com', description: '智能友好的Shell' },
      { title: 'Tmux', url: 'https://github.com/tmux/tmux', description: '终端复用器' },
    ],
  },
  {
    title: '代码编辑器插件推荐',
    description: 'VS Code等代码编辑器的高效插件推荐，显著提升开发体验。',
    category: 'tools',
    tags: ['VS Code', '编辑器', '插件'],
    links: [
      { title: 'VS Code Marketplace', url: 'https://marketplace.visualstudio.com/vscode', description: 'VS Code插件市场' },
      { title: 'GitHub Copilot', url: 'https://github.com/features/copilot', description: 'AI代码助手' },
      { title: 'Prettier', url: 'https://prettier.io', description: '代码格式化工具' },
      { title: 'ESLint', url: 'https://eslint.org', description: 'JavaScript代码检查' },
      { title: 'GitLens', url: 'https://gitlens.amod.io', description: 'Git增强工具' },
      { title: 'Error Lens', url: 'https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens', description: '行内错误提示' },
    ],
  },
  {
    title: 'Git 与版本控制',
    description: 'Git版本控制的进阶技巧和工具，提升代码协作效率。',
    category: 'tools',
    tags: ['Git', '版本控制', '协作'],
    links: [
      { title: 'Pro Git Book', url: 'https://git-scm.com/book', description: 'Git官方书籍，免费在线阅读' },
      { title: 'GitHub Skills', url: 'https://skills.github.com', description: 'GitHub官方学习课程' },
      { title: 'Learn Git Branching', url: 'https://learngitbranching.js.org', description: '交互式Git学习' },
      { title: 'GitKraken', url: 'https://www.gitkraken.com', description: 'Git GUI客户端' },
      { title: 'GitHub CLI', url: 'https://cli.github.com', description: 'GitHub命令行工具' },
      { title: 'Conventional Commits', url: 'https://www.conventionalcommits.org', description: '提交消息规范' },
    ],
  },
  {
    title: 'API 测试与文档工具',
    description: 'API开发、测试和文档化的一站式工具集合。',
    category: 'tools',
    tags: ['API', '测试', '文档'],
    links: [
      { title: 'Postman', url: 'https://www.postman.com', description: 'API开发和测试平台' },
      { title: 'Insomnia', url: 'https://insomnia.rest', description: '开源API客户端' },
      { title: 'Hoppscotch', url: 'https://hoppscotch.io', description: '开源API开发工具' },
      { title: 'Swagger/OpenAPI', url: 'https://swagger.io', description: 'API文档标准' },
      { title: 'Scalar', url: 'https://scalar.com', description: '美观的API文档生成' },
      { title: 'Bruno', url: 'https://www.usebruno.com', description: 'Git友好的API客户端' },
    ],
  },
  {
    title: '开源项目替代方案',
    description: '常见商业软件的开源替代品，保护隐私且节省成本。',
    category: 'tools',
    tags: ['开源', '替代方案', '免费'],
    links: [
      { title: 'Awesome Selfhosted', url: 'https://github.com/awesome-selfhosted/awesome-selfhosted', description: '自托管软件大合集' },
      { title: 'Plausible', url: 'https://plausible.io', description: 'Google Analytics开源替代' },
      { title: 'Cal.com', url: 'https://cal.com', description: 'Calendly开源替代' },
      { title: 'Documenso', url: 'https://documenso.com', description: 'DocuSign开源替代' },
      { title: 'Appwrite', url: 'https://appwrite.io', description: 'Firebase开源替代' },
      { title: 'Plane', url: 'https://plane.so', description: 'Jira开源替代' },
    ],
  },

  // ========== 更多AI分类 ==========
  {
    title: 'AI 写作与内容生成',
    description: 'AI驱动的写作助手和内容生成工具，提升内容创作效率。',
    category: 'ai',
    tags: ['AI', '写作', '内容创作'],
    links: [
      { title: 'Jasper', url: 'https://www.jasper.ai', description: 'AI营销内容生成平台' },
      { title: 'Copy.ai', url: 'https://www.copy.ai', description: 'AI文案生成工具' },
      { title: 'Writesonic', url: 'https://writesonic.com', description: 'AI写作助手' },
      { title: 'Rytr', url: 'https://rytr.me', description: 'AI写作助手，支持多种语言' },
      { title: 'Notion AI', url: 'https://www.notion.so/product/ai', description: 'Notion内置AI写作功能' },
      { title: 'Grammarly', url: 'https://www.grammarly.com', description: 'AI语法检查和写作建议' },
    ],
  },
  {
    title: 'AI 语音与音频工具',
    description: 'AI语音识别、语音合成和音频处理工具集合。',
    category: 'ai',
    tags: ['AI', '语音', '音频'],
    links: [
      { title: 'ElevenLabs', url: 'https://elevenlabs.io', description: 'AI语音克隆和合成' },
      { title: 'Whisper', url: 'https://openai.com/research/whisper', description: 'OpenAI开源语音识别' },
      { title: 'Murf.ai', url: 'https://murf.ai', description: 'AI语音生成器' },
      { title: 'Descript', url: 'https://www.descript.com', description: 'AI音视频编辑工具' },
      { title: 'Play.ht', url: 'https://play.ht', description: 'AI文字转语音平台' },
      { title: 'Resemble AI', url: 'https://www.resemble.ai', description: 'AI语音生成平台' },
    ],
  },

  // ========== 更多Web开发分类 ==========
  {
    title: '前端性能优化指南',
    description: 'Web性能优化的最佳实践和工具，提升网站加载速度和用户体验。',
    category: 'web',
    tags: ['性能', '优化', '前端'],
    links: [
      { title: 'Web.dev Performance', url: 'https://web.dev/performance', description: 'Google Web性能指南' },
      { title: 'Lighthouse', url: 'https://developer.chrome.com/docs/lighthouse', description: 'Chrome性能审计工具' },
      { title: 'PageSpeed Insights', url: 'https://pagespeed.web.dev', description: '网页速度分析工具' },
      { title: 'WebPageTest', url: 'https://www.webpagetest.org', description: '详细网站性能测试' },
      { title: 'Bundlephobia', url: 'https://bundlephobia.com', description: 'NPM包大小分析' },
      { title: 'Next.js Performance', url: 'https://nextjs.org/docs/pages/building-your-application/optimizing', description: 'Next.js性能优化文档' },
    ],
  },
  {
    title: '无障碍设计(A11y)资源',
    description: 'Web无障碍设计的指南和工具，确保网站对所有用户友好。',
    category: 'web',
    tags: ['无障碍', 'A11y', '用户体验'],
    links: [
      { title: 'W3C WAI', url: 'https://www.w3.org/WAI', description: 'W3C无障碍倡议官方资源' },
      { title: 'A11y Project', url: 'https://www.a11yproject.com', description: '社区驱动的无障碍资源' },
      { title: 'axe DevTools', url: 'https://www.deque.com/axe', description: '无障碍测试工具' },
      { title: 'WAVE', url: 'https://wave.webaim.org', description: '网页无障碍评估工具' },
      { title: 'Inclusive Components', url: 'https://inclusive-components.design', description: '包容性组件设计模式' },
      { title: 'ADG', url: 'https://www.a11yportal.com', description: '无障碍开发指南' },
    ],
  },

  // ========== 更多设计分类 ==========
  {
    title: '设计灵感与灵感库',
    description: '设计师寻找灵感的绝佳网站，涵盖网页、UI、插画等多个领域。',
    category: 'design',
    tags: ['设计灵感', 'UI', '创意'],
    links: [
      { title: 'Dribbble', url: 'https://dribbble.com', description: '设计师作品展示平台' },
      { title: 'Behance', url: 'https://www.behance.net', description: 'Adobe创意作品展示' },
      { title: 'Awwwards', url: 'https://www.awwwards.com', description: '顶级网页设计奖项' },
      { title: 'Mobbin', url: 'https://mobbin.com', description: '移动端UI设计参考库' },
      { title: 'Muzli', url: 'https://muz.li', description: '设计灵感浏览器扩展' },
      { title: 'Land-book', url: 'https://land-book.com', description: '落地页设计灵感' },
    ],
  },

  // ========== 更多生产力分类 ==========
  {
    title: '时间管理与番茄钟',
    description: '高效时间管理工具和方法，提升专注力和工作效率。',
    category: 'productivity',
    tags: ['时间管理', '效率', '专注'],
    links: [
      { title: 'Todoist', url: 'https://todoist.com', description: '任务管理应用' },
      { title: 'Things', url: 'https://culturedcode.com/things', description: 'Mac任务管理应用' },
      { title: 'Forest', url: 'https://www.forestapp.cc', description: '专注力培养应用' },
      { title: 'Pomofocus', url: 'https://pomofocus.io', description: '在线番茄钟' },
      { title: 'RescueTime', url: 'https://www.rescuetime.com', description: '时间追踪工具' },
      { title: 'Toggl', url: 'https://toggl.com', description: '时间跟踪工具' },
    ],
  },

  // ========== 更多工具分类 ==========
  {
    title: '免费图片与素材资源',
    description: '高质量免费图片和设计素材资源，支持商业用途。',
    category: 'tools',
    tags: ['图片', '素材', '免费'],
    links: [
      { title: 'Unsplash', url: 'https://unsplash.com', description: '高质量免费图片库' },
      { title: 'Pexels', url: 'https://www.pexels.com', description: '免费图片和视频' },
      { title: 'Pixabay', url: 'https://pixabay.com', description: '免费图片、视频和音乐' },
      { title: 'Freepik', url: 'https://www.freepik.com', description: '免费矢量图和PSD' },
      { title: 'Undraw', url: 'https://undraw.co', description: '开源SVG插画' },
      { title: 'Humaaans', url: 'https://www.humaaans.com', description: '可定制人物插画' },
    ],
  },
  {
    title: '开发者学习平台',
    description: '优质开发者学习平台和课程资源，持续提升技术能力。',
    category: 'tools',
    tags: ['学习', '编程', '教程'],
    links: [
      { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org', description: '免费编程学习平台' },
      { title: 'Frontend Masters', url: 'https://frontendmasters.com', description: '前端高级课程' },
      { title: 'Egghead', url: 'https://egghead.io', description: '高质量编程短视频' },
      { title: 'Scrimba', url: 'https://scrimba.com', description: '交互式编程课程' },
      { title: 'LeetCode', url: 'https://leetcode.com', description: '算法练习平台' },
      { title: 'Codecademy', url: 'https://www.codecademy.com', description: '互动编程学习' },
    ],
  },

  // ========== 更多安全分类 ==========
  {
    title: '安全工具与渗透测试',
    description: '网络安全工具和渗透测试资源，用于合法安全测试和教育目的。',
    category: 'security',
    tags: ['安全工具', '渗透测试', 'CTF'],
    links: [
      { title: 'Burp Suite', url: 'https://portswigger.net/burp', description: 'Web安全测试工具' },
      { title: 'Wireshark', url: 'https://www.wireshark.org', description: '网络协议分析器' },
      { title: 'Nmap', url: 'https://nmap.org', description: '网络扫描工具' },
      { title: 'Metasploit', url: 'https://www.metasploit.com', description: '渗透测试框架' },
      { title: 'OWASP ZAP', url: 'https://www.zaproxy.org', description: '免费安全测试工具' },
      { title: 'CTFtime', url: 'https://ctftime.org', description: 'CTF竞赛平台' },
    ],
  },
];

async function main() {
  console.log('开始创建集合...\n');

  // 1. 获取或创建一个系统用户
  let systemUser;
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .limit(1)
    .single();

  if (existingUser) {
    systemUser = existingUser;
    console.log(`使用已存在用户: ${systemUser.id}`);
  } else {
    // 创建一个系统用户
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: 'system-user-001',
        name: 'LinkHub System',
        email: 'system@linkhub.dev',
        password: null,
        email_verified: true,
      })
      .select('id')
      .single();

    if (userError) {
      console.error('创建系统用户失败:', userError);
      process.exit(1);
    }
    systemUser = newUser;
    console.log(`创建系统用户: ${systemUser.id}`);
  }

  // 2. 批量创建集合
  let createdCount = 0;
  let linkCount = 0;

  for (const collectionData of collectionsData) {
    try {
      // 创建集合
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .insert({
          title: collectionData.title,
          description: collectionData.description,
          category: collectionData.category,
          tags: collectionData.tags,
          user_id: systemUser.id,
          is_public: true,
          views: Math.floor(Math.random() * 500) + 50, // 随机浏览量
          likes: Math.floor(Math.random() * 100) + 10, // 随机点赞
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // 随机创建时间
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (collectionError) {
        console.error(`创建集合失败 [${collectionData.title}]:`, collectionError.message);
        continue;
      }

      // 创建链接
      const linkRows = collectionData.links.map((link, index) => ({
        collection_id: collection.id,
        title: link.title,
        url: link.url,
        description: link.description,
        sort_order: index,
        created_at: new Date().toISOString(),
      }));

      const { error: linksError } = await supabase
        .from('collection_links')
        .insert(linkRows);

      if (linksError) {
        console.error(`创建链接失败 [${collectionData.title}]:`, linksError.message);
      } else {
        createdCount++;
        linkCount += collectionData.links.length;
        console.log(`✅ 创建成功: ${collectionData.title} (${collectionData.links.length}个链接)`);
      }

      // 创建标签（如果不存在）
      for (const tag of collectionData.tags) {
        await supabase
          .from('tags')
          .upsert(
            { name: tag, slug: tag.toLowerCase().replace(/[^a-z0-9]/g, '-'), is_active: true, usage_count: 1 },
            { onConflict: 'name' }
          );
      }

    } catch (err) {
      console.error(`处理集合时出错 [${collectionData.title}]:`, err);
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 完成！成功创建 ${createdCount} 个集合，共 ${linkCount} 个链接`);
  console.log(`========================================\n`);
}

main().catch(console.error);
