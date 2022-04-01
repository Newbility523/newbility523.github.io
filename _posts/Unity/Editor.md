<<<<<<< HEAD
OnSceneGUI 

**Scene 刷新不及时**

如果操作的是对象，可以用 EditorUtility.SetDirty(target);

如果不是对象，可以强制重刷 SceneView.RepaintAll();



**时序**

为了控制编辑器的调用时序，应该在一个脚本内依次调用 OnSceneGUI，而不是在每个单独的脚本各自添加回调 OnSceneGUI



**屏蔽原有scene操作**

实质就是屏蔽 scene 对鼠标键盘的响应。

两种方式

1. 移除事件，将 Event.Current.Use()，可以让 scene 不相应任何事件，如果觉得范围有点大，可以加上对事件的判断，例如屏蔽键盘。

2. Scene view 本身就支持屏蔽某层 gameObject 的点击。gameObject 的 layers 选项中有锁的标志，如果被锁住了，就不会被点击到。这一步也能通过代码操作

   ```c#
   using UnityEngine;
   using UnityEditor;
   using System.Collections;
    
   public class MyEditor  
   {
   	[InitializeOnLoadMethod]
   	static void Start () 
   	{
   		SceneView.onSceneGUIDelegate = OnSceneGUI;
   	}
    
   	public static bool IsLimitSceneSelectGameObject = true;
   	static void OnSceneGUI( SceneView sceneview )
   	{
   		Event e = Event.current;
   	
   		int controlID = GUIUtility.GetControlID( FocusType.Passive);
   	
   		if(IsLimitSceneSelectGameObject && e.type == EventType.Layout)
   		{
   			HandleUtility.AddDefaultControl(controlID);
   		}
   	}
   }
   ```



Editor 中判断鼠标的按下

```c#
// 无效
if (e.type == EventType.MouseDown) //work
{
  if (e.keyCode == KeyCode.Mouse0) // dont work
  {
    // do something
	}
}

// 有效
if (e.isMouse && e.button == 0)
{
     // do something
}

=======
菜单工具



## Inspector 面板属性定制

Editor编程，在所需要改变的字段前，添加属性即可

浅层的自定义编辑Inspector界面，一般无需引入命名空间，也无需继承Editor类，只需在需要的字段，属性，方法或者类中类，脚本类中添加某些特性即可。如下

| **属性、示例**                             | **修饰目标**   | **效果**                                                     |
| ------------------------------------------ | :------------- | ------------------------------------------------------------ |
| Tooltip("Info")                            | 属性，字段     | 鼠标放在上面会显示的提示内容                                 |
| Header("Title"）                           | 无             | 相当于小标题                                                 |
| Range(min,  max)                           | 属性，字段     | 对修饰的字段给予滑动条调整值                                 |
| Multiline(int  num)                        | string字段     | 让string可以在一个大框内输入字符串，num代表可以显示多少行    |
| Space(30）                                 | 字段间         | 调节字段的间隔                                               |
| TextArea() / TextArea(min, max)            | string字段     | 让文本区域通过滑动框的形式变宽.默认情况显示3行后出现滑块。明确指定后，会在max后再显示滑块 |
| HideInInspector                            | 属性，字段     | 隐藏字段，inspector中看不到。(通过[System.NonSerialized]也可以达到视觉一样的效果) |
| SerializeField                             | 属性，字段     | 序列化标志，可以让私有字段显示在inspector中                  |
| System.Serializable                        | 类             | 显示脚本中的类的public字段可以被显示                         |
| ContextMenu("FunName")                     | 修饰非静态方法 | 让该方法可以通过点击脚本中的设置调用(小齿轮)                 |
| ContextMenuItem("itemName",  "FunName")    | 修饰字段       | 可在inspector中右键点击字段时，弹出菜单选择需要执行的函数。但需要保证FuncName函数存在 |
| RequireComponent(typeof(组件名不要双引号)) | 修饰脚本类     | 保证在改脚本存在的对象上，存在需要的组件，该组件无法在脚本存在的情况下移除。 |
| AddComponentMenu(".../...")                | 修饰脚本类     | 在AddComponent界面添加组件选择，支持层级结构，点击即添加本脚本 |
| ExecuteInEditMode                          | 修饰脚本类     | 使mono脚本在编辑模式下也可以执行，awake/start会各执行一次，updata会在每次界面(包括数值)变化的时候执行 |

## Inspector 完全定制

1. 添加命名空间: UnityEditor
2. 界面脚本继承至 Editor
3. 脚本类上添加关联的脚本组件`[CustomEditor(typeof(Player))]`

4. 重写`OnInspectorGUI()`函数，绘制赋值

5. 实现`OnEnable()`和`OnDisable()`，用于初始化和清理编辑器。

如下:

``` c#
using System.Collections;
using System.Collections.Generic;
using UnityEditor.UI;
using UnityEditor;
using UnityEngine;
using System;
using Engine;

[CustomEditor(typeof(NewText), true)]
[CanEditMultipleObjects]
public class NewTextEditor : UnityEditor.UI.TextEditor
{
    public override void OnInspectorGUI()
    {
        base.OnInspectorGUI();
        NewText text = target as NewText;

        GUILayout.BeginHorizontal();

        GUILayout.Label("colorTag");
        ColorTag origin = text.colorTag;
        text.colorTag = (ColorTag)EditorGUILayout.EnumPopup(text.colorTag);
        if (text.colorTag != origin)
        {
            Color c;
            if (ColorUtility.TryParseHtmlString(ColorConfig.GetColor(text.colorTag), out c))
            {
                text.color = c;
                EditorUtility.SetDirty(target);
            }
        }

        GUILayout.EndHorizontal();
    }
}
```

*当使用 UnityEditor 命名空间时，若没有放在 Editor 文件夹，则会在打包时报错，大致为无法找到 UnityEditor 命名空间。原因是打包时，不会附带 UnityEditor.dll，也就无法使用 UnityEditor下的任何东西。*

*解决办法两种*

*1.将引用了 Editor 的脚本，无论是否使用过，都放在**正确的 **Editor 文件夹下。*

*2.如果确实需要使用 UnityEditor 下的东西，可以用#if UNITY_EDITOR - #endif 将用到 Editor 的内容都包含在内，包括命名空间。*

 

该Editor脚本类用于显示Player脚本的编辑界面。所以，为了能在界面中获得物体上的Player组件的信息，脚本中需要有player变量，对player进行引用，在OnEnable中可获得对Player的引用，如

![private void  pl ayer  (Player) target;  Debug. Log( "OnEnab1e: " player. name); ](file:///C:/Users/Administrator/AppData/Local/Packages/Microsoft.Office.OneNote_8wekyb3d8bbwe/TempState/msohtmlclip/clip_image001.png)

target则是针对的对象，转换类型到player。然后就可以在OnInspector中对组件中的各个字段进行显示

 

当不需要时，则需要释放，否则可能在其他Player中操作的会是上一个操作的Player内容。（因为引用对象没换过来）

在OnDisable中将player = null

![private void OOnDisab1e()  pl ayer  null;  Debug. Log( "OnDisab1e" ) ; ](file:///C:/Users/Administrator/AppData/Local/Packages/Microsoft.Office.OneNote_8wekyb3d8bbwe/TempState/msohtmlclip/clip_image002.png)

 

在`OnInspectorGUI()`中

是可以使用`GUI`，`GUILayout`，`EditorGUILayout` 等类进行操作，用`EditorGUILayout`排版会比较方便。

一般的操作分为

注意，以下函数均不是特性

### 布局排版

* GUILayout.Space(num)，空出num像素。

* EditorGUILayout.Space()，空出一行。

* GUI.skin.label.fontSize，随后的字体大小都会更改，一般需要在改变字体大小后，再设置一次回原来大小。

* GUI.skin.label.alignment，设置随后的字体对其方式，一般在更改了某行字体后，需要在设置一次回原来样式。

* EditorGUILayout.BeginHorizontal()，开启自动水平布局排列

* EditorGUILayout.EndHorizontal()，结束水平布局

* EditorGUILayout.BeginHorizontal()，开启竖直水平布局排列
* EditorGUILayout.EndHorizontal()，结束竖直布局

**注意，BeginHorizontal/EndHorizontal，BeginVertical/EndVertical，必须成对出现**

### 信息显示

`EditorGUILayout.HelpBox()`显示提示信息，可追加信息的类型，如Error或Worning。

### 字段赋值

由于已在OnEnable中获得对Player对象的引用，所以可以获得字段具体的值。

一般思路和步骤为

使用EditorGUILayout类，创建组件，为需要显示的字段设置显示字符串，并输入字段值用于显示；组件的返回值再复制给字段；这一完整流程就可以显示字段值，并且操作组件对字段赋值。如

![, player. playerName = EditorGUILayout. TextFie1d( :  I player. ID = EditorGUILayout. IntFie1d( "ID", player. ID) ;  player. playerName) ; ](file:///C:/Users/Administrator/AppData/Local/Packages/Microsoft.Office.OneNote_8wekyb3d8bbwe/TempState/msohtmlclip/clip_image003.png)

 

### 一些特殊的字段类型

Bool    EditorGUILayout.Toggle

Vector3 EditorGUILayout.Vector3Field

Enum   EditorGUILayout.EnumPopup

Enums  EditorGUILayout.EnumMaskField    多选的Enum，也就是LayerMask

Object  EditorGUILayout.ObjectField

 

### 序列化对象

需要确保，该字段的类是可序列化的

1.获得对象 SerializedProperty myClass

2.寻找对象中的该属性 serializedObject.FindProperty("myClass")

3.显示 EditorGUILayout.PropertyField(myClass,new GUIContent("类"), true)

4.保存所有可序列化对象的更改 serializedObject.ApplyModifiedProperties()

如：

![VSeria1izedProperty myC1ass serializedobject.  GUIContent(  " 'true);  ser ial izedObject. ( ) ; ](file:///C:/Users/Administrator/AppData/Local/Packages/Microsoft.Office.OneNote_8wekyb3d8bbwe/TempState/msohtmlclip/clip_image004.png)

 

### 一些其他工具

| EditorGUI.ProgressBar             | 显示进度条（仅显示，不可拖动）                               |
| --------------------------------- | ------------------------------------------------------------ |
| EditorGUILayout.Slider            | 滑动条（可拖动，一般用于float字段）                          |
| GUILayoutUtility.GetRect(100, 50) | 输入需要的大小，返回在当前自动布局的情况下，组件会用到的Rect。因为某些组件不在自动布局类中 (ProgressBar进度条)，所以使用时，如果没有指定正确的Rect会乱飞。所以可以通过该函数获得目前自动布局的Rect，非常方便。 |
| GUI.color                         | 设置一下的颜色                                               |

## EditorWindow 浮动窗口

编写一下代码，通过菜单项，就可以创建一个空的浮动窗口

```C#
using UnityEditor;

public class AuditModeTool : EditorWindow
{
    [UnityEditor.MenuItem("Tools/Audit Mode Tool")]
    private static void OpenWindow()
    {
        AuditModeTool window = EditorWindow.GetWindow<AuditModeTool>();
    }
}
```

编写 EditorWindow 逻辑，需要先了解 EditorWindow 的声明周期， 和 MonoBehaviour 很像

### 生命周期

打开触发

* OnEnable

* OnFoucus

存在时触发

* OnInspectorUpdate
* OnProjectChange
* OnSelectionChange

存在时循环

* OnHierarchyChange
* OnGUI

关闭触发

* OnLostFocus
* OnDisable
* OnDestroy

OnGUI 内的界面编写，和 Inspector 一致。

### 小技巧

### 拖拽输入路径

``` c#
private void OnGUI()
{
    Rect rect = EditorGUILayout.GetControlRect(GUILayout.Width(500));
    path = EditorGUI.TextField(rect, path);
    //如果鼠标正在拖拽中或拖拽结束时，并且鼠标所在位置在文本输入框内
    if ((Event.current.type == UnityEngine.EventType.DragUpdated 
        || Event.current.type == UnityEngine.EventType.DragExited) 
        && rect.Contains(Event.current.mousePosition))
    {
        //改变鼠标的外表
        DragAndDrop.visualMode = DragAndDropVisualMode.Generic;
        if (DragAndDrop.paths != null && DragAndDrop.paths.Length > 0)
        {
            path = DragAndDrop.paths[0];
        }
    }
}
```

## 数据序列化



常用工具

**PrefabUtility**

预制体工具，用于加载或卸载 prefab，如果修改的是 prefab 上的非引用参数，通过`PrefabUtility.LoadPrefabContents`加载后，当做普通 gameObject 操作属性赋值，再`AssetDatabase.SaveAssets`即可。

如果操作的是 prefab 里的引用参数，例如 Image 里的 sprite，则还需要在 SaveAssets 前补充`PrefabUtility.SaveAsPrefabAsset`进行替换保存。

```c#
public static void CreateVerifiedScript()
{
    GameObject obj = PrefabUtility.LoadPrefabContents(path);
    
	// 情形1 非引用属性
    obj.transform.localPosition = Vector3.one; // 修改原先数值
    AssetDatabase.SaveAssets(); // 保存
    AssetDatabase.Refresh(); // 刷新
    
	// 情形2 引用属性
    var img = obj.GetComponent<Image>();
    img.sprite = AssetDatabase.LoadAssetAtPath<Sprite>("assetPath");
    PrefabUtility.UnloadPrefabContents(obj); // 引用属性需要通过替换才能修改
    AssetDatabase.SaveAssets(); // 保存
    AssetDatabase.Refresh(); // 刷新
}
>>>>>>> b8095a72a32b18369a2a66c576ba63bd952755b2
```



<<<<<<< HEAD


### 参考

https://www.xuanyusong.com/archives/3884

https://zhuanlan.zhihu.com/p/123384619





 
=======
**AssetDatabase**

AssetDatabase 管理了项目里所有的素材，可以通过它获取所有资源路径 GetAllAssetPaths，加载资源 LoadAssetAtPath，通过素材 guid 获取资源路径。所以，当对 Unity 的资源进行操作后，都应该及时进行保存 SaveAssets 或者刷新 Refresh，不然会出现找不到素材或者执行完批量操作后，Unity 目录 Project 窗口会显示不及时。



**EditorUtility**

经常通过 DisplayProgressBar 和 ClearProgressBar 显示进度



**Selection**

工具能够方便使用，就不能使用硬编码，最好的操作莫过于点选目标 + 执行命令。Selection 里保存的就是当前鼠标点击的对象，无论是 Hierarchy 还是 Project 窗口下的物品，选中后都可以在这里找到。

* Selection.assetGUIDs 点选的任何物体，**包括目录**
* Selection.activeObject 当前选中物体，不包括目录
* Selection.activeTransform 同上



## Editor 界面布局



## Scene 窗口修改

 

Scene窗口可编辑

在Scene窗口直接编辑，不需要游戏运行。

同自定义Inpector界面编程，

引入命名空间Editor

需要关联脚本

继承Editor

无需重写Inspector

重点OnSceneGUI()逻辑控制。

 

如实现点击Scene中，在场景动态创建路点。

关联脚本后，将点击的创建的小球交给关联脚本控制。创建小球在该Editor中实现。

由于Scene中创建，游戏没有进行，鼠标的输入和事件都不能用之前的那一套。

事件需要用Event.current

Event.current.button 当前按下的鼠标

Event.current.type 当前事件类型，如果按下的是鼠标，可判断是否是“按下”类型事件

同时，输入鼠标位置为Event.current.mousePosition

因为Scene的射线检测摄像机不是场景中可见的摄像机，所以需要用

HandleUtility.GUIPointToWorldRay()专门获得scene到场景的射线，后续操作就和一般的射线检测无差。

 

由于Editor的操作只有选中的对象上存在关联脚本的时候才会有效，当创建物体会出现关注点转到新物体，为解决这一情况，强制在成物体后，调用Selection.activeGameObject = plane.gameObject，转以选中目标。

 

同时为了能在显示效果，控制连接小球绘制路点的关联脚本需要ExecuteInEditMode





https://blog.csdn.net/qq_28474981/article/details/82949820



>>>>>>> b8095a72a32b18369a2a66c576ba63bd952755b2
