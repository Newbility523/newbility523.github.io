# Markdown 博客

以前看到别人的花花绿绿的炫酷博客网站，好羡慕。

在看了一些 html 和 css 后，感觉想做一个符合我预期的博客网站，或许并没有那么的难。

完事开头难，我要求不高，纯展示静态展示网页就行。在了解了网页的开发后，大致想法是纯手写 html，再寻一份心仪的 css 样式。请教过一些做 Web 前端的朋友，他们说虽然我的做法可以，但是这样太呆太浪费时间了，可以找现成的 WorldPress 框架，再稍微配置个服务器，直接可以写博客就完事了。

心想也是，一次两次手写 html 感觉还好，但是天天这么搞着实浪费时间。

但是我真的不想靠现有的框架搭博客，我想尝试下。

平时有写 Markdown 做笔记的习惯，尝试 github 搜了下 markdown 转 html，不出所料发现好东西 ShowDown，也有 CLI。

如此一来，我的大致思路就是继续写 markdown 笔记上传 github，租云服务器拉去最新的 .md 笔记，并用工具生成 html 即可。

于是创建了 [MDWebsite](https://github.com/Newbility523/MDWebsiteUpdater)。

## 基本需求

* 网页不需要交互
* 更新流程要自动化
* 需要有所有笔记目录（写 markdown 笔记没有写整体目录的习惯）
* 需要嵌入 css，基本审美还是要有的
* 超链接要能正确跳转 （html 转换工具并不会转换链接）

## 进阶需求

* 增加构建配置
* 结构整理容易后期变更博客布局
* 代码高亮
* 数学公式显示
* 整点 banner

基本需求都是比较容易实现的，需要尽快实现，把网站先搭了，基本的浏览不能有问题。进阶需求则是美化和一些结构设计上对自己的要求了。

## 工具、环境

* C++ 别问，问就是这个不熟而且不好掌握，干就完事了。
* WebServer: Nginx
* 云服务: 腾讯云
* Json: RapidJSON
* CMake, gcc
* Node, npm
* MarkDown to Html: [ShowDown](https://github.com/showdownjs/showdown)
* System: Linux_Ubuntu (CentOS gcc 版本低，不好解决，换了)
* Css: [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)

## 初版

### 开发环境问题

开始还是太低估开发环境带来的问题了。

原以为在 window 编写测试完毕后，在放进 linux 中编译就完了。然而 clone 进 linux 虚拟机测试了一遍，编译不过，硬着头皮处理，问题越来越多，操作也烦杂并且无法调试。win 版的测试结果完全不能作为 linux 下的保证。一不做二不休，于是开发环境改用 Vscode + CMake + WSL，出问题直接排查，踩坑完毕后再放到云。

### 编译环境问题

gcc 版本是个烦人的问题。CentOS 的 gcc 版本奇低，只有 4.x。在处理 filesystem 问题时这里卡了很久，原计划是升级 gcc 但是过于麻烦且对系统影响很大，升级做法有待商榷。为了尽快完成上线，改为 ubuntu 调试。

不同系统头文件路径很可能是不一样的，并且个别库是来自 Window SDK，如 direct.h，linux 不存在，就替换成了 dirent.h。对于头文件路径不一致，可以用改 include 路径解决或者通过相对路径引入头文件。

``` C++
// window
#include <io.h>
// linux 具体路径可以使用 gcc -v 查看版本和路径
#include <sys/io.h>
```

个别库需要注意 C++ 版本，例如 filesystem 库

``` C++
// 在 C++17 标准下 filesystem 属于标准库，可以直接使用，如下
#include <filesystem>
using namespace std::filesystem;

// 然而在 C++17 以下都属于 experimental，如下
#include <experimental/filesystem>
using namespace std::experimental::filesystem;
// 并且需要在编译时外链接库 stdC++fs

```

### Node 问题

在安装 node 时，完整来说要先生成调用指令 package.json。否则在某些发行版是无法安装软件的。

同样的，某些发行版安装软件是，默认就是全局安装的，实际环境可能不是。有两种方式

``` bash
# 软件前加 npm
npm softwareName

# 或者安装时改用 -g，显式全局安装
npm install -g software
# 再 run 即可
software
```

但是仍然可能失败，这就可能是 node 的软件安装路径没有包含在 path 中

### Nginx 问题

通过修改 nginx.conf 文件增加 server 段和 index 指向后无效。观察其中的 http 段中的 include 时，该配置又在其他路径中引入配置，此时我的引用路劲为 `/etc/nginx/site-enable/default`。发现 default 中就包含 server 段和 index。修改后重启 nginx 后生效。

中文乱码需要在 default 的 server 段加入 `charset utf-8`

修改后 index 后有可能出现 404 或 403 。有两种情况，一种是新的 index.html 不存在，又或者 nginx 访问网页文件的权限不足。

``` bash
# 若新的网页文件夹为 web
# 对于网页的访问需要 r 和 x 权限
chmod -R 755 web/

# 或修改 nginx.conf 的启动用户
# origin
user www-data
# new, 但不建议
user root
```

### 云服务器

腾讯云的网站需要备案，大致需要 2 天时间，未备份的网站无法访问，及时能访问也可能出现获取不了 css 文件的各种情况。此时调试可以直接用 ip 访问。
