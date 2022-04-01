# AssetDatabase.GetAssetPathsFromAssetBundle("Bundle名称");
只能在#if_UNITY_EDITOR环境下使用。因为这个时候的Bundle只是普通的文件，并没有被打包。得到的是多个**相同Bundle名称**的文件路径。(所以Bundle名称不重复很重要哦)

# 关于Bundle加载及卸载的问题

## 加载

1. 通过AssetBundle.LoadFromFile或者www读取的Bundle，本身只是一个镜像文件(从磁盘->内存)。**(可在profile->Memory-> (Simple切换到Detialed)Not Saved下查看)看不到的话记得点Take Sample:Editor刷新**。

2. 通过镜像文件本身的Bundle.LoadAsset<T>(**预设体名字或者文件本身名字**)，这个时候会将prefab本身引用的全部素材(贴图，纹理之类)以及prfab本身加载到内存中。
(**生成的Bundle名字本身就是设置的Bundle名字，并不是文件本身的名字比如我有一个PrefabTest的预设，但是设置的Bundle名字是prefab，那么生成的Bundle文件名字就叫做Prefab，但是在LoadAsset的候，需要传递的是PrefabTest预设体名字，而不是Prefab,所以最好是预设的名字跟Bundle的名字保持一致(后缀应该只是做一个文件类型的区分,并没有看到有什么卵用)**)

3.  manifest文件本身记录
    1. ManifestFileVersion:算是一种版本号
    2. CRC:可能跟唯一GUID一样
    3. Hashed:
    4. AssetBundleManifest 依赖关系


# 操蛋依赖加载
  var manifestBundlePath = Application.dataPath + @"\..\Bundles\Bundles";
  **这边的路径问题也很操蛋,因为不能作为Asset的子文件,因为会生成.meta文件,那么只能是跟Asset本身同级的路径,加载的时候Application.dataPath本身获取的是Asset子文件的路径,需要返回上一级才能加载Bundle**
  
  var manifestBundle = AssetBundle.LoadFromFile(manifestBundlePath);
  var apendenciesBundle = manifestBundle.LoadAsset<AssetBundleManifest>("**AssetBundleManifest**");
  var allApendenciesBundle = apendenciesBundle.GetAllDependencies("需要加载的依赖项的Bundle名字");
  **AssetBundleManifest**这个名字是固定的.依赖关系,需要加载的就是加载总的Bundle,以上,Bundle就是Bundles文件夹中的Bundles文件.然后通过返家的AssetBundle加载Manifest,这个名字特么的就是**AssetBundleManifest**,是个固定值.MMP!

``` C#
for (int index = 0; index < allApendenciesBundle.Length; index++)
{
    AssetBundle.LoadFromFile(Application.dataPath + @"\..\Bundles\" + allApendenciesBundle[index]);
}
```

依赖的加载跟Bundle的加载方式一样,但是获取到的只是一个Bundle的名称,所以要注意文件的路径.

**依赖的加载可能有性能的问题?(按说Hash类型的加载应该查找速度是1才对)**

## 卸载
