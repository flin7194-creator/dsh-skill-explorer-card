# DSH 技能中心 · 紧凑卡片改造 v0.1

目标插件：`@linxin666/dsh-client-ui-skill-explorer@0.4.21`。
上游源码：https://github.com/zhu1090093659/dsh-web/tree/269159f4112c5628180475286f02dd9c40dc2963/packages/dsh-skill-explorer

## 改造范围

- 仅修改 `src/client/panel/SkillsTab.tsx` 和 `panel.module.css`。
- 默认三列（内容区宽度 > 960px），中等宽度两列，小于等于 560px 一列；紧凑卡片、图标、标题、描述、来源与状态。
- 卡片不设底部操作栏。点击图标、名称或简介打开详情弹窗，预览通过原有 read 接口读取正文。编辑、复制为模板、删除沿用原按钮及原回调。
- 开关沿用原始处理、路径权限及并发保护；没有文件的技能仍无开关。插件提供的技能状态是面板状态，不代表已从模型注册表移除。
- 保留原搜索、来源/状态/标记筛选、工作区筛选、分组折叠及偏好存储、创建与导入。
- 统计数据来自实际 list 响应；最后一项是最近成功刷新时间，非文件修改时间。当前接口没有文件修改时间，不伪造卡片时间。
- 图标为本地 SVG，不请求外部服务；颜色沿用宿主主题变量。

## Windows PowerShell 构建（开发者流程）

需要 Git、Node.js、pnpm（使用仓库指定版本）。在一个独立的目录解压本补丁，然后运行：

```powershell
git clone https://github.com/zhu1090093659/dsh-web.git
cd dsh-web
git checkout 269159f4112c5628180475286f02dd9c40dc2963
node ..\dsh-skill-card-v0421\apply.mjs .
pnpm install --frozen-lockfile
pnpm --filter @linxin666/dsh-client-ui-skill-explorer... build
pnpm --filter @linxin666/dsh-client-ui-skill-explorer test
```

假设补丁目录和 dsh-web 同级，否则调整 apply.mjs 路径。脚本要求版本与两个源文件的 Git blob SHA 匹配，遇到不符直接退出。原文件备份到仓库根目录 `.dsh-skill-cards-backup-v0421`。

## 安装前检查

本补丁尚未在真实 DSH 桌面环境完成构建和安装测试，不是可直接导入的插件 ZIP。先在独立开发目录完成构建和测试。官方 Desktop CLI 使用 desktop profile；Web CLI 使用 web profile。不要直接覆盖程序目录，不要同时启用两个同名插件。桌面端先完整退出，再查看 `dsh plugin --profile desktop list`，确认原插件是独立安装而非聚合包依赖；如果是聚合包或无法确定来源，先不要卸载，需按实际 profile 配置适配。若是独立安装且构建通过，备份配置后可尝试 `dsh plugin --profile desktop add "link:$((Resolve-Path .\packages\dsh-skill-explorer).Path)"`。安装失败或出现重复注册时停止，不强制覆盖。重开客户端验证。使用 link 时须保留源码及构建目录。

## 验收与回退

验证三/二/一列、长标题、搜索筛选、展开折叠、切换状态、详情预览、编辑、复制、导入，以及无文件/链接技能的权限限制。删除只对专门创建的测试技能验证。检查亮暗主题和刷新失败状态。

源码回退：将 `.dsh-skill-cards-backup-v0421` 内两个原文件复制回 `packages/dsh-skill-explorer/src/client/panel/` 并重新构建。安装回退：恢复原安装来源及原版本，若原来为独立 npm 安装，可通过插件管理恢复 `@linxin666/dsh-client-ui-skill-explorer@0.4.21`。如果原来来自聚合包，恢复聚合包配置而非另装同名包。

## 验证状态

已核对公开仓库 v0.4.21 的真实组件结构、接口和原始文件 blob SHA；本地进行了脚本语法与模板 TSX 语法检查。由于当前环境无法下载完整仓库与依赖，未执行实际源码合并、完整类型检查、构建或桌面端运行测试。补丁保留上游许可，派生内容应遵循上游 BSD-3-Clause 及仓库适用许可。
