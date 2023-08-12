# Sed

**sed** = **s**tream **ed**itor。sed 主要用于对文件、输入进行编辑。默认 sed 不会对输入的内容进行修改。

搜索替换

sed 的使用语法大致如下

```
sed [command] [searchPattern or range/]command/oldWord/newWord/[flag] fileName
```

再指定范围内，对 fileName 进行 command 操作，对输出进行 flag 处理

command 包括

| 命令 | 含义                                           |
| ---- | ---------------------------------------------- |
| s    | 字符串查找替换，默认只处理每行符合条件的第一个 |
| y    | 字符查找替换，一行内的所有匹配字符都会处理     |
| d    | 删除                                           |
| a    | append，添加在指定行后                         |
| i    | Insert，插入在指定行前                         |
| c    | Change，更改指定行内容                         |



flag 包括

| 命令 | 含义                           |
| ---- | ------------------------------ |
| p    | 再处理命令前，先输出一次源文本 |
| g    |                                |
|      |                                |



s 模式 subibitute

```shell
# 将每行第一个 dog 转换为 cat
sed "s/dog/cat/" demo.txt

# 将每行第一个 dog 转换为 cat，如果发生处理，先输出一遍原文本
sed "s/dog/cat/p" demo.txt

# 将每行所有 dog 转换为 cat
sed "s/dog/cat/g" demo.txt

# 将第 2 行的 dog 转换为 cat
sed "2s/dog/cat/" demo.txt

# 将第最后 1 行的 dog 转换为 cat
sed "$s/dog/cat/" demo.txt

# 将第 2 - 4 行的 dog 转换为 cat
sed "2, 4s/dog/cat/" demo.txt

# 将第 2 - 最后一行的 dog 转换为 cat
sed "2, $s/dog/cat/" demo.txt

# 先过滤出以 It 开头的行， dog 转换为 cat
sed "/^It/s/dog/cat/" demo.txt

# 注意，先找到第一个包含 line1 行，开始执行 s 命令，直到找到 line3 行
sed "/line1/,/line3/s/dog/cat/" demo.txt
```

注意：

* 最后一个例子中，如果没找到匹配到 line3 的行，就相当于一直处理到结尾。



两行合并

```shell
sed -n 'N;s/\n/\t/p'
```



匹配空格

```shell
# MacOS 下
sed 's/[[:space:]]*//'
```



合并操作

```shell
sed -n '
    s/[[:space:]]*"prefix": "/\|/
    s/",$/\|/
    s/".*"/\|/p
'
```

留意当多行命令结合 `-n` 和 `/p` 的组合使用，时只需要最后一个指令带有 `/p` 即可。

> 多次 s 的操作其实无需每一次处理都输出，最终展示的只是最后一次，所以仅在最后加 `/p` 输出



Mac 下，`i\`，`a\` 模式后需要加入内容的都需要换行，如

```shell
# Error
echo "abc" | sed '1i\Hello world\'
output: sed: 1: "1i\Hello world\": extra characters after \ at the end of i command

# Correct
echo "abc" | sed '1i\
Hello world    '
output: Hello World  abc
```



sed 中使用变量

需要把使用 `${paramName}`，并将单引号换成**双引号**

```shell
param="1"

# 不报错，但会直接当做 ${param} 使用
echo "abc" | sed 's/a/${param}'

# 正确
echo "abc" | sed "s/a/${param}"
```

