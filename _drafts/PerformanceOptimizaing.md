[TOC]

# UI 优化

- Draw Call 优化
- Rebuild 优化
- 高频操作优化
- GC 优化
- XLua Unity 交互优化
- 其他





![image-20221107211245698](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221107211245698.png)

Profiler 单帧的 Timeline 基本可以区分为两大块

1. 左半边的逻辑脚本耗时
2. 右半边渲染耗时，每一个相机都会有单独的 Camera.Rendering 块。



这其实是和 MonoBehaviour 的生命周期对得上的

1. Awake / OnStart / OnEnable ...
2. Scene Rendering



Canvas 不同的渲染模式，体现在 Profiler 上函数名会有所区别

* Overlay - UGUI.Rendering.RenderOverlays
* Camera - Camera.Render



## Draw Call 

Draw Call 是理解为 CPU 调度 GPU 的指令。CPU 和 GPU 运作是并行的，CPU 将需要绘制的对象的数据存到命令缓冲区中，GPU 则在缓冲区取命令进行渲染。

每一个 Draw Call CPU 都要准备好配套的渲染数据，包括模型数据，变换数据（旋转，‘缩放），相机位置，Material。若场景里的每一个模型或者 UI 都单独调用一次 Draw Call，CPU 大量的算力都会消耗在这里。并且切换 Material 也是一项高耗时操作。

>  *如果类比为搬家，相当于每次货车每次只拉一件家具。*

在不影响渲染结果的情况下，对同一渲染状态的对象合在一个 Draw Call 中处理，从而达到降低 Draw Call 的目的，也就是动态合批 Dynmic Batch。

> *Draw Call 性能瓶颈一般是在 CPU，但并不是低 Draw Call 就代表高帧率。如果单一 Draw Call 内容过多，会造成带宽繁忙，帧率一样上不去。最好的情况是缓冲区的内容是刚好够 GPU 运行，效率是最高的。但大部分情况下都是 GPU 等待缓冲区的命令。*



### Draw Call 的对比

同一 Canvas，摆放同样数量的元素，通过调整布局，Draw Call 最高和最低效率差距会很大。测试内容：400 个 Image，分别排列成 Draw Call 最低和最高的情况进行 Profile。最低 7，最高 405。

**Low draw call**

![image-20221103001807303](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103001807303.png)

![image-20221103001845587](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103001845587.png)

**Hight draw call**

![image-20221103001733343](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103001733343.png)

![image-20221103001638581](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103001638581.png)



### 如何使用 Dynmic Batch 

这个优化是自动的，这需要 UI 满足几个条件：

1. Material 相同

2. Texture 相同

3. Depth 相同

   

一般情况下，UGUI 元素用的都是同一个 Material，即内置的 Default UI Material，所以 Material 是一致的。

但是 Texture 就不是了，默认情况下都是各类小图资源。为了降低 Draw Call 就需要将小图组装成一张大图，即图集 Altas，这样就满足第二个条件。

第三个条件就需要了解 Depth 的计算方式了



#### Depth 的计算方式

Depth 即深度，是用来描述渲染层级的一个指标。

为了记录正确渲染顺序（遮挡关系），UGUI 会对 Canvas 下的节点依据 Hierachy 顺序，深度优先遍历，为每一个 UI 元素标记上一个深度值 Depth。深度值计算方式如下（Z 轴都为 0 的情况）

![image-20221108094520631](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20221108094520631.png)

> *相交演示*

1. 跳过不渲染节点 Alpha = 0，Scale = 0，Active = false 等
2. 检查 UI 元素前没相交到到其他元素
   1. 没有，Depth = 0
   2. 有
      1. 取相交元素里的最高 MaxDepth，然后判断双方的 Material、Texture：
         1. 同 Material
            1. 相同 Texture，Depth = MaxDepth
            2. 不同 Texture，Depth = MaxDepth + 1

         2. 不同 Material，则 Depth = MaxDepth + 1


获得 Depth 后，再进行升序排序，优先级：Depth Num > Material ID > Texture ID。

最后同 Depth Num & Material ID & Texture ID 的对象就会进行 Dynmic Batch 处理，放在一个 Draw Call 中。

> xxx ID，是指 xxx 对象的 ID。
>



**特殊的，同等深度下，文字的渲染优先级是最先的（它 Texture ID 最小）**。一些图文混排的合批结果，可能并不是最优的，或者和直觉上有出入，就留意这个特殊的设定。

![image-20221103162112481](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103162112481.png)

![image-20221103162201283](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103162201283.png)

![image-20221103162234822](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103162234822.png)

如上，即使是在 Hierachy 下处于最底，依然优先渲染。

> *可以得出另一个结论：根据合批的计算算法，Hierachy 下的顺序并不是最终的渲染顺序。*



**总结**

* 常用的素材打成一张图集
* 如果 Text 节点影响 Draw Call 较大，甚至单独分层

接下来在再对特殊情况情形说明



## Mask/RectMask2D

这两个 Mask 都可是实现遮罩效果，但是 Mask 可以通过指定遮罩图片，实现特殊形状的遮罩。



### Mask

* Mask 以及 Mask 内元素计算 Depth 的方式是和普通 UI 一样的。
* Mask 内外的元素不能进行合批（因为 Material 不一致）

* 不同 Mask 内的元素是可以合批的，前提是 Mask 的 Depth 一致。

  > Depth 是指计算 Draw Call 时的最终深度，并不是指 Hierachy 下的顺序

  还有一点，一般 UI 渲染就一个 Draw Call，而 Mask 是：

  1. Mask
  2. UI in mask
  3. Mask

  可以理解第一个 Mask 在最底和最高各有一个透明的图片

​	所以会出现一个奇怪的情况，两个相同的 Mask（不相交），摆放着一样的内容，如果清空掉一方的内容（仅保留 Mask）， Draw Call 反而会变高。

* 在 Mask 外的元素仍有 Draw Call
* **Mask 下的节点会打断外面的合批**，因为 Depth 的计算方式是一样的。

![image-20221104150133644](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221104150133644.png)

![image-20221104150256931](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221104150256931.png)



### RectMask2D

Mask 外的会被直接剔除，不进入 Draw Call

* 计算 Depth 规则一致，

* Mask 内的元素不能和外面的元素合批，即使是另一个 RectMask2D

* 不会增加额外 Draw Call

* 被 Mask 掉的元素，不会算入 Draw Call。

* Mask2D（在有内容渲染的情况下，被拆剪掉就不算了）在 Hierachy 节点，会切断上下的  Draw Call 合批 （所以，不存在半截 Image 是否会截断外面的合批，因为一定会切断）

  ![image-20221107210303791](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221107210303791.png)



**总结**

|            | 遮罩效果 |                Draw Call                | 负荷点 |
| :--------: | :------: | :-------------------------------------: | :----: |
|    Mask    |   丰富   | 单遮罩 Draw Call 较多，**多遮罩可合批** |  GPU   |
| RectMask2D |   单一   |     **单遮罩较少**，多遮罩不可合批      |  CPU   |

- Mask 通过 Stencil 模板测试的方式实现 Mask 的效果，在使用 Mask 时会修改它节点下的所有 UI 元素 Materail 修改为 Mask 版本。性能负荷会在 GPU 端。

- RectMask2D 则更多是提前对区域内的元素进行裁剪判断，性能负荷会在 CPU 端。

- Mask 可以更好合批，但是会有些额外的 Draw Call，深度测试的 Material 消耗也会比普通的高一些。

- RectMask2D 实现简单，但效果单一，但是直接打断上下层的合批，实际 Draw Call 不一定比 Mask 少。

  

**对于使用选择来说，我认为**：

- RectMask2D 造成的打断合批问题，一般都能够通过调整节点降低其带来的影响。所以在此基础上先判断项目的性能瓶颈位于 CPU 还是 GPU，如果 GPU 比较吃力，就改一些为 RectMask2D 尝试降低压力。*（可能帮助不大）*
- 如果界面上需要同一时间显示 1 个以上的遮罩效果时，Mask 的可以批优势会比 RectMask2D 高。



### Z 轴不为 0

情况暂时略过，即使对照博客和自己的实操结果，Draw Call 的数量也很难确定。毕竟也很少用到。

简单来说，如果用到了，尽量让 Z 轴不为 0 的节点少，包括子节点。



## 动静分离，降低 Rebuild

UGUI 渲染时，会将 Canvas 下的 UI 元素都重新生成一个 Mesh，其中可以合并 Draw Call 的会被整合成 Sub Mesh。如果 Canvas 下需要重建 Rebuild，那就要重新遍历 UI 顶点生成 Mesh。



会导致 Rebuild 的操作：

1. 增 / 删节点，显隐（Active）节点
2. Vertex（移动也算），Rect，Color，Material，Texture ... 变化
3. ~~复杂的层级结构~~（有待确认）

变化会带来的影响：

1. 每次顶点相关的调整（位置，顶点，尺寸）都会影响 Draw Call 的计算，所以需要重新计算 Canvas 下所有元素的 Depth
2. 同理，Material 的变化也会影响 Draw Call 的计算
3. Canvas 是一张大 Mesh，每次顶点相关的调整，都要重新构建
4. 若处于 Layout 组件下，需要重新对所有组件布局 



Canvas 内的元素发生变化时，就会触发 UpdateBatches。从测试上看，动静分离并不能有效减低 UpdateBatches 的耗时，似乎只要触发了，就是就会带来固定的耗时。

![UpdateBatches](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedUpdateBatches.png)

经查验，Canvas Rebuild 会触发 UpdateBatches 下的 BuildBatch。而且耗时相对固定是因为 UGUI 对网格重建的流程进行了优化，将重建的任务交给子线程处理，所以只要子线程的耗时不超过主线程，Rebuild 的带来的耗时**基本可以忽略**。所以 Draw Call 的调优比动静分离的效果更明显。

![image-20221107144801446](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221107144801446.png)

![image-20221107145145237](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221107145145237.png)

> 但是优化还是需要做，降低子线程的压力。在 Draw Call 数量高或顶点数量多的 Canvas Rebuild 耗时也会相应提升，需要注意。



**总结**

- 动静 UI 最好通过 Canvas 分层，降低 Rebuild 的工作量
- Canvas 顶点不宜过多，不同更新频率的 UI 也可以考虑分层
- 减少不必要变化，并考虑能否减低的 UI 更新频率
- 尽可能少用 Outline 组件，它会将原本的文本顶点提升 4 倍
- 降低 Draw Call 也能降低 Rebuild 的压力



## Over Draw

即过度绘制，屏幕上的单个像素点重复绘制的次数越多，性能的压力就越大。

举例，黑色遮罩的弹窗，通常做法是在最底铺一张填满屏幕的半透明黑色底图，上面再放弹窗内容。这种情况下屏幕上的每个像素点起码绘制了两遍。所以 Over Draw 的优化就是尽可能的减少重绘次数。其实 Over Draw 的问题 Unity 已经做了很大一部分优化，例如由近到远渲染，被遮挡的物体就不会绘制。大头还是来源于半透明物体，因为半透明物体是不能被剔除的，他们的渲染效果必须需要层层叠加才能正确显示。

所以，可以做的优化操作：

1. 尽可能少用透明的物品

2. 对于后处理效果，尽可能合并计算

3. UGUI 的 Image 即使 Alpha = 0 也会造成 Over Draw（待定），如果只是用于点击效果，采用 EmptyforRayCast.cs

4. 对于 UI，使用更细致的多边形代替 UGUI 的四边形网格（待定）

   ![image-20221107145145238](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedv2-0b4d473dc02ba271f3b770387686bb12_r.jpg)

5. 减少粒子特效滥用的情况

6. 及时隐藏看不见的界面



我认为，Over Draw 的优化空间并不大。用到半透明效果最多的特效以及 UI，基本都必须使用半透明。UGUI 上使用多边形替换也不太实际，额外顶点导致的消耗也没经过测试。



## 其他

Text 默认值

Raycast Target 默认不要勾选



同效果，更优方案

UI 隐藏通过缩放处理

减少不必要的操作 

SetParent

SetNativeSize





待定问题

一帧的事情一帧做，但是在低端机中，或者在进行真机 Profiler 时（Profiler 会严重拉低游戏的性能表现），Render Thread 会跨帧。即这一帧内 CPU 前一部分运算都完成了，还需要等 GPU 把上一帧的工作完成。

UI 隐藏的做法

Cavans Group 设置为 0

带宽问题（TileBase 架构）





## Rerference

https://zhuanlan.zhihu.com/p/103612944

https://www.cnblogs.com/zhaoqingqing/p/4623839.html

https://www.bilibili.com/read/cv13697715/

https://edu.uwa4d.com/lesson-detail/126/482/0?isPreview=false

https://blog.csdn.net/cyf649669121/article/details/83142903
