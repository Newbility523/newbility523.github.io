# CMake配置

CMake 作用是可以通过编写 CMakeLists.txt 的方式组织项目代码的编译流程，让项目可以在不同的平台编译。

Linux/Mac: CMake 生成 Makefiles， 再可以用 make 生成运行文件

Window: 生成 vs 项目，打开 vs 工程再编译项目生成运行文件。

## Cmake语法

* cmake 的命令由 命令、小括号、参数组成，参数间用空格区分
* 命令是不分大小写的
* '#' 号后被视作注释

## 编译目标介绍

不同平台 CMake 的输出文件不太一样，第一次切换平台会有点懵

| 平台   | 动态链接库                                    | 静态链接库 | 可执行文件 |
| :----- | :-------------------------------------------- | ---------- | ---------- |
| Window | .dll，.lib （如果是 MinGW 则为 .dll，.dll.a） | .lib       | .exe       |
| Linux  | .so                                           | .a         | 无         |
| MaxOS  | .dylib                                        | .a         | 无         |

需要注意的是 cmake 生成的库都会默认在前面添加 “lib”，例如 MacOS 上 `add_library(MyDLL STATIC test.cpp)`就会生成 `libMyDLL.a`。但是在使用途中，可以当作 `MyDLL`使用，也可以使用全称。

## 常用指令

``` cmake
cmake -version  # 查看版本
cmake -help     # 查看帮助，也可以查看 cmake 在当前系统支持的 generator
cmake .         # 在当前文件夹寻找 Cmakelists.txt 并开始生成默认 generator 的 makefile
cmake "generatorName" . # 生成 generator 类型的的 make file
```

## 最基本的一份 Cmakelists.txt

``` cmake
# 指定cmake的最低版本，VERSION 必须大写
cmake_minimum_required(VERSION 3.5)
# 项目名称
project(Demo)
# 用 main.cpp 生成可执行文件 Demo.exe
add_executable(Demo main.cpp)
```

这份Cmakelists.txt 文件放在与 main.cpp 同级文件夹内，然后命令行运行 `cmake .` 即可生成 **MakeFile** 文件。然后继续在此目录下运行 `make` 命令即可。

注意，在 Window 下，需要先安装 MinGW 工具，并且，由于 Window 下是没有 `make` 命令的，需要用 MinGW 自带的 make 工具。安装完 MinGW ，在 `../MinGW/bin/` 下可以找到 gcc.exe，g++.exe，mingw32-make.exe。它们分别是 C 的编译器、 C++ 的编译器以及 Make 工具。所以到最后一步执行 MakeFile 文件使用 `mingw32-make`

## 异常问题

* 以上的 Cmakelists.txt 文件运行会报找不到 gcc 和 g++ 编译器的错误，及时根据 cmake 的提示在 path 中添加也无解。所以需要在 Cmakelist.txt 中手动指定 C 和 C++ 的编译器以及全路径如下：

``` cmake
set(CMAKE_C_COMPLIER C:/MinGW/bin/gcc.exe)
set(CMAKE_CXX_COMPLIER C:/MinGW/bin/g++.exe)
```

* 在使用 `cmake .` 时，可能会提示本地环境无法执行通过测试项目，此时一般是因为此时指定的 Makefile 样式用的是微软的，但我们本地的环境只安装了 MinGW，所以需要通过 `-G` 命令指定 MinGW 识别的 Makefiles。如下 `cmake -G "MinGW Makefiles" .` 即可。
* 在使用完 `cmake -G "MinGW Makefiles" .` 可能还会报 "你的 path 中包含 sh.exe，请先移除"。这个报错一般是指安装 git 带的 sh.exe, 报错提示里会有指明路径，先检查自己的 path 中是否真的存在该路径，如果不存在，则再次运行 `cmake -G "MinGW Makefiles" .` 即可。注意只需自己确认 path 中不存在即可，我本地测试时，及时 path 中不包含，一样会报错，可能是 cmake 的 bug，第二次运行指令是正常的。

## 设置/创建/使用环境变量

``` CMake
# 创建规则 set(name value)
# 设置名为 buildPath 的变量，值为 "./build"
set(buildPath ./build)

# 使用规则 ${name}
# 设置输出可执行文件的路径，其中 EXECUTABLE_OUTPUT_PATH 是 CMake 原有的环境变量路径，改为新增的 buildPath
set(EXECUTABLE_OUTPUT_PATH ${buildPath})
```

同是介绍 CMake 常用的环境变量

| 变量 | 含义 |
|:-|:-|
|PROJECT_SOURCE_DIR | 项目根目录 |
|EXECUTABLE_OUTPUT_PATH| 可执行文件输出目录 |
|CMAKE_C_COMPLIER| C 编译器的路径 |
|CMAKE_CXX_COMPLIER| C++ 编译器的路径 |

## 常用函数

cmake_minimum_required 指定 CMake 的最低版本

include_directories 添加引用头文件路径，注意，该路径优先级是比编译器的高

``` cmake
include_directories(${PROJECT_SOURCE_DIR}/include)
```

add_executable 添加源码编译可执行文件

``` cmake
# add_executable(excuteName srcFiles)
add_executable(Demo main.cpp)
```

## 生成链接库

``` cmake
# 新建参数存放所有源文件 如 LIBHELLO_SRC
SET (LIBHELLO_SRC file1.cpp file2.cpp)

# 设置库为动态链接库，输出名字格式为 lib + MyDLL.so 和 lib + MyDLL.a
add_library(MyDLL SHARED ${LIBHELLO_SRC})
# 设置库为静态链接库，输出名字格式为 lib + MyDLL.a
## add_library(MyDLL STATIC ${LIBHELLO_SRC})

# 修改 MyDLL 输出名字属性，格式为 lib + OtherName.so 和 lib + OtherName.a
SET_TARGET_PROPERTIES (MyDLL PROPERTIES OUTPUT_NAME OtherName)
# 设置库输出路径
SET(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/build/lib)
```

## 添加链接库

``` cmake
# 设置链接库项目路径。dataStruction 项目和本项目同级目录
set(DLL_PROJECT_PATH ${PROJECT_SOURCE_DIR}/../dataStruction)
# 设置链接库头文件路径
include_directories(${DLL_PROJECT_PATH}/include)
# 设置具体链接库路径
link_directories(${DLL_PROJECT_PATH}/build/lib)

# 生成可执行文件
add_executable(${PROJECT_NAME} main.cpp)

# 对输出文件添加名为 Other 的链接库，（MacOS 下实际名为 libOther.dylib，其实输入全称也可以，还有很多名字格式）
target_link_libraries(${PROJECT_NAME} Other)
```

### 注意

几个设置的顺序有一定要求，`add_executable`必须在`target_link_libraries`之前，否则会报错`Cannot specify link libraries for target “test“ which is not built by this project`。

其次`link_directories`必须在`target_link_libraries`之前，否则会报错`ld: library not found for -lXXX`。这个应该顺序不同`link_directories`设置的实际路径会有出入。

所以建议顺序是`link_directories`，`add_executable`，`target_link_libraries`

## 追加编译指令定义

add_definitions 追加编译指令定义，例如当需要指定 gcc 用 c++11 标准时

``` cmake
# 单条编译指令
add_definitions(-std=c++11)

# 多条编译指令，空格间隔
add_definitions(-std=c++11 )
```

target_link_libraries 添加链接库，例如在使用 C++17 以下使用 filesystem

``` cmake
target_link_libraries(excuteName stdc++fs)
```

## 多层依赖构建项目

todo