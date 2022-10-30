# 打包流程

---

* 资源分类
  * 分解场景 



Android Studio 对项目进行改名只需将项目的最顶层文件夹改名，Android Studio 即可自动替换新的名字（第二次打开）

Android Studio 输出 APK 的目录名称由 build.gradle 的 productFlavors 段控制，具体如下

``` gradle
// apk 会导出到项目 build/outputs/apk/yyxxft_huawei 下
android {
	// ... other
    productFlavors {
    	yyxxft_huawei {

		}
	}
	// ... other
}
```





生成 KeyHash，首先需要准备两样工具。

* keytool 来自 JDK 工具，可以从  [Oracle](https://www.oracle.com/java/technologies/javase-downloads.html) 下载。

  安装完毕后 Window 下会在 `C:\Program Files\Java\jdk-16\bin`下

  MacOS 下会在 

* openssl 可以从这里下载

  *  [OpenSSL for Windows](http://gnuwin32.sourceforge.net/packages/openssl.htm)

然后打开终端，定位到 keytool 的目录下（如果 keytool 已经再 Path 中，就不需要），输入以下指令。这里需要用到项目的 **xxx.keystore** 和配套的密码，再结合项目别名 `alias`，我这里是 qyj2，就能生成项目的 KeyHash。

``` shell
keytool -exportcert -alias qyj2 -keystore "H:\publish\Android\sdk\qyj2.keystore" | "H:\Download\openssl-0.9.8h-1-bin\bin\openssl" sha1 -binary | "H:\Download\openssl-0.9.8h-1-bin\bin\openssl" base64
```

结果如下：![KeyHashExample](img/KeyHashExample.png)



运营有时候还需要证书指纹，步骤差不多

``` shell
#证书指纹
keytool -list -v -keystore  "H:\publish\Android\sdk\qyj2.keystore"
```

结果如下：![KeyHashExample](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/FingerPrint.png)

## 项目结构

### Mono

![MonoProject](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/MonoProject.png)

### IL2Cpp

![IL2CppProject](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/IL2CppProject.png)

## 目录说明

大概说下每个目录的功能

* libs：Unity 导出项目**生成**的 unity-classes.jar + 从项目内的 Plugins 目录下的**复制**过去的 .jar 包
* assets：bin/Data 存放项目的所有资源文件例如 dll（脚本会打成 dll），resource 下的所有资源。同时 assets 也是`Application.streamingAssetsPath`的根目录
* jniLibs (Java Native Interface Library)：Unity **生成的** .so + 从项目内的 Plugins 目录下的**复制**过去的 .so 包。子目录下的细分目录，用于适配不同位数和架构的 cpu 文件。
  * arm64-v8a：arm 架构 64 位
  * armeabi-v7a：arm 架构 32 位
  * x86：模拟器上使用的 32 位
* AndroidManifest.xml：安卓项目清单，后续主要修改一些权限。
* build.gradle：gradle 构建配置
* proguard-unity.txt：代码混淆配置
* local.properties：当前项目的本地 sdk，ndk 路径。如果和 android studio 全局配置不一致才会有数据。

### Mono 和 IL2Cpp 项目区别

* Mono：`assets/bin/Data/Managed` 会存放项目的 dll，jniLibs 下会存放 libmono.so
* IL2Cpp：没有 dll 文件，jniLibs 下会存放 libil2cpp.so
* Unity 生产成的 libmono.so，libmain.so，libunity.so，libil2cpp.so 这几个文件，是会因为项目变动改变的，有变动要注意更新。



### 打包问题总结

**System.NotSupportedException: No data is available for encoding 936**

编码问题，常见于打包后，exe 解码中文编码 gkb 的问题时报错。出现的情况很多，我们是出现在对压缩文件进行解压的时候报错。网上的解决方案是将同版本 Unity Editor 安装目录下的 I18N.CJK.dll，I18N.dll，I18N.West.dll 的复制到 Assets 下任一目录。

首先，对于网上的方案尝试避免，毕竟要引入几个 dll，能不加就不加。所以分析问题：出现问题是解压的时候，对本地进行排查只可能是 Window 系统下，zip 对文件名压缩使用的是 gkb 编码（因为压缩文件是 LuaJIT，内容方面是单纯的字节码。）找不到压缩文件名使用 utf-8 的方法，暂时放弃。

避免无解，引入 dll 解决。

实际实际上安装目录下的 dll 有非常多个版本，如果版本不对 Unity 就会报错

**Loading assembly failed: Assets/I18N.dll reason: File does not contain a valid CIL image**

解决办法是，使用 unityjit 下的版本

> 还有个 unityaot 的版本，不知道区别在哪



## Gradle 语法

## AndroidManifest.xml

## 常见问题

##### Program type already present: AndroidAPIChecker

![image-20220117215657659](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220117215657659.png)

该错误意思是项目内重复依赖了 **AndroidAPIChecker**。网上寻找的解决方法都是说：包直接依赖重复了，调整重复依赖项。但是 AndroidAPIChecker 是项目内部创建的类，不可能被其他包重复依赖。

![image-20220117220205062](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220117220205062.png)

全局搜索都没找到重复定义的地方，于是开始逐步排查我做过的操作：

1. Unity 导出 Android project **A**
2. Checkout SVN 上原有的 Android project **B**
3. 将 A 新增的 `libs/`，`jniLibs/`等新增文件导入到 **B**，因为 **B** 是接了 SDK 的工程，我要增添功能到里头。

幸运的是，在 libs 这一步就发现了问题，libs 下存在一份 sdk-classes.jar，打开一看，竟然一份一摸一样的 AndroidAPIChecker

![image-20220117221128470](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220117221128470.png)

删除后正常，但是为什么会出现呢？待查





## MacOS 打包问题总结

本来想记录 MacOS 直接 Unity 打包遇到的问题，但是问题太多了，遂放弃。

**总结不要直接在 Mac 平台上直接打 apk，一堆问题。导出 project 再由 android studio 打包。**
