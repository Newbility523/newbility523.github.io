# MonoBehaviour 生命周期

大致顺序由上至下

* Editor
* **Awake**
* **OnEnable**
* **Start**
* **FixedUpdate**   **固定间隔**帧
* Yield WaitForFixedUpdate
* Interal physics update
* **OnTriggerXXX**  当触发器发生碰撞
* **OnCollisionXXX**    当碰撞体发生碰撞
* **OnMouseXXX**    鼠标事件
* **Update**    **渲染**帧
* Yield null
* Yield WaitForSeconds
* Yield WWW
* Yield StartCoroutine
* Internal animation update 
* **LateUpdate** 
* OnWillRenderObject
* OnPreCull
* OnBecameVisible
* OnBecameInvisible
* OnPreRender
* OnRenderObject
* OnPostRender
* OnRenderImage
* OnDrawGizmos
* **OnGUI** Unity前GUI系统回调，现多用于调试
* **Yield WaitForEndOfFrame**
* OnApplicationPause
* **OnDisable**
* **OnDestroy**
* OnApplicationQuit

##  特殊情况下的执行顺序

经测试，在 Editor 模式下且在 Hierarchy 下存在物体时，父子物体的脚本调用顺序会有不同的顺序，分两种情况。

### 点击开启游戏时

### 嵌套时