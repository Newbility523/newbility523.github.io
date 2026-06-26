---
layout: post
title: "Mac 运行 G01 流程记录"
section: dev-tools
topic: macos
tags: ["dev-tools", "macos"]
---

# Mac 运行 G01 流程记录

## Unity 版本

由于苹果编译机已经全是苹果芯片，只有在新版的 Unity 才能跑出原生的芯片性能，所以改用采用最新的 m1 支持版本 2022.3.16。也试过项目规定的 2020.3.33 但是很卡，并且非常容易崩溃



## 打开项目报错

### TexturePacker Dll 报错

```C#
Assembly 'Assets/codeandweb.com/Editor/TexturePackerImporter.dll' will not be loaded due to errors:
Assembly name 'TPImporter' does not match file name 'TexturePackerImporter'
```

将 TexturePackerImporter 改名成 TPImporter 可解决，具体原因未知。



## IPackerPolicy 报错

```C#
public class CustomPackerPolicy : IPackerPolicy
```

IPackerPolicy 已经弃用，CustomPackerPolicy 也没在使用，整个文件注释即可。



## LuaScript 无法正常运行

运行游戏报错，整理下来一共两个原因

1. lua 代码中格式包含特殊字符，需要通过工具先全局清理一次

   安装 dos2unix 工具

   ``` sh
   # LuaScript 下
   find . -type f -print0 | xargs -0 dos2unix
   ```

2. string.format 无法正常输出 nil 参数，导致 xpcall 异常处理函数中也报异常。仅在 Editor 下会出现，所以重写 string.format 规避直接输出 nil。

   ```lua
   -- Function.lua
   -- 不清楚是什么原因，mac 下无法正常用 string.format 输出 nil，如 string.format("%s", nil)
   local origin_string_format = string.format
   string.format = function(pattern, ...)
       if not GameConfig or not GameConfig.isEditor then
           return origin_string_format(pattern, ...)
       end
   
       local argsLenght = select("#", ...)
       local newArgs = {}
       for i = 1, argsLenght do
           newArgs[i] = tostring(select(i, ...))
       end
   
       return origin_string_format(pattern, unpack(newArgs))
   end
   ```



## 登录失败

在unity2022 .1.0a5以后的版本，系统设置默认不支持http请求，只支持https请求。这里选择解开限制 `Edit -> Project Settings -> Player -> Other Settings -> Configuration -> Allow downloads over HTTP`



## 导出

项目接入了 HybirdCLR，所以在 XLua 适配代码生成后，需要接入 HybirdCLR 流程生成 AOT 代码以及热更 Dll。然后再通过 Build 导出 Xcode 工程



### XLua 生成代码失败

生成代码报错 span\<T\> 的 https://github.com/Tencent/xLua/issues/1091，其中还包括一些 EditorOnly 的接口被生成以及 .Net 版本升级带来的问题。最后 gen 中添加配置 

```C#
// 黑名单补充
[BlackList]
public static List<List<string>> BlackList = new List<List<string>>()  {  
	// 2022 版本处理 start
	new List<string>(){"System.Type","IsCollectible"},
	// 2022 Editor only 
	new List<string>(){"UnityEngine.Material", "IsChildOf", "UnityEngine.Material"},
	new List<string>(){"UnityEngine.Material", "RevertAllPropertyOverrides"},
	new List<string>(){"UnityEngine.Material", "IsPropertyOverriden", "System.String"},
	new List<string>(){"UnityEngine.Material", "IsPropertyOverriden", "System.Int32"},
	new List<string>(){"UnityEngine.Material", "IsPropertyLocked", "System.String"},
	new List<string>(){"UnityEngine.Material", "IsPropertyLocked", "System.Int32"},
	new List<string>(){"UnityEngine.Material", "IsPropertyLockedByAncestor", "System.String"},
	new List<string>(){"UnityEngine.Material", "IsPropertyLockedByAncestor", "System.Int32"},
	
	new List<string>(){"UnityEngine.Material", "SetPropertyLock", "System.Int32", "System.Boolean"},
	new List<string>(){"UnityEngine.Material", "SetPropertyLock", "System.String", "System.Boolean"},
	new List<string>(){"UnityEngine.Material", "SetPropertyLock", "UnityEngine.MaterialSerializedProperty", "System.Boolean"},
	
	new List<string>(){"UnityEngine.Material", "ApplyPropertyOverride", "UnityEngine.Material", "System.Int32", "System.Boolean"},
	new List<string>(){"UnityEngine.Material", "ApplyPropertyOverride", "UnityEngine.Material", "System.Int32"},
	new List<string>(){"UnityEngine.Material", "ApplyPropertyOverride", "UnityEngine.Material", "System.String", "System.Boolean"},
	new List<string>(){"UnityEngine.Material", "ApplyPropertyOverride", "UnityEngine.Material", "System.String"},
	
	new List<string>(){"UnityEngine.Material", "RevertPropertyOverride", "System.String"},
	new List<string>(){"UnityEngine.Material", "RevertPropertyOverride", "System.Int32"},
	
	new List<string>(){"UnityEngine.Material", "parent"},
	new List<string>(){"UnityEngine.Material", "isVariant"},
	
	// 2022 版本处理 end
}

#if UNITY_2022_1_OR_NEWER
    static bool IsSpanType(Type type)
    {
        if (!type.IsGenericType)
            return false;

        var genericDefinition = type.GetGenericTypeDefinition();

        return
            genericDefinition == typeof(Span<>) ||
            genericDefinition == typeof(ReadOnlySpan<>);
    }

    static bool IsSpanMember(MemberInfo memberInfo)
    {
        switch (memberInfo)
        {
            case FieldInfo fieldInfo:
                return IsSpanType(fieldInfo.FieldType);

            case PropertyInfo propertyInfo:
                return IsSpanType(propertyInfo.PropertyType);

            case ConstructorInfo constructorInfo:
                return constructorInfo.GetParameters().Any(p => IsSpanType(p.ParameterType));

            case MethodInfo methodInfo:
                return methodInfo.GetParameters().Any(p => IsSpanType(p.ParameterType)) || IsSpanType(methodInfo.ReturnType);

            default:
                return false;
        }
    }

    [BlackList]
    public static Func<MemberInfo, bool> SpanMembersFilter = IsSpanMember;
#endif

#if UNITY_2018_1_OR_NEWER
    [BlackList]
    public static Func<MemberInfo, bool> MethodFilter = (memberInfo) =>
    {
        if (memberInfo.MemberType == MemberTypes.Method)
        {
            var methodInfo = memberInfo as MethodInfo;
            if (methodInfo.Name == "MakeGenericSignatureType" || methodInfo.Name == "IsCollectible")
            {
                return true;
            }
        }
            
        return false;
    };
#endif
```



### Odin 插件报错 

`AmbiguousMatchException: Ambiguous match found`，升级 Odin 至最新版本可处理。



### hybridclr 报错

这是因为你Installer中安装后切换了Unity项目的版本，导致Build Tool不匹配导致。解决办法为在`HybridCLR/Installer...`中重新安装一次即可。

```
Internal build system error. BuildProgram exited with code 2.
System.IO.FileNotFoundException: Could not load file or assembly 'Unity.IL2CPP.Bee.BuildLogic.Android, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null'. The system cannot find the file specified.

File name: 'Unity.IL2CPP.Bee.BuildLogic.Android, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null'
   at AndroidPlayerBuildProgram.AndroidPlayerBuildProgram.MakePlatformBuildLogic(EnvironmentData data)
   at PlayerBuildProgramLibrary.PlayerBuildProgramBase.SetupIl2Cpp(NPath gameAssemblyOutput) in /Users/bokken/build/output/unity/unity/Editor/IncrementalBuildPipeline/PlayerBuildProgramLibrary/PlayerBuildProgramBase.cs:line 311
   at AndroidPlayerBuildProgram.AndroidPlayerBuildProgram.SetupIl2CppIdeCommandLine(Architecture[] architectures, Dictionary`2& arguments, BuildConfiguration& configuration)
   at AndroidPlayerBuildProgram.AndroidPlayerBuildProgram.SetupIL2CPPForExportProject()
   at AndroidPlayerBuildProgram.AndroidPlayerBuildProgram.SetupPlayerBuild()
   at PlayerBuildProgramLibrary.PlayerBuildProgramBase.RunBuildProgram() in /Users/bokken/build/output/unity/unity/Editor/IncrementalBuildPipeline/PlayerBuildProgramLibrary/PlayerBuildProgramBase.cs:line 165
   at PlayerBuildProgramTypeWrapper.Run(String[] args)
   at Program.Main(String[] args)
UnityEngine.GUIUtility:ProcessEvent (int,intptr,bool&) (at /Users/bokken/build/output/unity/unity/Modules/IMGUI/GUIUtility.cs:189)
```





### Dll 生成失败

使用 Unity 工具 `打包/IOS/Build IOS Dll` 会跑 HybirdCLR 的流程并且把更新的 dll 补充元数据生成到 production 目录下，如果没有提前创建 `xxx/Client/production/resources/ios/dll` 目录会报错。



### XCode 项目导出

手动导出 IOS 工程。我这里打都是不更新的包，所以没用已有的 `打包/IOS/导出 IOS 工程`

 

## 打包

macOS xcode 项目编译时，报错`[no matching function for call to 'il2cpp_codegen_write_instance_field_data']`

```C++
CATCH_0023:
	{
		IL2CPP_POP_ACTIVE_EXCEPTION();// Error: expected expression
		goto IL_0028;
	}

```

大概率为 HybirdCLR 问题。可以选择调整 Unity 版本或者 Unity Pack Manager 中更新最新的 HybardCLR，直到 HyberCLR Installer 界面可以看见不兼容警告。再重新跑一次 HybardCLR 流程导出即可。



### 依赖缺失

IOS 端依赖了一部分目标平台的代码，可见 `Extern.IOS.cs` 。补充 SDK 代码到 UnityFramework 中，注意这里仅针对 xcode15 或者 Unity2022 引用对象才是 UnityFramework，其他版本可能有出入。



### duplicate symbol

```
duplicate symbol '_brightness' in:
    /Users/huangzhuofu/Library/Developer/Xcode/DerivedData/Unity-iPhone-ggmsgrsdajeatgfpnexvcsmiuasv/Build/Intermediates.noindex/Unity-iPhone.build/ReleaseForRunning-iphoneos/UnityFramework.build/Objects-normal/arm64/SDKManager.o
    /Users/huangzhuofu/Library/Developer/Xcode/DerivedData/Unity-iPhone-ggmsgrsdajeatgfpnexvcsmiuasv/Build/Intermediates.noindex/Unity-iPhone.build/ReleaseForRunning-iphoneos/UnityFramework.build/Objects-normal/arm64/MyAppController.o
ld: 1 duplicate symbol for architecture arm64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

实际是指 `brightness` 重复

根据 https://forums.developer.apple.com/forums/thread/736590，将 `MyAppController.h` 的 

``` c++
CGFloat brightness;
// 改为
static CGFloat brightness;
```

这个问题可能是高版本的 xcode 或系统才有，如果没出现也正常。



## 游戏运行

IOS 工程目录说明

```shell
IOS 工程目录说明
├── Il2CppOutputProject：IL2Cpp 翻译的 C++ 版的项目代码
│   ├── Source
│   │   └── il2cppOutput：项目代码，会以一个个 dll 为集合
│   └── IL2CPP
├── Classes：Unity 接入 IOS 的代码，都是 ObjC 代码
├── Data：
│   ├── Managed：
│   │   └── Resources：
│   └── Raw：即 StreamingAssets
│       └── resources
│           └── ios
│               ├── dll
│               ├── assetbundle
│               ├── script
│               ├── config
│               └── version.json 
├── Resources:
│   └── unity_builtin_extra
├── MainApp
├── Libraries
└── Plugins：关于 IOS 的库和项目的 sdk 接入代码一些 ios 库，如 bugly，xlua
    └── AgentScript：项目的 sdk 接入代码
```

需要把 resources 的资源都加入 `Raw` 目录下

正式是使用 LuaJITScript64 下的脚本打包 zip 运行，但是要生成 LuaJITScript64 有需要设置 build_lua_jit.py 和环境，所以改用 LuaScript  打包 yyscript_raw_base.zip。

但是 LuaManager 中已经不支持直接使用源码目录加载 Lua 代码，可以取巧将目录名称从 yyscript_raw_base.zip 改为 yyscript64_base.zip 

config 目录中还要补上 GameColorConfig.json





![image-20240301115322539](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedPicBedimage-20240301115322539.png)



安卓

 **Error building Player: Win32Exception**

```
chmod -R g+x /Applications/Unity/2020.3.35f1/PlaybackEngines/AndroidPlayer
```



**Installed Build Tools revision 32.0.0 is corrupted** 

新版 androidStudio 问题吧。

1. In Finder/File explorer, go to Android's `build-tools` folder. In Mac, it's at `/Users/<username>/Library/Android/sdk/build-tools`.
2. Rename `d8.exe` to `dx.exe`
3. Go inside `lib` folder
4. Rename `d8.jar` to `dx.jar`



IOS 证书问题

![image-20250602224756772](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/undefinedimage-20250602224756772.png)

Unity-iPhone has conflicting provisioning settings.

Unity-iPhone is automatically signed, but provisioning profile becfef85-e2d8-4368-9f19-21220891e987 has been manually specified. Set the provisioning profile value to "Automatic" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor.



![image-20250602225703183](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/undefinedimage-20250602225703183.png)

清空上面的设置即可



### 打包出现 Undefined symbols： RuntimeApi_LoadMetadataForAOTAssembly 或 hybridclrApi_LoadMetadataForAOTAssembly[](https://hybridclr.doc.code-philosophy.com/docs/help/commonerrors#打包出现-undefined-symbols-runtimeapi_loadmetadataforaotassembly-或-hybridclrapi_loadmetadataforaotassembly)

根本原因是因为你使用的是原始libil2cpp代码，有几个情形会导致这个结果：

- Scripting Backend 错误选择了 Mono
- 开启了`全局安装`选项，但没有正确替换Editor安装目录的libil2cpp
- com.code-philosophy.hybridclr的版本低于v3.1.0，同时没有替换xcode工程的libil2cpp.a文件。请根据 [build iOS libil2cpp.a](https://hybridclr.doc.code-philosophy.com/docs/basic/buildpipeline) 文档编译最新的。然后替换xcode项目中的libil2cpp.a文件



# unsupported option ‘-mno-thumb‘ for target ‘arm64-apple-ios11.0

![image-20250603010521264](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/undefinedimage-20250603010521264.png)



华佗升级

直接在package manager 通过giturl安装最新华佗，同时在窗口中remove 旧华佗后打包报错。

项目后期会引用华佗的LZ4压缩库，所以移除旧华佗会删掉 LZ4 库。

调整做法把新的华佗整个目录移到 package 目录中，并调整 LZ4 库的生效范围如下图

![image-20250604002654429](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/undefinedimage-20250604002654429.png)



## 华佗版本

测试过没问题版本

https://gitee.com/focus-creative-games/hybridclr_unity.git#v8.1.0

Span更高的可能需要额外处理代码

不同版本华佗会临时资源一致，但目录命名不一致，如果有缓存就会有报错。把旧的目录删了即可。



## 支持Finder/爱思查看文件（可选）

![image-20250701161233113](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/undefinedimage-20250701161233113.png)



语音支持

新增的游密语音sdk，需要补充配置

https://www.youme.im/doc/IMGuideCocosC++.php

![image-20250722115045204](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/undefinedimage-20250722115045204.png)

把红框这批加进![image-20250722115144494](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/undefinedimage-20250722115144494.png)

注意，可能部分已经存在，不要重复添加

只要这一个

![image-20250912181954826](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/undefinedimage-20250912181954826.png)

这两个自带，不用加

![image-20250912182020317](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/undefinedimage-20250912182020317.png)

可能会出现漏了 webkit的情况，也用加号加进来

打点

改成yes

![image-20250912181309714](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/undefinedimage-20250912181309714.png)



打包练习

完全重新打包，并打首包

华佗升级到v5.1
