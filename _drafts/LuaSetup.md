



# Lua 环境搭建

由于需要对输出的 LuaJIT 脚本做定时测试，将遍历 Lua 源码配置表和 LuaJIT 配置表逐行对比，确保相同。于是就需要在 Jenkins 机里重新配置 Lua 环境，包括 **Lua5.1，LuaJIT 2.1，Luarocks**。

测试脚本使用了一些 Lua 模块： lsf 用于文件、目录操作，luasocket 用于连接 EmmyLua 插件调试。它们都属于 luafilesystem。这些都通过 Luarocks 安装。

虽然测试脚本只用到了 LuaJIT （LuaJIT 支持加载源码和 jit 字节码），但是 Luarocks 安装库的时候需要指定一个版本的 Lua 安装路径，所以也必须安装一个 Lua，LuaJIT 兼容至 Lua5.1，所以使选用 [Lua5.1.4](https://www.lua.org/ftp/lua-5.1.5.tar.gz) 。

需要注意的事，测试的 jit 字节码是 64 位的，所以后面配套的无论是编译工具，还是 Luarocks 的安装包都要选用 64 位。根据文本的安装步骤基本没有问题，但这里最后也补充了 [问题汇总](#问题汇总) ，遇到了可以参考。



## MinGW-w64

前置准备，安装 MinGW-w64。 MinGW-w64 包含了一系列编译的工具，编译 Lua、LuaJIT，以及 Luarocks 都要用到。

下载 [MinGW-w64](https://github.com/brechtsanders/winlibs_mingw/releases/download/13.2.0-16.0.6-11.0.0-ucrt-r1/winlibs-x86_64-posix-seh-gcc-13.2.0-llvm-16.0.6-mingw-w64ucrt-11.0.0-r1.zip) 放入 C 盘，把其中的 `bin` 路径放入系统 Path 中。

注意这里我下载的是 64 位版本，32 位版本名为 MinGW-w32。打开 `bin` 发现 make 带有平台前缀，但是 Makefiles 的命令是只认 make 的，所以把 `mingw32-make.exe` 更改为 `make.exe`。如果后续过程中其他的编译工具缺失，也需要把它们的前缀删除就能正常识别。

![image-20231114131515527](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20231114131515527.png)



## Lua5.1.4

注意，必须使用 Lua5.1.4，其他 5.1 版本 Makefile 有缺陷。

进入 Lua 目录，使用 gitbash 进行本节操作，cmd 会有一些语法不支持。

执行命令

```shell
# 失败
make mingw install local
make mingw install INSTALL_TOP=C:\xx\xx
make mingw install INSTALL_TOP="C:\xx\xx"
make mingw install INSTALL_TOP=C:/xx/xx
make mingw install INSTALL_TOP="C:/xx/xx"
# 成功
make mingw install INSTALL_TOP=..
```

说明下，`mingw` 指明了平台，`INSTALL_TOP=..` 指定用当前所在目录编译 Lua。按照 Lua 的说明，`INSTALL_TOP` 是可以指定任意位置的，但实际上指定其他路径都无法正常识别。

按照以下步骤

1. 目录 `Lua/5.1`
2. 把编译目录新增的**bin、include、lib、man、share**文件夹复制过去
3. 把编译目录下的 `src/lua51.dll` 复制到 `Lua/5.1/bin` 中。
4. 把整个 `Lua` 移动到 C 盘合适位置，并把 bin 加入到系统 Path 中



## 安装 Luarocks 和库

Luarocks 是 Lua 的包管理工具，测试脚本里引用到了第三方模块，需要 Luarocks 安装。

下载 [luarocks-3.9.2-windows-64.zip](https://luarocks.github.io/luarocks/releases/luarocks-3.9.2-windows-64.zip) 也放入 C 盘，并加入 Path 中。

执行命令

```shell
# 必须进行 luarocks 设置，否则无法安装包。
luarocks config --local lua_dir C:/Lua/5.1  --lua-version 5.1
# 然后就可以安装包了，如果环境变量中没有 MinGW 会提示安装，根据上方提示
luarocks install luafilesystem
```

虽然下载 Luarocks 一直提示让你给出 Lua5.4 的路径，但是他还是支持 5.1 的。

留意安装成功的输出，会指明库的路径，我这里是 `C:/Users/Administrator/.luarocks`，后续要补到 Lua 代码中对 require 目录做补充。如

```lua
-- 加入第三方库搜索路径
package.path = package.path .. ';C:/Users/Administrator/.luarocks/lib/lua/5.1/?.lua'
package.cpath = package.cpath .. ';C:/Users/Administrator/.luarocks/lib/lua/5.1/?.dll'
```



## LuaJIT 编译

```shell
# 下载
git clone https://luajit.org/git/luajit.git
# 进入 luajit
make
```

注意，这里官方提到 Window 下可以使用 msvcbuild（微软的编译器）进行编译，但是既然 Lua，Luarocks 都用的 MinGW，这里也用 MinGW 最好。使用项目已有的 LuaJIT 并不能正常运行 Luarocks 新增的库，怀疑有这方面原因。否则都不需要重新编译 LuaJIT 了。

编译完毕后，按照以下步骤

1. 新增 `LuaJIT`
2. 把构建出来的 **luajit.exe、lua51.dll** 复制到 `LuaJIT`
3. 新增 `LuaJIT/lua/jit` 目录
4. 把编译目录下的 `src/jit` 下的整个目录，复制到 `LuaJIT/lua` 下
5. 把整个 `LuaJIT` 移动到 C 盘新增的 `Lua` 下，并把 `LuaJIT` 加入到系统 Path 中



最终的文件目录如下

```shell
Lua/
├── 5.1/
│   ├── bin/
│   │   └── lua.exe
│   ├── include
│   ├── lib
│   ├── man
│   └── share
├── LuaJIT/
│   ├── luajit.exe
│   └── lua/
│       └── jit
└── luarocks/
    └── luarocks.exe
```

