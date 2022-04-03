```
AssetPostprocessor
```

```C#
OnPostXXXX 方法用处处理
```

处理流程

1. Unity 导入素材后
2. OnPreprocessAsset
3. OnPreprocessXXX
4. OnPostprocessXXX
5. OnPostprocessAllAssets

#### OnPostprocessAllAssets

任何一批素材处理完毕后的回调，功能很好理解，唯一疑点：根据文档说明参数 movedAssets、movedFromAssetPaths 内容是一致的......

### 注意

* 素材导入属性设置要在 OnPreprocessXXX 处理，OnPostprocessXXX 则是处理被 OnPreprocessXXX  处理完的素材内容。例如 `OnPreprocessTexture`里处理了压缩方式，则`OnPostprocessTexture(Texture2D texture)`收到的是经过压缩后的素材，可以再 OnPostprocessTexture 调整 texture 像素。
* 对于 assetImporter 或在 OnPostprocess 传入的对象操作无须手动保存
* 修改 AssetPostprocessor 内修改 assetImporter 即使重新保存，也不会重新触发 AssetPostprocessor 的处理
* 多个 AssetPostprocessor 会根据 processOrder 由低到高处理，靠后的收到的素材是前 processor 处理过后的。
* OnPostprocessAllAssets 必须为静态
* 在用命令行调用 Unity 函数时，例如一键打包，AssetPostprocessor 的函数是会和打开 Unity 那样正常处理，同理，如果 Project 存在有新的文件，例如 SVN 修改、更新、删除的文件，都会重新触发 AssetPostprocessor。

#### OnPostprocessAssetbundleNameChanged 修改 ABName 的回调

abName 的修改回调和其他的不太一样，修改 abName 是不会触发`OnPreprocessAsset`、`OnPostprocessAllAssets`等回调。**仅会触发**`OnPostprocessAssetbundleNameChanged `，并且回调内对 abName 的修改是会重新触发回调的，这就有造成**死循环**的可能。以下是测试。

```c#
private void OnPostprocessAssetbundleNameChanged(string assetPath, string previousAssetBundleName,
    string newAssetBundleName)
{
   Debug.Log("OnPostprocessAssetbundleNameChanged");
    
    var importer = AssetImporter.GetAtPath(assetPath);
    if (importer == null)
        return;

    #if Package_PC
            importer.assetBundleName = "abab";
    #else
    if (assetPath.Contains("Prefab"))
    {
        if (i < 10)
        {
            ++i;
            importer.assetBundleName = "Prefab" + i;
        }
    }
    #endif
}
```

![image-20211122145504345](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20211122145504345.png)

Unity 会检测到死循环，并报错。

### 如何重刷 Importer 属性



Texture Import Setting

#### isReadable

如果要使用 texture.GetPixel 之类的接口，需要 isReadable 为 true。若无需求，则应该设为 false（默认也为 false）。因为开启此选项会保存一份未压缩过副本的在内存里。



texture 压缩说明

https://zhuanlan.zhihu.com/p/113366420



