

动态组 内存少 setParent 多

全量 内存大 setParent 少



SetParent 导致

​	递归 Active 操作

​	布局/Maskable 大量更新

​	组件多，实例化多，如 UIBinding 和大量的 GetComponent



对比

6个子节点 vs 6 组合（速度，内存）





实际情况

组合使用结点更少，万能格子存在大量冗余格子。6 个 vs 34 个

 

Enable 可以更好点减少 SetParent 带来的 

OnBeforeTransformParentChanged 标注旧父节点更新布局


OnTransformParentChanged 的 SetAllDirty





滑动

缩放 vs enable

​	

