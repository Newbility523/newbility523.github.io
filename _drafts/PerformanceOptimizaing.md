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

