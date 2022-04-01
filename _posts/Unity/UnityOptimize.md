# Unity Optimize 游戏优化

## 内存优化

* 对象池
* 纹理压缩
* 模型顶点优化：
  * AssetImported 载入优化：剔除没必要的数据，可能有切线，碰撞体。也可以选择压缩顶点等等。
  * 美术手动降低顶点数量
  * 规范小模型顶点少于300，可合并 Draw call。
* LOD : 根据模型距离摄像机的距离，使用不同精度的模型，降低渲染负荷。
* MipMap ：用原有贴图，生成不同精度的 8 种贴图，用于不同远近大小的模型上，降低渲染负荷。
* 控制 AB 占用内存，不需要时，尽快卸载。
* 单面渲染
* 降低 Draw Call
  * 静态批处理 static batching
    * 能设为静态的物体就设为静态，合并 Draw call。
  * 动态批处理
    * 大量重复出现的物体，尽量将顶点数降低 300 以下，并缩放一致。
  * 尽量重用材质，并将同一个材质用到的纹理设置为同一图集。
* 纹理压缩，按需压缩。
* 少用阴影，反光。减少实时光照，用光照贴图。

### 动态批处理

动态批处理是由 Unity 内存帮我们实现，需要满足一些条件才能使用。

* 最高只支持 900 个顶点的模型
* 当 Shader 中仅用到顶点位置，法线，UV 值这三种属性，批处理仅允许顶点数 300 以下
* 当 Shader 用到顶点位置，法线，UV0，UV1 和切向量，则批处理仅允许顶点数 180 以下
* 同类物品，不同缩放不会合并处理。
* 不同 Material 无法使用

### UI 批处理



### 纹理压缩

由上至下，压缩程度原来越高

* RGBA32 ：含透明通道，质量高，长宽无需求，内存占用大
* RGBA16 : 含透明通道，但是颜色阶梯明显，长宽无需求，内存占用偏低
* RGB16 ：无透明通道，其他同上
* ETC1(RGB) + ETC(Alpha)：用两张 ETC 图替代待 RGB + A，但需要手动写shader支持。长宽可不等长，但需要为 2^n 长度。内存占用低 
* ETC1(RGB)：同上，仅去除了 Alpha 通道
* PVRTC4 ：无透明通道，质量低，长宽需要一致且 2^n，内存占用低

## 逻辑优化

* 降低 GetComponent 的使用次数
* 降低 text 的重绘，即每次赋值前，先判断 string 是否有变。
* 减少字符串 String 的拼接，若需要，可以用 StringBuildero

## Monobehaviour / C# GC 优化

C# 内存管理池分为栈内存和堆内存。栈内存只要用于存储临时变量和值，堆内存则主要用于存储引用对象。栈上内存一般会随着函数的生命周期结束而回收，堆则需要 GC 触发时才遍历判断无用后（递归判断对象无法再被引用到时）再进行回收。所以 GC 的主要针对堆内存的。

当需要再对上存储数据时，步骤如下：

1. 是否有足够的闲余空间，有则直接使用
2. 不存在足够空间，则调用 GC 尝试腾出空间。如果此时已经足够，则使用。
3. GC 后空间仍然不足，则会申请拓展堆内存空间，这一步会缓慢，然后再分配空间用于存储数据。

所以需要避免触发 GC 以及拓展空间的频率。需要注意的是，存储数据的空间是要连续的，GC 会带来**内存碎片化**，会出现的情况是：剩余空间符合需求，但是因为不是连续的，所以一样无法使用，需要申请新的空间，或者将已用空间进行重组。这样 GC 会因为自己的操作，让 GC 进行的更加频繁。

### 降低 GC 带来的影响

1. 减少 GC 自动调用频率
2. 手动控制 GC 的调用时间，避开帧率敏感期

#### 减少 GC 自动调用

* MonoBehaviour 中的 Update，FixedUpate，LateUpdate和协程这种没帧都会执行的函数中，尽量减少创建引用对象，而使用缓存。

``` C#
// before
private void Update()
{
    List<int> l = new List<int>();
    // do something with l
}

// Optimize
private List<int> l = new List<int>();
private void Update()
{
    // do something with l
}
```

* 降低函数的调用次数。在使用函数时，应考虑函数是否有必要没帧调用，这个点出发，又有两种方式:
  * bool 判断执行
  * 间隔执行

``` C#
// 某会产生 GC 的函数
private void Func() { ... }

// ---------------------------------
// 假设 Func 的效果只与位置变化有关。
private float cachePos = 0.0f;
private void Upate()
{
    if (cachePos != transform.position.x)
    {
        cachePos = transform.position.x
        Func();
    }
}

// ---------------------------------
// 假设 Func 的效果没必要每帧执行
private float waitTime = 5.0f;
private float curTime = 0.0f;
private void Upate()
{
    curTime += Time.deltaTime;
    if (curTime > waitTime)
    {
        curTime = 0.0f;
        Func();
    }
}
```

## 参考文档

https://www.cnblogs.com/zblade/p/6445578.html



对象池

对于频繁生成和销毁的对象，使用对象池可以有效降低内存占用。现在对 Unity GameObject 对象回池的操作做性能对比，操作对象为一般背包格子，节点数 18，业务中会改到组件都一般为 Text，Image，Rectransform

```C#
public GameObject targetItem;
public GameObject oriTargetItem;
private List<GameObject> Items = new List<GameObject>();
public int testCount = 0;

private void Test()
{
    List<GameObject> Items = new List<GameObject>();
    int testCount = 1000
    // default
    for (int i = 0; i < testCount; ++i)
    {
        GameObject go = Instantiate(targetItem, this.transform, false);
        Items.Add(go);
    }
}
```

**创建 1000 个用时：0.75s，内存占用：36.45m**

同等量级下，对已创建的格子进行 Reset，仅操作 RectTranform

```
...
{
	// Reset
    int index = 0;
    for (int i = 0; i < Items.Count; ++i)
    {
        SynNode(Items[i].transform, oriTargetItem.transform);
    }
}

private void SynNode(Transform dirty, Transform template)
{
    RectTransform d;
    RectTransform t;
    int childCount = dirty.childCount;
    for (int i = 0; i < childCount; ++i)
    {
        d = template.transform.GetChild(i) as RectTransform;
        t = dirty.transform.GetChild(i) as RectTransform;
        d.anchoredPosition3D = t.anchoredPosition3D;
        d.sizeDelta = t.sizeDelta;
        d.anchorMin = t.anchorMin;
        d.anchorMax = t.anchorMax;
        d.pivot = t.pivot;
        d.localRotation = t.localRotation;
        d.localScale = t.localScale;
        if (d.childCount > 0)
        {
            SynNode(d, t);
        }
    }
}
```

**用时：0.04s，内存占用：36.47m，耗时降低：94.7%**

```C#
private void Pool()
{
    int index = 0;
    for (int i = 0; i < Items.Count; ++i)
    {
        SynNode(Items[i].transform, oriTargetItem.transform);
    }
}

private void SynNode(Transform dirty, Transform template)
{
    SynRectTransform(dirty as RectTransform, template as RectTransform);
    SynRawImage(dirty.GetComponent<RawImage>(), template.GetComponent<RawImage>());
    SynButton(dirty.GetComponent<Button>(), template.GetComponent<Button>());
    SynImage(dirty.GetComponent<Image>(), template.GetComponent<Image>());
    SynText(dirty.GetComponent<Text>(), template.GetComponent<Text>());

    int childCount = dirty.childCount;
    for (int i = 0; i < childCount; ++i)
    {
        SynNode(dirty.GetChild(i), template.GetChild(i));
    }
}

private void SynRectTransform(RectTransform dirty, RectTransform template)
{
    dirty.anchoredPosition3D = template.anchoredPosition3D;
    dirty.sizeDelta = template.sizeDelta;
    dirty.anchorMin = template.anchorMin;
    dirty.anchorMax = template.anchorMax;
    dirty.pivot = template.pivot;
    dirty.localRotation = template.localRotation;
    dirty.localScale = template.localScale;
}

private void SynImage(Image dirty, Image template)
{
    if (dirty == null || template == null)
    {
        return;
    }

    dirty.sprite = template.sprite;
    dirty.color = template.color;
    dirty.raycastTarget = template.raycastTarget;
    dirty.enabled = template.enabled;
}

private void SynButton(Button dirty, Button template)
{
    if (dirty == null || template == null)
    {
        return;
    }

    dirty.interactable = template.interactable;
    dirty.enabled = template.enabled;
}

private void SynRawImage(RawImage dirty, RawImage template)
{
    if (dirty == null || template == null)
    {
        return;
    }

    dirty.texture = template.texture;
    dirty.color = template.color;
    dirty.enabled = template.enabled;
}

private void SynText(Text dirty, Text template)
{
    if (dirty == null || template == null)
    {
        return;
    }

    dirty.text = template.text;
    dirty.color = template.color;
    dirty.raycastTarget = template.raycastTarget;
    dirty.enabled = template.enabled;
}
```

**用时：0.71s，内存占用：36.47m，耗时降低：5.7%**

可能是大量 GetComponent 操作带来的耗时增加，项目中是使用的脚本会对组件进行缓存，结合这点进行优化

```C#
private void Pool_UIBinding()
{
    int index = 0;
    for (int i = 0; i < Items.Count; ++i)
    {
        UIBinding template = oriTargetItem.GetComponent<UIBinding>();
        UIBinding dirty = Items[i].GetComponent<UIBinding>();
        for (int j = 0; j < dirty.NodesCount(); ++j)
        {
            UnityEngine.Object obj = dirty.QueryNodeIndex(j);
            string tag = obj.name.Substring(0, 3);
            switch (tag)
            {
                case UIBinding.TAG_NEG:
                    SynGameObject(obj as GameObject, template.QueryNodeIndex(j) as GameObject);
                    break;
                case UIBinding.TAG_IMG:
                    SynImage(obj as Image, template.QueryNodeIndex(j) as Image);
                    break;
                case UIBinding.TAG_BTN:
                    SynButton(obj as Button, template.QueryNodeIndex(j) as Button);
                    break;
                case UIBinding.TAG_TXT:
                    SynRawImage(obj as RawImage, template.QueryNodeIndex(j) as RawImage);
                    break;
                case UIBinding.TAG_RMG:
                    SynRawImage(obj as RawImage, template.QueryNodeIndex(j) as RawImage);
                    break;
            }

            if (obj as MonoBehaviour)
            {
                SynRectTransform((obj as MonoBehaviour).transform as RectTransform, (template.QueryNodeIndex(j) as MonoBehaviour).transform as RectTransform);
            }
        }
    }
}
```

**用时：0.096s，内存占用：36.49m，耗时降低：87.2%**



虽然重置 Rectransform 进行了查找子节点，类型转换，属性值拷贝多个操作，耗时也相对预创建新 GameObject 有着显著的降低。可以猜想即使暴力补充上了 Image 和 Text 的还原操作，耗时不会增加太多。

Todo: 补充还原 Image 和 Text  的数据。

所以，GameObject  回池还原可以分为几种

1. 暴力还原，遍历所有节点和组件
2. 记录改变过的节点，只针对改过的进行还原
3. 半暴力还原，随着业务进行，逐步补充业务可能中会修改的节点，即使该对象的生命周期内没走修改某个组件的属性。



无用节点全部**隐藏**，耗时：0.65 ，内存占用：36.9，耗时降低：13%，内存降低：略

无用节点全部**删除**，耗时：0.19，内存占用：6.14，耗时降低：75%，内存降低：83%



## SetActive 和 SetEnable

