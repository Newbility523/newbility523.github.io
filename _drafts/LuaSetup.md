

install.bat /F /LUA C:\Lua\5.1 /P C:\Lua\5.1\luarocks-3.9.2 /SELFCONTAINED /Q

Lua 环境搭建

由于需要 Jenkins 对我们输出的 LuaJIT 脚本做定时测试，需要在打包机里重新配置 Lua 环境。遇到了行行色色问题，这里记录下。

LuaJIT 兼容直 Lua5.1，所以使用[Lua5.1.4](https://www.lua.org/ftp/lua-5.1.5.tar.gz)打包脚本。



## MinGW-w64

MinGW-w64 包含了一系列编译的工具，编译 Lua、LuaJIT，以及 LuaRocks 都要用到。

下载 [MinGW-w64](https://github.com/brechtsanders/winlibs_mingw/releases/download/13.2.0-16.0.6-11.0.0-ucrt-r1/winlibs-x86_64-posix-seh-gcc-13.2.0-llvm-16.0.6-mingw-w64ucrt-11.0.0-r1.zip) 放入 C 盘，把其中的 `bin` 路径放入系统 Path 中。

注意这里我下载的是 64 位版本，32 位版本名为 MinGW-w32。打开 `bin` 发现 make 和 mingw 都带有平台前缀，但是 Makefiles 的命令是只认 make 和 mingw 的，所以把这两个改名。还有些其他的，这次过程没用到就不改了。



进入 Lua 目录

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



## 安装 LuaRocks

Lua Rocks 是 Lua 的包管理工具，测试脚本里引用到了第三方模块，需要 Lua Rocks 安装。

[luarocks-3.9.2-windows-64.zip](https://luarocks.github.io/luarocks/releases/luarocks-3.9.2-windows-64.zip)。有文档推荐使用源码安装，千万不要参考。

下载后，也放入 C 盘，并加入 Path 中。

然后运行

```shell
# 必须进行 luarocks 设置，否则无法安装包。
luarocks --lua-dir="C:/xx/Lua/5.1/bin" --lua-version 5.1
# 然后就可以安装包了，注意这里 LuaRocks 内部会需要 MinGW 进行编译新包，上方有提到安装
luarocks install luafilesystem
```

虽然下载 LuaRocks 一直提示让你给出 Lua5.4 的路径，但是他还是支持 5.1 的。

留意安装成功的输出，会指明库的路径，后续要补到 Lua 代码中对 require 目录做补充。



LuaJIT 编译

```shell
# 下载
git clone https://luajit.org/git/luajit.git
# 编译
cd luajit
make mingw
```

注意，这里官方提到 Window 下可以使用 msvcbuild（微软的编译器）进行编译，但是既然 Lua，LuaRocks 都用的 MinGW，这里也用 MinGW 最好。使用项目已有的 LuaJIT 并不能正常运行 LuaRocks 新增的库，怀疑有这方面原因。否则都不需要重新编译 LuaJIT 了。

编译完毕后，按照以下步骤

1. 新增 `LuaJIT`
2. 把构建出来的 **luajit.exe、lua51.dll** 复制到 `LuaJIT`
3. 新增 `LuaJIT/lua/jit` 目录
4. 把编译目录下的 `src/jit` 下的整个目录，复制到 `LuaJIT/lua` 下
5. 把整个 `LuaJIT` 移动到 C 盘新增的 `Lua` 下，并把 `LuaJIT` 加入到系统 Path 中



最后，虽然很想把遇到的坑都记录一遍，但是想想这种问题并不普遍，而且最后总结的方法比原先顺利很多，也就算了。总之 MinGW 

