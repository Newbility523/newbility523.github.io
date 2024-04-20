Image，Text 自带 preferred size

Image 需要有图片时以 Sprite size 为准，否则为 0



### 布局流程

总的来说布局有两种元素参与，一种是尺寸控制器 ILayoutController 和是尺寸计算器 ILayoutElement。

当触发 Layout 时， 需要进行两次遍历。

1. 计算阶段：ILayoutElement 从子到父计算一遍他们的布局尺寸，如 min，Prefered，Flexsible
2. 应用阶段：ILayoutController 从父到子应用计算阶段的尺寸
   1. 优先设置自己新尺寸
   2. 把自己新尺寸当做预算，调整子节点尺寸



### Min、Preferred、Flexsible 怎么理解

**子节点是在父节点的尺寸下进行布局的。**

Min 是布局最小的尺寸，必须满足。

Preferred 偏好尺寸，且为权重值。当都以 min 尺寸布局后，仍有富余的话，会尺寸就会往 Preferred 靠。所有设置了 Preferred 的元素都会按 Preferred 权重延伸。

Flexsible 权重值。Preferred 都被满足后。剩余的所有空间会被直接填满，也是按元素 Flexsible 权重分配。



### LayoutGroup 的 Control Child Size 是什么意思

是否将直属子节点的 ILayoutElement 生效，否则子节点布局尺寸都是当前尺寸



### Layout Priority 怎么理解

Priority 是 ILayoutElement 接口的属性，表示优先级。 GameObject 可以挂多个 ILayoutElement，拥有最高 Priority 且大于等于 0 的 ILayoutElement 的才会生效。同 Priority 则取最高的布局属性值生效。

Image，Text 等组件组件 Priority 是面板中是隐藏的，为 0。而 LayoutElement 的 Priority 默认是 1。



### 那些条件会触发布局



### 布局有时候”不灵敏“

单套 VerticalLayoutGroup + ContentSizeFitter 尺寸自适应都正常，为什么嵌套就出现布局不灵敏的情况呢。因为子节点的 ContentSizeFitter 没有重新触发父节点的重新布局。

布局期间生发了什么

1. 尺寸计算时，虽然子节点计算到的尺寸是对的，但尺寸还没应用上。
2. 父节点计算尺寸时没取子的 ILayoutElement 最新计算尺寸，而是用当前尺寸 sizeDelta。
3. 应用阶段，在父节点看来，子节点尺寸其实都没变。
4. 应用阶段，子节点引用上了自己的最新尺寸。
5. 子节点的尺寸变更虽然满足触发布局条件，但是它不是 Root，所以没触发父节点更新。

如何保证灵敏的布局

1. 父子间必须用 LayoutGroup 组件衔接
2. 当子节点使用了 ContentSizeFitter，它的父节点必须勾选 Control Child Size



### 报黄色警告是什么原因

因为子节点的 ContentSizeFitter 无法重新触发父节点的重新布局。



### 如何拓展布局

重写 ILayoutElement 的 CalculateLayoutInputHorizontal 或 CalculateLayoutInputVertical。



### G01 的 ToolTip 布局如何实现

### 性能瓶颈和解决方案



### 尺寸拓展时的方向



### 子节点触发布局组件更新，布局组件又会影响子节点尺寸，为什么没有死循环

MarkLayoutForRebuild 是在**节点属性变更后**才会触发。所以流程是

1. 子节点显影/尺寸变更
2. 触发父节点布局
3. 父节点尺寸变更
4. 触发父节点布局
5. **节点尺寸都没变，重新布局停止**



参考

https://llmagicll.medium.com/optimizing-ui-performance-in-unity-deep-dive-into-layoutelement-and-layoutgroup-components-b6a575187ee4

https://www.jianshu.com/p/a0f10c7fce0e

https://www.jianshu.com/p/9a7e0d8a6136

https://www.jianshu.com/p/0be8b113824a
