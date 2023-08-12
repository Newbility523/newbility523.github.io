# Grep

grep (global search regular expression(RE) and print out the line。用正则匹配文件内文本，并输出的搜索工具。除了对指定搜索目录进行搜索，还能配合管道，对上流命令输入内容进行匹配搜索再进行输出。注意，grep 只对正确输出的管道内容进行处理，如果上流发生错误，是不会处理的。

grep 还有相似的

和 grep 相似的还有 egrep 和 fgrep，使用的指令是一样的。

egrep 支持**更完整**的正则表达式功能，等同于 grep -E。建议都是用 egrep 代替 grep

fgrep 是没有正则功能的 grep，等同于 grep -F。单纯匹配字符，所以速度会快些

#### 主要用法

```shell
# 指定目录进行搜索
grep 命令 正则表达式 搜索路径

# 配置管道进行搜索，对 ls 输出内容进行匹配
ls | grep 命令 正则表达式
```

默认情况下输出结果是：文件名+匹配行内容

![image-20220208154942970](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220208154942970.png)

如果是配合管道，就只有匹配行内容

![image-20220208155029496](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220208155029496.png)

| 常用指令                 | 说明                                             |
| :----------------------- | ------------------------------------------------ |
| -a                       | 将 binary 文件以 text 文件的方式搜寻数据         |
| -v                       | 反向查找，即寻找匹配不到要求字符串的内容         |
| -i                       | 忽略大小写                                       |
| -n                       | 对结果输出行号                                   |
| -c                       | 输出匹配数目，不输出匹配内容                     |
| -l                       | 输出符合的文件名，不输出匹配内容                 |
| -h                       | 不显示文件名                                     |
| -o                       | 只显示匹配字符串，而不是行                       |
| --color=auto             | 对于匹配的字符串内容，用高亮颜色标记，显示很友好 |
| -r                       | 递归查找                                         |
| -d skip (一般连着skip用) | 不进行递归寻找                                   |
| -E                       | 拓展正则模式，等同于 egrep                       |
| -F                       | 纯文本模式，等同于 fgrep                         |

``--color=auto`` 指令非常使用，建议再 bash shell 中使用 alias，作为默认值。打开`~/.bashrc`，加入

```shell
alias grep='grep --color=auto'
alias egrep='egrep --color=auto'
alias fgrep='fgrep --color=auto'
```

*.bashrc 的使用可查看 macos 或 linux 的入门说明笔记*

#### 一般使用例子

```shell
# 搜索该目录下，所有文件内包含 ab 的行，并输出它的行号
grep -n ab *
```

虽然以上例子也可以使用，有几点需要注意的

1. 最好使用 egrep 代替 grep，某些正则元字符 grep 默认是没有的，一步到位，都用 egrep。
2. 虽然直接键入字符串也可以搜索，但是为了统一并且避免 shell 的元字符对表达式的影响，无论是不是正则表达式，最好都用**单引号**括起来。
3. 如果使用了正则的 "{}"，要用转义字符 \ ，即 `\{\}`，因为 "{}" 再 bash 中有其他含义。
4. grep 在遇到子目录的时候，会输出`grep: xxx: Is a directory`报错，要避免这个问题就要指明搜索是否包含子目录。如`-r`需要递归搜索子目录，`-d skip`忽略子目录 

#### 一些更完善的使用例子

```shell
# 以下是
# 搜索该目录下，所有文件内包含 a空白符b 的行，并输出它的行号，忽略子目录，匹配内容进行高亮。
egrep -d skip --color=auto 'a\sb' *

# 搜索该目录下，所有文件内包含 a空白符b 的行，递归。
egrep -r 'a\sb' *

# 搜索该目录下，所有文件内包含 ab 或 bb 的行，递归。
egrep -r '\{a,b\}b' *

# 搜索该目录下，包含 ab 或 bb 的匹配行的条目，递归。会直接输出数字
egrep -r -c 'a\sb' *

# 搜索该目录下，包含 ab 或 bb 的文件名，递归。
egrep -r -l 'a\sb' *
```

这里只说 grep 的命令效果，其中正则的使用和普通的正则表达式一致，正则的用法参考之前的笔记。



## 匹配行尾问题

对~~于单行文本，用`$`就可以匹配行尾巴，但是启用多行模式~~

由于系统原因，行尾的表示方式有多种，并不是单纯的 `\n` ，有以下三种

- **`\r`** = CR (Carriage Return) → Used as a new line character in Mac OS before X
- **`\n`** = LF (Line Feed) → Used as a new line character in Unix/Mac OS X
- **`\r\n`** = CR + LF → Used as a new line character in Windows

所以当想匹配文本到行尾，正确的做法是 `\r?\n`。这样已经能处理绝大部分情况，以 `\r` 换行的老 Mac 可以不管。

不同系统下 `$` 会是不同代指吗？还是因语言而异？
