当背包物品格子存在大量冗余的节点，例如空的格子和存在物品的格子

空格子：只需背景框，按钮，以及锁的图片

存在物品格子：物品图标，星级，特效，数量，格子

​	武器：对比箭头，特效

​	道具：无

​	药瓶：无

​	礼包：限时

尝试在一个列表内显示多种类型预制体或物品类

2021.6.24

List 在创建列表时，不再指定位格子的 Class。而是传入 Factory，针对传入数据，返回不同类型 Class。变动大致如下：

```Lua
-- Old
self:AddChildPanel("itemCell" .. childItemIndex, itemCls, createParams, false, true, itemParams)

-- New
local function DefaultFactory(data)
    return "MainGame.UIComponent.BaseItem", "UI/Prefab/Component/ItemCellEmpty.prefab"
end

local itemCls, prefab = DefaultFactory(data)
local createParams = {
    prefab = prefab,
}
self:AddChild("itemCell" .. childItemIndex, itemCls, createParams, true)
```

可能会带来问题

1. 如此修改的初衷，是为了解决背包没法针对空格子显示轻量级物体的窘境。其它界面或者不同类型数据对格子内组件的使用率虽然不尽相同，除开空格相差最多不超过40%，因为没有什么数据可以使得格子显示所有内容，为了针对背包这种特殊的情形，而修改列表的赋值方式，就显示没必要。
2. Factory 设计是利用 data 区分 Class，由界面创建列表的时候传入。如果其他界面有可能用到， factory 函数就要写在通用的工具中备以复用，这就有点麻烦了。更糟糕的是，如果其他界面的格子是背包格子的基础上添加一个角标（不管是那种背包格子），那么这个界面是在对传入 factory 进行重写呢，还是传入唯一 Class，Class 中调用 Factory 修改使用预制体。

但是物尽其用，背包格子内存能有效减低，创建速度也提升。相关对比如下。

但是目前背包界面存在格子共 75 个，包括循环列表中 60 个，装备列表 15 个，所以修改这个列表的这个特性暂时到此为止，停留太久了。

后补的方法有

1. 格子内部的图片组件化，例如存在一个完整格子作为模板，一个只有品质框，图片，数量组件的作为基础格子，当对某个组件赋值时若不存在，则到完整格子中寻找，并设置位置到自己身上，如果这样做，Pool 中的基本单位就是 Image 或者 Button 了。

