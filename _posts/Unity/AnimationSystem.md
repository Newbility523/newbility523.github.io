# Animation



Animator / Animation 动态添加回调方法

在使用 Animator 的时候，有时候很纳闷：为什么 Animator 没有 Animation 那样的动画事件？思考后才发现 Animator 状态机的状态是可以由一个或多个动画片段组成，所以不能直接赋予状态回调。

但有时候我们的动画 AnimationClip 和 State 就是以一对一的关系的时候（如 UI 动画），就可以了利用 状态里装载的 AnimationClip 的动画是事件来充当 Animator 状态的回调。

以下提供两种方式

```c#
_animator = gameObject.GetComponent<Animator>();
_animatorOverrideController = new AnimatorOverrideController(_animator.runtimeAnimatorController);
_animator.runtimeAnimatorController = _animatorOverrideController;

// MoveToRight 是动画片段名
var animClip = _animatorOverrideController["MoveToRight"];
var animEvent = new AnimationEvent();
animEvent.time = animClip.length;

animEvent.functionName = "UICallBackShow";
animEvent.messageOptions = SendMessageOptions.DontRequireReceiver;
animClip.AddEvent(animEvent);
```

注意

* animEvent 的 time 是指实际时间，而非归一化时间。以上代码演示的是结束回调，所以设置时间为 `animClip.length`

* messageOptions 如果不设置成 `DontRequireReceiver`，回调函数没接收者将会报错。

* 对动画片段添加事件会影响到其他所有引用了此 animtionClip 的地方。

* 以上动画是在动画结尾添加了回调，如果一个状态使用 -1 的速度对动画进行反序播放，那么添加的结尾回调也会对该动画有影响，并且因为 -1，回调事件将会在开始的时候被触发。



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



https://www.reddit.com/r/Unity3D/comments/t7e132/took_awhile_but_i_now_love_how_unitys_post/



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





