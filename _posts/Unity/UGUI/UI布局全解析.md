# UI 布局全解析

确认并解决各种适配模式下，一些RectTransform的大小位置控制问题。

先声明各个属性含义

- anchorMax 最大的锚点，由（最大的 X 锚点, 最大的 Y 锚点组成），比例值，范围[0, 1]
- anchorMin 最小的锚点，由（最小的 X 锚点, 最小的 Y 锚点组成），比例只，范围[0, 1]
- pivot 支点/中心点
- anchoredPosition 支点相对于锚点的 2D 坐标
- anchoredPosition3D 支点相对于锚点的 3D 坐标
- sizeDelta 为 RectTransform **边角到锚点的距离和**
- offsetMin 左下角锚点到 RectTransform 左下角的向量
- offsetMax 右上角锚点到 RectTransform 右上角的向量
- rect
  - width 长
  - height 宽

**注意：当锚点不再一起的时候，anchoredPosition 位置会以将当前的锚点，算出一个中心，anchoredPosition 就是新锚点到支点的向量。**

RectTransform 面板几种模式

- X, Y, Width, Height 为支点锚点的向量，和固定的长宽。
- Left, Right, Top, Bottom 为 RectTransform 四边相对于 anchor **内缩**的长度
- Left, Right, OffsetY, Height, 左右边自适应，高度偏移，高度固定
- offsetX, Width, Top, Bottom, 上下自适应，横向偏移，宽度固定

## 获得准确长宽

由前面可知，sizeDelta 并不是实际 rt 的长宽，但是可以通过公式转换得到实际长宽

``` C#
    realWidth = (anchorMax - anchorMin).x * parent.weidth + sizeDelta.x
    realHeight= (anchorMax - anchorMin).y * parent.height + sizeDelta.y
```

所以可得，当 anchor 为一点时，sizeDelta 为实际长宽

但是这个方法一来要算，而来还要获得父物体的长宽，如果父物体又是自适应的长宽，那就更麻烦了。另外一个方法时直接使用 rt.rect 中的 width 和 height 即可。

**注意：rect 的 top, bottom, right, left 已经改为 yMin, yMax, xMax, xMin。并且也不代表 rt 的相对四边 anchor 的内缩量，而是相对 rt 中点的距离。**

要获取 top, bottom, right, left 要通过 offsetMin, offsetMax 各个分量获得可得

``` C#
top = -offsetMax.y
bottom = offsetMin.y
left = offsetMin.x
right = -offsetMax.x
```

当 anchor 为一点时 (width, height) = offsetMax - offsetMin

## 设置长宽

`SetInsetAndSizeFromParentEdge(RectTransform.Edge, pading, length)`

会改变锚点, 位置，以及长/宽。直接根据父物体设置对其方式 Edge 以及边界距离 pading, 长度。举例，当使用 `rt.SetInsetAndSizeFromParentEdge(RectTransform.Edge.Left, 10, 200)` 会将 anchorMin 改为 (0, originMinY)，anchorMax 改为 (0, originMaxY)，然后，rt 左边距离父物体左边界内缩 10，rt宽度 200.

`SetSizeWithCurrentAnchors(RectTransform.Axis.Horizontal, lenght)`

直接设置横向或者竖向 rt 的长宽，并且不改变 anchor, pivot 以及位置。即使 pivot 设置为 (0, 0.5)，也不会向一方延申设置长宽，以实际的中点延申的长度。

## 设置属性的顺序是否会有不同结果



坐标转换

        //实例化点击事件
        PointerEventData eventDataCurrentPosition = new PointerEventData(UnityEngine.EventSystems.EventSystem.current);
        //将点击位置的屏幕坐标赋值给点击事件
        eventDataCurrentPosition.position = new Vector2(screenPosition.x, screenPosition.y);
    
        List<RaycastResult> results = new List<RaycastResult>();
        //向点击处发射射线
        EventSystem.current.RaycastAll(eventDataCurrentPosition, results);


        return results.Count > 0;
————————————————
版权声明：本文为CSDN博主「LittleBridLibrary」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/weixin_45042494/article/details/106905827

https://stackoverflow.com/questions/56869568/how-can-i-get-screen-position-of-a-ui-element



Recttransform 注意事项

传入相机

相机设置

相机enable问题
