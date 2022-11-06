瓶颈确认

DrawCall 调整

调试手段



XLua 优化



GC 优化



同效果，更优方案

UI 隐藏通过缩放处理

减少不必要的操作 

SetParent

SetNativeSize



Canvas 不同的渲染模式，在 Profiler 上归属的函数名会有所区别

* Overlay - UGUI.Rendering.RenderOverlays
* Camera - Camera.Render



Profiler 单帧的 Timeline 基本可以区分为两大块

1. 左半边的脚本耗时
2. 右半边渲染耗时

这其实是和 Unity Monobehaviour 的生命周期对得上的

1. Awake / OnStart / OnEnable ...

2. Render

   

https://zhuanlan.zhihu.com/p/103612944

https://www.bilibili.com/read/cv13697715/



**测试内容**

400 个 Image，分别排列成 Draw Call 最低和最高的情况进行 Profile。最低 7，最高 405



**Low draw call**

![image-20221103001807303](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103001807303.png)

![image-20221103001845587](/Users/huangzhuofu/Library/Application Support/typora-user-images/image-20221103001845587.png)



**Hight draw call**

![image-20221103001733343](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103001733343.png)

![image-20221103001638581](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103001638581.png)



结论：

不同于脚本，DrawCall 的带来的性能影响无法拆分成单个分析。但是还是能比较容易观察高 DrawCall 整体带来的耗时提升（**UGUI.Rendering**），由 **0.015ms** 上升至 **0.263ms**。

但是依照预测，仅仅渲染图片的情况下，提升 DrawCall 引起的性能瓶颈应该会体现在 CPU 端（Main Thread）。实际却是 Render Thread 端整体耗时变化明显。

另外，一帧内 Main Thread 和 Render Thread 的流水线来看，会分成两部分进行渲染，分别对应游戏内的 Main Camera 和 UI Camera。



一些图文混排的合批结果，可能并不是最优的，或者和直觉上有出入。这里需要留意一个额外的设定

**同等深度下，文字的渲染优先级是最先的。**

![image-20221103162112481](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103162112481.png)

![image-20221103162201283](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103162201283.png)

![image-20221103162234822](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221103162234822.png)

如上，即使是在 Hierachy 下处于最底，依然优先渲染。

可以得出另一个结论：由于 Draw Call 和合批的存在，Hierachy 下的顺序并不是最终的渲染顺序。



Z 轴不为 0 的情况暂时略过，即使对照博客，Draw Call 的数量也很难确定。毕竟也很少用到。



## Mask/RectMask2D

这两个 Mask 都可是实现遮罩效果，但是 Mask 可以通过指定遮罩图片，实现特殊形状的遮罩。



### Mask

* Mask 以及 Mask 内元素计算 Depth 的方式是和普通 UI 一样的。
* Mask 内外的元素不能进行合批

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

![image-20221104150133644](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20221104150133644.png)

![image-20221104150256931](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20221104150256931.png)



### RectMask2D

Mask 外的会被直接剔除，不进入 Draw Call

* 计算 Depth 规则一致，
* Mask 内的元素不能和外面的元素合批，即使是另一个 RectMask2D
* 不会增加额外 Draw Call
* 被 Mask 掉的元素，不会算入 Draw Call。
* Mask2D（在有内容渲染的情况下，被拆剪掉就不算了）在 Hierachy 节点，会切断上下的  Draw Call 合批 （所以，不存在半截 Image 是否会截断外面的合批，因为一定会切断）



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

- RectMask2D 造成的打断合批问题，一般都能够通过调整节点减低其带来的影响。所以在此基础上先判断项目的性能瓶颈位于 CPU 还是 GPU，如果 GPU 比较吃力，就改一些为 RectMask2D 尝试降低压力。*（可能帮助不大）*
- 如果界面上需要同一时间显示 1 个以上的遮罩效果时，Mask 的可以批优势会比 RectMask2D 高。



## 动静分离，降低 Rebuild

会导致 Rebuild 的操作

1. 增 / 删节点，显隐（Active）节点
2. Vertex，Rect，Color，Material，Texture ... 变化
3. ~~复杂的层级结构~~（有待确认）



Canvas 内的元素发生变化时，就会触发 UpdateBatches。从测试上看，动静分离并不能有效减低 UpdateBatches 的耗时，似乎只要触发了，就是就会带来固定的耗时。（待定，和）

![UpdateBatches](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedUpdateBatches.png)

测试环境在基本同上，添加了 Sub_Canvas。

分离

![image-20221104005535990](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221104005535990.png)

不分离

![image-20221104005340462](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221104005340462.png)



以上实验结果表明 Canvas 的重绘会对 UI 渲染带来额外的压力，影响的耗时会在 RenderOverlays 上体现，压力的大小也与 Canvas 上的顶点数相关。

> 所以实际项目情况下不会相差这么大，测试环境下是 400+ Image



一帧的事情一帧做，但是在低端机中，或者在进行真机 Profiler 时（Profiler 会严重拉低游戏的性能表现），Render Thread 会跨帧。即这一帧内 CPU 前一部分运算都完成了，还需要等 GPU 把上一帧的工作完成。



## Rerference

https://edu.uwa4d.com/lesson-detail/126/482/0?isPreview=false
