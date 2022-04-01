# AssetBundle管理器

游戏中素材用AB方式加载，但是为了控制内存大小，肯定是要按需加载的，并且及时清除无用素材。

## 加载流程

现有需求，加载一个 AB 为 cube 下的 prefab 预制体，并且 prefab 预制体依赖名为 mat 的 AB。

### 步骤

* 加载总的 AB，然后获取 AssetBunldeManifest（后简称 ABM）。
* 找到 cube 依赖的所有 AB 并加载。
* 加载 cube，并从中实例 Asset，再实例出 GameObject。

代码如下

``` c#
    AssetBundle ab = AssetBundle.LoadFromFile(Application.streamingAssetsPath + "/StreamingAssets");
    AssetBundleManifest abM = ab.LoadAsset<AssetBundleManifest>("AssetBundleManifest");

    // 加载依赖 AB
    foreach (var item in abM.GetAllDependencies("cube"))
    {
        AssetBundle.LoadFromFile(Application.streamingAssetsPath + "/" + item);
    }

    AssetBundle abCube= AssetBundle.LoadFromFile(Application.streamingAssetsPath + "/cube");

    go = abCube.LoadAsset("prefab");
    GameObject cube = Instantiate(go as GameObject);
```

## 卸载

需要注意知道的是，加载素材到实例化，分为三个步骤

1. 加载本地文件为 AB 到 A 内存中， 如 `AssetBundle.LoadFromFile(...)`
2. 从 AB 中实例化素材为 Asset 到 B 内存中， 如 `Object asset = ab.LoadAsset(...)`
3. 用 B 内存的 Asset 实例化预制体，如 `GameObject go = Instantiate(asset) as GameObject`

如此强调内存，是因为后面介绍的四种卸载是在内存释放上有所不同的。

* assetBundle.Unload(false) 释放未被引用的 A 类内存
* assetBundle.Unload(true) 释放所有 A 类以及 B 类内存
* Resources.UnloadUnusedAssets() 仅释未被引用的 B 类内存
* Resources.UnloadAsset(object asset) 指定释放 B 类内存
* AssetBundel.UnloadAllAssetBundles(true / false) 同上，不过作用于所有 AB

一般来说，不使用 `AssetBundle.UnloadAllAssetBundles(true)` 和 `assetBundle.Unload(true)`，很危险，会把所有从 AB 加载出来的素材都卸除，就是场景大量物品变紫。

问题：
1. 经测试Unload(false)的作用条件还是很模糊，未被引用是指代码里的引用还是包括实际场景对象上的引用。
2. 看到一些 AB 的加载释放会保存上 AB 被依赖的数量，为什么。直接对所有用 unload(false) 不行吗？