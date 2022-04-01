# Unity Event System 事件系统

当需要游戏物体和鼠标点击事件交互时，有三种方式

1. 手动在鼠标按下或抬起时，发射射线检测碰撞的物体。
2. 用MonoBehaviour内的OnMouseDown，OnMouseUp等回调函数。
3. 游戏物体内脚本实现EventSystems中的相应接口，如IPointerClickHandler。
	
以下主要针对第三种方式进行总结。

EventSystems在UnityEngine命名空间下，主要的接口为
* IBeginDragHandler
* IDragHandler
* IDropHandler
* IEndDragHandler
* IPointerClickHandler
* IPointerDownHandler
* IPointerEnterHandler
* IPointerExitHandler
* IPointerUpHandler

对于UGUI系统，自带的UI组建可以在实现接口后，在Canvas作为根节点，并且存在EventSystem物体，就可以产生效果。

但是对于"2D Object"->"Sprite"是无法直接实现接口后产生作用。需要添加Collider 2D，并且在点击事件射出的摄像机上添加Physics Raycaster 2D 组件。

对于三维空间下的物体，同理，需要添加Collier，并且在摄像机上添加Physics Raycaster组件。

### 注意

IBeginDragHandler和IEndDragHandler只有在IDragHandler被实现的前提下，才会起作用，即使Drag的委托函数是空函数。

## 点击传递

若未经处理，所有Unity点击事件，都会在找到第一个接受者后，停止。为了处理某种特殊需求，下面的脚本可以传递事件到下层，在接口内调用一下函数，传递EventData即可实现传递到后面的UI上，或许包括3D物体。

``` C#
//防死循环
bool _RayCasting = false;
public void RayCastBebind(PointerEventData eventData)
{
    //if (_RayCasting)
    //    return;

    _RayCasting = true;
    List<RaycastResult> raycastResults = new List<RaycastResult>();
    EventSystemObj.RaycastAll(eventData, raycastResults);
    if (raycastResults.Count > 0)
    {
        var pointClick = raycastResults[0].gameObject.GetComponent<Graphic>();
        //if (ExecuteEvents.CanHandleEvent<IPointerClickHandler>(raycastResults[0].gameObject))
        {
            Debug.Log("RayCastItem:" + raycastResults[0].gameObject.name);
            ExecuteEvents.ExecuteHierarchy<IPointerClickHandler>(raycastResults[0].gameObject, eventData, (x, y) => x.OnPointerClick(eventData));
        }
    }
    _RayCasting = false;
}
```