# VS code + CMake + WSL

使用 VS code 打造一个轻量级的且规范的 C++ 环境

* vscode 轻量且跨平台
* CMake 大型项目管理必备工具，尝试上手
* WSL window 下搭配 vscode 的神器。轻量且方便调试，无需再安装虚拟机

VScode 需要安装以下插件

* C/C++
* CMake
* CMake Tools : 项目构建，运行工具
* Remote - WSL ：连接 WSL


## WSL 配置

首先安装 WSL，完毕后安装所需工具

``` bash
# 先更新
apt install update
# 或
apt-get update

# 安装编译、调试工具
apt install gcc
apt install gdb
apt install cmake

apt install git
```

当安装了 WSL 重新打开 vscode，可以发现左下角有了变化。可以通过点击它打开 WSL 的文件夹。

如果你事先安装了以上提到的 vscode 工具，此时需要重新安装一次在 wsl 中。点击 vscode 的插件页面，点击 intall in wsl 即可。完毕后会在当前用户界面生成一些 vscode 的文件，注意不要删掉，不然所有 vscode 搭配 wsl 的功能都无法使用了。

当需要将 window 的数据转到 wsl 中需要在 wsl 中使用指令复制。window 的路径在 `/mnt/window`。不能在 window 直接复制文件到 wsl 的文件夹。

## CMake 配置

此时可以通过 `Ctrl + Shift + P` 或者 `F1` 调用命令栏，输入 `CMake` 后找到 CMake tool 预制的一系列 task。比较有用的有

* quick start 当前目录快速生成一份可运行的 CMakeLists.txt 和 main.cpp
* build 通过 CMake 构建当前项目
* run 重新构架且运行可执行文件
* debug 通过 CMake debug 项目，如果直接用 c++ 插件的 debug 很容易会报错，因为 c++ 插件会调用和 CMake 不一致的编译参数，导致后文件无法找到的问题。

总之统一使用 CMake 插件进行操作。

这些选项在左下角的状态栏中也能找到。

CMake tool 的运行需要选择构建工具链，在左小角可以点击 kit 进行选择。其实就相当于 CMakeLists 中设置编译器，不过会被隐藏掉。需要选择 wsl 中的 g++，此时列表中可能会包含 Window 中 MingGW 的 g++，记得不要选错。

## C++ 插件

最后才是 C++ 插件，需要区分清楚。CMake Tool 只是用来构建且编译项目的，C++ 插件则是代码显示高亮和跳转。就会存在项目里看着没有问题的代码段，编译时候可能就报错了，就是由于 CMake tool 和 C++ 插件配置不一致。包括

* 编译标准 c++11 还是 c++17
* 头文件路径

为了保持一致，c++ 插件提供的配置功能从第三方获取，这就可以设置 CMake tool 的配置导出到 C++ 插件中。诸如头文件路径和编译路径都可以在 CMakeLists 指定一次后即可。

当选用由 CMake tool 提供插件配置时，有时候新增的文件引用显示不正确或则报错，build 一下就好了。