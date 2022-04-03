```
pattern = rf"{name}(.cs)? (.+)"
```

现有以下需求

first pass
    base
        appDriver

        BASE_PREDEFINE 内容较少
        LayerDefine.cs 内容较少
    
    Misc 杂项
        GC_OPT 内容较少
        IxBaseFunc Editor 相关
        IxEncryptDecryptTool 加密解密工具
        IxFileFunc 文件管理
        IxNodeTraveler 工具，偏editor
        IxURL 资源接口
        ResourcesUtil 简单，偏editor, 资源，资源枚举

匹配这些脚本的后面那注释，如果使用

```
pattern = rf"{name}(.cs)? ([\s\S]+)\n"
    match_item = re.search(pattern, file1, flags=re.I)

```

会匹配到文件尾巴

```
这样才行
pattern = rf"{name}(.cs)? (.+)"
```

原因是什么

关于匹配模式的选择 https://blog.csdn.net/zqxnum1/article/details/52087642