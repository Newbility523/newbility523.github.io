# 企业面试概要

主要记录面试遇到的问题以及面试官的考核侧重点

## 光娱游戏

#### *2019-2-25*

笔试一般，U3D 部分简单，C / C++ 基础且偏细节，会考 Lua 的继承实现，但会扫一遍笔试题。偏优化，偏算法。

* 射击游戏的 AI 是如何实现的
* UGUI 降低 GC 的方式哪些
* Lua 的继承实现，以及委托回收问题。
* 如何删除一个数组中所有值为 K 的数
* 设计一个算法，解析并计算数学表达式，如 "1 + （2 * 4）/ 3 + 1"，算出结果。规定只会存在加减乘除和括号运算符

## 赫墨拉游戏 

#### *2019-2-26*

笔试简单，但不看笔试结果，偏向项目经验。

* 什么是 MVC
* 你在 UI 开发中最难的是什么，是怎么做的？抽奖机的实现，（具体待补充）
* XLua 的 UI 框架怎么设计
* 如何实现 Editor 编程并实现模型导入的优化的
* XLua 你做过哪些优化？

## 游雁游戏

#### *2019-3-1*

两面，一面相当简单，甚至没感觉有问问题。二面主要在优化。

* 旧的函数接口功能不足，你会怎么修改这个接口。
* Lua 表是如何实现可以存如此多种数据结构的
* 是否使用过 C# 垃圾回收，怎么控制 GC？

## 多益网络

#### *2019-3-4*

面试前会有一份线上 IQ 题。没做的话，提前搜**国际 IQ 测试题**，或者搜索**多益网络 IQ 题**先做一边，基本可以过，虽然简单的题不少，但是不懂套路的话真的不好过。

面试偏项目，偏拓展。

* 枪口抖动是如何实现的
* 怪物的 AI 是如何实现的
* 统计粒子效果消耗是怎么做的
* 批量修改 AssetImporter 时，你修改了哪些数据，为什么。
* 动画有尝试压缩吗，怎么做？
* 如果要实现人物头顶飘字效果，如何实现
* 有了解过 NavMeshRender 的内部实现吗
* 了解过现有游戏的同步模式吗，说明下
* 有用过动画状态机吗，动作融合以及 IK
* Material 的贴图分多少种？
* 多光源情况下，Shader 里如何使用
* 有没有使用过 OpenGL 的光照，实现更深的效果
* 项目里的数据是如何管理的。（有点抽象）
* 偷袭效果如何实现的
* AB 更新的**详细**方案
* AB 你觉得应该什么时候卸载
* 图片裁剪是怎么做的
* 说下你们项目里的 AB 方案，或者自己觉得 AB 应该如何分配
* 有没有了解过 U3D 最新版本的新特性
* Unity ShaderLab 你觉得有哪些不足

## 元游网络

### *2019-3-5*

笔试题简单，只有一题稍微难些，面试偏项目实际使用，侧重 UGUI 以及 Lua。没东西问时，也会问些算法基础。

* UGUI 中有哪些方法可以控制层级
* 如何在 UGUI 上显示一个三维模型
* 服务器传来的时间戳，如何显示成年/月/日样式
* 说下项目里 UGUI 出过什么大 Bug 你是怎么解决的
* 说个**上线之后**的你负责的模块出过什么 Bug 你是怎么解决的
* 给你设计 AB ，你会怎么设计
* 你做了哪些 Lua 上面的优化
* 你认识的排序算法有哪些，需要说明时间复杂度以及大概实现步骤

## 4399

### *2019-3-6*

* 控制 UI 等级的方式有哪些
* 怎么样控制 UGUI 的单位长度
* Resources 文件夹下面的素材有什么特别
* 如何批量修改图片素材的导出格式为 Sprite
* 如何修改脚本的属性面板，新增按钮
* 游戏中，点击屏幕如何选取对象的
* Lua 如何实现继承
* pairs 和 ipair 的区别
* 锚点和轴点的区别
* 游戏优化有什么方式（GC，Draw call 分别说明）
* 对象的工作方式或者流程是怎样的