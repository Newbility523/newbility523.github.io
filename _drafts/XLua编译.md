

ndk版本

Unity 需要 r19 其他在(https://docs.unity3d.com/Manual/android-sdksetup.html)

ndk官方全版本下载 https://github.com/android/ndk/wiki/Unsupported-Downloads

xlua 使用的(可以再 .sh 文件中看出)

旧项目 r10e 

xlua 官方最新使用 r15c

xlua 使用的 ndk 版本和 Unity 差距有点大，更具体是新版的 ndk 版本不再使用 `aarch64-linux-android-gcc`，改用 clang，所以如果用新版 ndk，xlua 的构建脚本会找不到这个编译器。



各版本

win

vs2017

android 库需要再 Linux 下编译，选用 Ubuntu

系统工具

sudo apt-get install cmake

sudo apt-get install cmake

sudo apt-get install libncurses5



// 最新 xlua 的 jit 编译缺少 bit 库

sudo apt-get install gcc-multilib

