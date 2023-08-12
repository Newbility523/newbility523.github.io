完善下 Mac 下工作流程以及工具

涉及内容

Linux 远程操作

Window 远程操作

svn/git 版本工具使用

代码编辑

C#，Python 使用 JetBrain

Lua，TypeScript 使用 VSCode

svn/git 使用 NVim + Tmux + zsh



能用图形界面尽可能使用图形界面，例如 NVim 也是能编辑代码，但 vim 对我来说更多的是一种编辑方式，偏 IDE 的工作还是 VSCode，Rider 这类现代的编辑器更合适。

至于版本控制的操作，git 在 Mac 和 Window 都不成问题，gitHub Desktop。但是 svn 情况就很不一样，window 上可以用 TortoiseSVN 很好的完成日常的工作，并且是免费的。Mac 上的 svn 方案基本都是收费的，又死贵（CornerStone还不能买断）。并且由于 svn 是用作公司，对 svn 使用就会涉及：

* CDN（Linux） 资源同步
* 自动化工具编写

基于以上的使用场景， svn 的命令行熟练度要求是不能低的。所以就需要整理一套命令行下的 svn 工作流程。



使用场景

代码 Blame，并追踪到变更的日志详情

目录 Blame ，或者 Log，大范围查看

提交前检查 revert （svn diff）

批量筛选提交

冲突处理

工作目录临时缓存

合并

合并冲突处理

检出/部分检出

svn 服务器创建、管理

图片 diff

svn 属性调整（如：自动忽略文件夹下的.xxx文件）

错误处理（wc 数据报错等）









