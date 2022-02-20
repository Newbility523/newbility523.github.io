---
layout: post
title: Introducing Hyde
excerpt: I am happy to join with you today in what will go down in history as the greatest demonstration for freedom in the history of our nation.
---

参考
https://longqian.me/
```c#
public PlayableDirector director;
    public Dictionary<String, PlayableBinding> bindingDict = new Dictionary<String, PlayableBinding>(); //轨道映射

    public Action onStopAction = null;

    bool stop = true;

    void OnEnable()
    {
        stop = true;
        if (!director)
        {
            var directors = gameObject.GetComponentsInChildren<PlayableDirector>();
            if (directors.Length < 0)
            {
                if (onStopAction != null)
                {
                    var tmp = onStopAction;
                    onStopAction = null;
                    tmp.Invoke();
                }

                return;
            }

            director = directors[0];
            foreach (var bind in director.playableAsset.outputs)
            {
                if (!bindingDict.ContainsKey(bind.streamName))
                {
                    bindingDict.Add(bind.streamName, bind);
                }
            }
        }
    }

    //轨道绑定
    public void BindTrackGameObject(String trackName, GameObject go)
    {
        PlayableBinding pb;
        if (bindingDict.TryGetValue(trackName, out pb))
        {
            director.SetGenericBinding(pb.sourceObject, go);
        }
    }


abc
```





https://www.cnblogs.com/zhaoqingqing/p/3894061.html 鼠标动画很有意思，尝试复刻



## Dotween

需求，显示跑马灯。

因为视野内最多只出现 3 个记录，所以在一个 Mask 内，让三个记录对象依次从底部 PosA 到顶部 PosB 移动，并且循环即可。开始实现如下

```lua
local PosA = -10
local PosB = 10
local speed = 10
function M:LoopAnim(index)
    local gameObjct = self.list[index].gameObject
    local transform = self.list[index].transform
    API.SetObjUIPosY(gameObject, PosA)
    local time = (PosB - PosA) / speed
    local tween = transform:DOAnchorPosY(PosB, time):SetEase(API.Ease.Linear)
    tween:OnComplete(function()
        -- Set text
    end)
    
    tween:SetLoop(-1)
end
```

但是开始播放的时候，如果按照循环直接播放，记录会出现的比较晚。所以更改做法，分为两段，新增第一段：安排三个记录设置位置后，先向上播放一次。结束后再进行循环

```lua
function M:PlayAnim()
    local tempStartY = -(i * itemSpace + (i - 1) * itemHeight)
    API.SetObjUIPosY(t.gameObject, tempStartY)
    local time = (PosB - tempStartY) / speed
    local tween = t:DOAnchorPosY(PosB, time):SetEase(API.Ease.Linear)
    tween:OnComplete(function()
    	self:LoopAnim(i)
    end)
end
```

踩到的坑

* tween 如果设置了循环，如`tween:SetLoop(-1)` ，`OnComplete` 将不会调用，所以需要改成`OnComplete`内重新调用次动画。
* Unity 中在播放`LoopAnim`拖拽窗口，就会卡帧，记录的间距就会出现问题。所以不能写定初始位置 PosA，PosA 应该由上一个记录的位置计算求得。
* UI 的动画记得先查下 tween 是否有对应的接口函数，例如用`DOAnchorPosY`，而不是`DoLocalPositionY`

**所以完整的为**

```lua
function M:PlayAnim()
    for i = 1, 3 do
        local xxx = xxx
        local t = xxx.transform
        local tempStartY = -(i * itemSpace + (i - 1) * itemHeight)

        API.SetObjUIPosY(xxx.gameObject, tempStartY)
        local time = (targetY - tempStartY) / speed
        local tween = t:DOAnchorPosY(targetY, time):SetEase(Ease.Linear)
        tween:OnComplete(function()
            self:LoopAnim(i)
        end)
    end
end

function M:LoopAnim(index)
    local i = index
    local t = xxx.transform
    local followItem = (index - 2) % 3 + 1
    local y = followItem.gameObject.rectTransform.localPosition.y
    local tempStartY = y - itemHeight - itemSpace
    API.SetObjUIPosY(xxx.gameObject, tempStartY)

    local time = (targetY - tempStartY) / speed
    local tween = t:DOAnchorPosY(targetY, time):SetEase(Ease.Linear)
    tween:OnComplete(function()
        -- set text
        self:LoopAnim(i)
    end)
end
```



### 注意问题

Tween 创建后再等几秒使用会出现动画不可控的情况，特别是 seq 。

```lua
--local seq = DOTween:Sequence() -- bug
TM(delayTime, function()
    local seq = DOTween:Sequence() -- fine
	seq:Append()
	seq:Join()
end)
```





