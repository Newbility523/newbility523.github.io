# AssetBundle打包详解

* 设置assetbunlde名
* 使用UnityEdior.BuildPipleline.BuildAssetBundles( )对设置AB名的素材进行打包输出

步骤很简单，但是第二部有较多的设置选项，逐一解释

## AB打包结果详解

通过BuildAssetBundles打包会得到三种类型文件，一种AB名的文件且无后缀名，二AB名的.manifest文件，第三个最重要，一个总的AB名称文件且无后缀名，以及对应的.manifest文件。这个文件的名称为BuildAssetBundle的输出文件夹名称。

其中无后缀名的文件为二进制文件，就是素材的本身。而对应的.manifest文件就是清单。描述着该AB素材和依赖的关系，但是总的manifest和细分的manifest描述的内容也区别。

总manifest下会列出所有的AB名称，以及每个AB的依赖包（直接依赖）。

细分manifest则会在Assets下列出该AB包含的所有素材（相对项目路径），Dependencies下列出改AB包的依赖包路径（直接依赖+绝对路径）

在分析AB包的依赖关系时，发现一个疑点如果一个gameObject包含另一个gameObject，且两个gameObject分别有AB名称，manifest不会有这个gameObject之间的依赖关系。换句话说依赖只用来描述材质，贴图，网格方面等素材的关系。

### BuildAssetBundleOptions

* None - 不指定
* UncompressedAssetBundle - 构建AB时，不进行压缩
* DisableWriteTypeTree - AB中不带类型信息
* DeterministicAssetBundle - 确保素材Hash/CRS正确
* ForceRebuildAssetBundle - 强制重新构建AB
* IgnoreTypeTreeChanges - ?
* AppendHashToAssetBundleName - 在AB名后加入hash值
* ChunkBasedCompression - 采用chunk-based LZ4压缩方式构建AB
* StrictMode - 任何构建AB的报错终止AB构建
* DryRunBuild - ?
* DisableLoadAssetByFileName - ?
* DisableLoadAssetByFileNameWithExtension - ?

注意，上面的设置都是影响无后缀名的AB文件，而不是manifest。当打算换一种名称格式时，建议将之前的AB全删了，构建新AB**不会**把之前的覆盖。

构建AB时发现同名的素材不会报错，在加载同名素材时，会加载manifest中的靠前的。虽然不报错，但这种情况是必须避免的，因为加载素材会与预期不符。

指定None时，会使用什么设置呢

* 压缩 : 一种比ChunkBaseCompression更小的压缩方式。

## AB加载

### window

### 更新方案

Unity中有三个用于处理素材的文件夹

* StreamingAssets - 只读
* persistentDataPath - 可读可写
* cachePath - ？
* Resources - 只能用Resource提供的函数读取

由于StreamingAssets目录只读的原因，下载的资源会放在persistentDataPath中，更新资源后，两个目录下的资源相对路径时一致的，游戏中加载AB时需要优先判断persistentDataPath中是否存在，不存在则访问StreamingAssets中的素材。

1. AB会打包进StreamingAssets目录，并附带两个版本文件，总的AB的版本号，所有AB的Hash列表。
2. 每次运行游戏，访问素材服务器，比较总的AB包版本号，当发现较旧时，下载服务器的AB Hash列表与本地的对比（每次开游戏，先确认persistentDataPath中存在这两个版本信息，不存在就用StreamingAsset保存一遍）
3. 当确认需要更新后，对比每一个AB的Hash值，存在变动就直接覆盖/创建素材到persistentDataPath下对应的文件夹，每次更新一个AB就要更新存储一次Hash版本文件，防止中途掉线时丢失已经更新的记录。

素材的版本标志也可使用CRC，用BuildPipeline.GetCRCForAssetBundle()获取，因为发现无法用Unity自带的方法活动StreamingAssets的Hash值。。。

### 需要注意的问题

1. 要知道不同平台的AB是不同的，所以构建AB没有选择对应的发布平台，就会无法获取AB。所以需要在`BuildPipeline.BuildAssetBundles()`指定平台，当前PlayerSettting面板中激活的平台可以用`EditorUserBuildSettings.activeBuildTarget`获得。
2. 我们需要用Hash/CRC作为素材的版本标志，就需要`BuildPipeline.BuildAssetBundles()`使用`BuildAssetBundleOptions.DeterministicAssetBundle`模式，能确保打出的素材Hash/CRC唯一且正确。
3. 对于StreamingAsset下的文件，建议统一用`Application.StreamingAssetsPath`访问，这个接口解决平台差异性的问题。

``` C#
// pc
Appliction.StreamingAssetsPath = Application.dataPath + "/StreamingAssets";

// Andorid
Appliction.StreamingAssetsPath = "jar:file//" + Application.dataPath + "!/assets/";

```

4. 在Android下，StreamingAssets文件夹是只读的，而且用C#的IO访问都是直接读取都是无效的（因为被压缩过），如用`File.exist()`判断文件是否存在，结果永为不存在。所以只能用`WWW`类加载，通过它的error判断。实在想用IO访问也行，但需要自己处理压缩问题，`WWW`则全都帮你做好。

5. 一开始打算用`StreamingAssetsPath`配合`persistenDataPath`加载素材，为了减少软件占用的存储容量。但是这样一来，判断AB的存在位置可能就会有一定的延迟，因为`StreamingAssetsPath`需要通过`WWW`尝试加载，有一定的延迟。所以考虑将`StreamingAssetsPath`下的素材，统一复制一次到`persistenDataPath`下加载，这两种方式的包体大小一样的。

## 几种加载对比

纯 WWW，一种很方便的远程加载接口，无论是本地数据加载还是远程数据加载都很方便，提供 URL 并通过协程等待完成，就能从 www 对象中获取需要的 text、texture 或者 assetBundle。

但对于 www 加载 texture 有个问题，但凡通过 www 获取的 texture 无法获取源素材。意思就是 www.texture 无法通过 `resource.unloadAsset()` 卸载，及时 `www.dispose(); www = null` ，只能 `resource.UnloadUnusedAssets` 非常不灵活，建议不是用该方法加载 texture。

UnityWebRequest (取代)