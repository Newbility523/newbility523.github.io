Sprite Renderer 和 UGUI Image

参考 https://blog.csdn.net/coffeecato/article/details/78536488

大体来说 Sprite Render 在会根据素材生成尽可能小的网格，剔除完全透明的区域，顶点数多，而 Image 则是直接的用矩形网格，只有四个顶点。

最直接的影响就是，Sprite Render mesh 顶点渲染压力会比 Image 来的高一些。但是渲染的大头在于片元，更少的渲染像素会更加有优势，尤其是在移动设备。

