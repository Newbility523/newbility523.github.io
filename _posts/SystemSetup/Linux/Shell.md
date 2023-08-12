# Shell 的学习笔记

## cp 注意事项

cp 可以复制文件、目录

```shell
cp source destination
```

- 重写文件不会进行警告，需要警告，补上 -i。
- 目标目录父级必须存在，否则报错。
- 目标可为目录或文件，如果 destination 尾不指定 /，优先视为目录，目录不存在则会复制成 destination 文件。强制指定 / 则只视为目录处理，目录不存在会报错。

> 使用 cp 应明确，复制到目录就在后方指定 /，减少歧义的可能



```shell
cp -r source destination
```

当复制目录时，必须使用 -r

对于源目录和目标目录，有`/`尾缀，指明复制的是**源目录下**的内容，或复制到**目标目录下**。

- 目标目录无`/`，如果目标目录存在，则当目标目录有`/`处理。
- 目标目录无`/`，如果目录不存在，则创建一个目标目录，再当目标目录有`/`处理

目标目录父级不存在，也会报错



mv 改名

mv 可直接用于移动文件或目录，**没有 -r，且`/`尾缀无作用**。

- 对于文件：重命名会覆盖源文件
- 对于目录：目标不存在，这更名成为目标；如果目标存在，更名成为子目录



rm 删除文件、目录

rm 对于目录，如果带上`/`则处理的是目录下的内容。



mkdir 创建目录

带上 -p 参数，可以创建多级目录。



file 查看文件类型

可以辨别 link 和它的指向



cat 查看文件

查看文件所有内容

cat -n 内容会带上行号



more、less 分页浏览文件

less 功能包含 more



head、tail 查看文件头尾内容

可以指定 -n num 或 -num 指定内容行数

```shell
tail -n 10 Main.lua
tail -10 Main.lua
tail Main.lua -10
```

特殊的，带上`-f`，tail 可以实时查看文件的变化。



ps、top 系统监控

ps 当前系统信息

top 实时系统信息



kill、killall 结束进程

```shell
kill -s signal PID
```

| 命令 | 说明                         |
| ---- | ---------------------------- |
| HUP  | 挂起                         |
| INT  | 中断                         |
| QUIT | 结束运行                     |
| KILL | 无条件终止                   |
| SEGV | 段错误                       |
| TERM | 尽可能终止                   |
| STOP | 无条件停止，但不终止         |
| TSTP | 停止或暂停，但在后台继续运行 |
| CONT | 再 STOP 或 TSTP 之后恢复执行 |

kill 默认使用`TERM` ，Ï不一定成功，可以用 ps，top 查看结果。kill 支持指定多个 PID

```shell
kill 12330
#等同于
kill -s TERM 12330
```



killall 支持通配符控制进程



type 查看命令类型

```shell
type ps
type cd
```

type 可以查看 bash shell 中使用的命令是**内建指令**还是**外部指令**。同一指令可能有不同的实现，可以通过`-a`查看完整的。

> 内建命令运行于当前进程，外部指令则是通过创建进程调用运行



## 环境变量

set、env、printevn 都能输出环境变量

- set 输出全局变量、**局部变量、用户自定义变量，并排序**
- env、printevn 输出全局变量



**定义、改动、使用局部变量**

```shell
# 定义或改动
variable_name=value
variable_name="str_value"
# 使用
echo $variable_name
```

注意

1. `=` 两边不能有空格
2. 变量大小写敏感
3. 根据规范，自定义变量名要都用小写，大写是给系统用的

局部变量对于子 shell 不存在



**删除变量**

```shell
unset variable_name
```



**创建全局变量**

```shell
export some_exist_variable
```

export 已有的局部变量，即可将局部变量提升为全局变量。

子 shell 可以访问全局变量，可以也能改，但是改动不会影响到父 shell



