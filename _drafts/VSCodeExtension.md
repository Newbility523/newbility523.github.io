# VSCode 插件开发

踩坑实录

**目录问题**

src 目录下不允许放出了 js，ts 以外的脚本，发布后文件都会删除，具体原因不明，如：

* src
  * extension.js
  * folder_1
    * pyScript.py (deleted)
* pyScript_1.py (keep)



**环境变量问题**

Window 和 mac 多进程调用其他程序环境变量问题，如在确认 python 程序名称时，需要

```ts
var python_path = process.platform == "win32" ? "python" : "python3";
let child = spawn(python_path, params, {
    env: process.env,
    cwd: path,
});
```

原本为了统一，直接写成 `python3` window 反而无法识别，需要改为 `python`，这个可以理解。

奇怪的是，mac 默认的 shell (zsh) `python` 和 `python3` 都能正确识别为 python3，然而到了 `spawn` 里就是不一样的东西了。

还需要整理下



**编码问题**

```ts
// 被弃用
var m_Text = "\\u5DF2\\u9886\\u53D6"
const chineseStr = unescape(m_Text.replace(/\\u/g, '%u'));
const chineseStr2 = m_Text.replace(/\\u/g, '%u');

const str = "\\u5DF2 123 \\u9886 abc \\u53D6";
const chineseStr3 = str.replace(/\\u(\w{1,4})/g, (match, capturedStr) => {
    return String.fromCharCode(parseInt(capturedStr, 16));
});
```



**模块引用问题**

1. `import { UnityObject, Transform, GameObject, Text, RectTransform } from "../utils/UnityType"`为什么要用 .. ; 如何单独导出某个**类定义**，如果想统一换名，类似 import * as xx form 如何实现，单纯  import *  form 可以吗？



为了修复引用路径问题，需要统一对配置、模块声明地方统一调整做法

1. 配置 `tsconfig.josn` 中新增路径别名，减少路径输入

```json
{
    "compilerOptions": {
        "baseUrl": ".", // This must be specified if "paths" is.
        "paths": {
            "@utils/*": [
                "src/utils/*"
            ],
            "@extensions/*": [
                "src/extensions/*"
            ],
        }
    }
}
```

2. 调整导出模块的做法

```ts
// 模块旧写法，在末尾统一导出
module.exports = { activate }

// 新写法，在函数中直接导出
export function activate() {}
```

3. 调整导入模块的做法

```ts
// 旧写法
const { activate: activeCodeStyleExchange } = require('./extensions/CodeStyleExchange')
// 新写法
import * as CodeStyleExchange from '@extensions/CodeStyleExchange'
```





**字符串拼接问题**

```ts
// 需要更优雅的字符传拼接方式，特别是正则的时候
// var regexPatter = "\\[" + `${clientId}${moduleId}` + "(\\d{3})\\].*?\\n"
var regexPatter = `\\[${clientId}${moduleId}(\\d{3})\\].*?\\n`
```





```shell
# 删除 untracked files
git clean -f

git checkout  文件    // 指定还原某个文件
git checkout .    // 还原所有的文件

#修改了文件，并提交到暂存区（即：编辑之后，进行git add 但没有 git commit -m “xxx”）
git log --oneline      // 可以省略
git reset HEAD       // 回退到当前版本
git checkout  a.html  // 还原a.html文件
或者
git checkout HEAD .  // 还原所有文件

#修改了文件，并提交到仓库区（即：编辑之后，进行git add 并且 git commit -m “xxx”）
git log --oneline     // 可以省略
git reset HEAD^    // 回退到上一个版本
git checkout  aaa.html

# 本地新分支推送到远程（远程还没创建）
git push --set-upstream origin prefabAnalysis_major
```

本地已有修改，想把这些修改切到分支里继续处理？

清理

https://blog.csdn.net/jiangkejkl/article/details/121909880

切分支

https://blog.csdn.net/lifangfang0607/article/details/105273259
