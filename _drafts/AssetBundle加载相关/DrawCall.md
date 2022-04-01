# Draw Call
* 概念:Draw Call是一条指令.Cpu向Gpu发送的一段指令,去渲染一个网格(Mesh).这条指令只指定一个网格(Mesh)是否被渲染,是否绘制任何材质(Material).

* 获得指令之后,GPU获得了渲染状态的值.(材质(Material) 纹理(Texture) 着色器(Shader)等等)

* 每一个网格(Mesh)使用一个不同的材质(Material)都是一个Draw Call.

* 一个Draw Call等于调用一次DrawIndexedPrimitive(DirectX)或者glDrawElements(OpenGL)

* 每一个Draw Call都会产生一个Batch.

* 25K batchs/sec 会吃满 1GHz 的 CPU，100% 的使用率。

* 举个栗子 : 目标30FPS,使用的是2GHz CPU,20%给Draw Call来使用.

    那么 333 Batchs/Frame = 25K * 2 * (0.2/30).美妙的Dral Call不能超过333

    **计算公式 : 25K * Cpu Hz * 愿意分配的百分比资源(上面20%就是0.2) / 目标FPS**

* <font color = red>Draw Call优化的是CPU.GPU因为只处理图形功能是很强大,CPU要浪费大量指令在提交上,所以会出现的情况就是GPU已经渲染完了,在等着CPU提交指令.</font>

* 缓冲区 : CPU提交渲染指令. GPU读取渲染指令.

    * CPU : 渲染A
    * 缓冲区: 记录渲染A
    * CPU : 渲染B
    * 缓冲区 : 记录渲染B.
    * CPU : 渲染C
    * 缓冲区 : 记录渲染C.
    * GPU : 唰唰唰渲染完了(清空缓冲区指令).CPU你特么能不能快点啊.
    * CPU : ...
    * 缓冲区 : ...
    * 一分钟过后
    * CPU : 记录渲染D
    * GPU : 呼呼呼

# Unity在PlayerSetting中有两个功能选项:Static Batching和Dynamic Batching
* tatic Batching : 将表明是static的静态物体,如果是在使用相同的材质球的情况下,Unity会自动帮你把两个物体合并成一个Batch,送往GPU处理.(奶奶的付费版才有的功能)
* Dynamic Batching : 在物体小于300面的情况下 (不论是不是静态),在使用相同的材质球的情况下,Unity会帮你合并成一个Batch送往GPU处理.

 以上,我们知道每一个网格每使用一个不同的Material就是一个Draw Call.一个手机大概是每秒可以处理的就是30 - 60个Draw Call.(个狗日的说了半天就是打包图集,意义都没说,淦!)
 另外一种理解方式 : 10000个1KB的文件跟一个10MB的文件.赋值粘贴的操作中,10MB的速度明显比10000个1KB的速度快,因为前者中有跟多重复的操作.所以降低Draw Call可以理解是优化重复步骤的操作.

# 优化Draw Call

* 以上.可知减少Draw Call的方法就是减少需要渲染的材质种类.通过Draw Call Batching来减少数量. 但是,并不是Draw Call越少越少.因为合并Beatch之后,会造成同一时间需要传输的数据(Texture VB IB)等大量增加,以至于造成带宽堵塞.资源在无法快速传输过去的时候,GPU会处于等待状态.这个时候也是会降低帧率的.(反正只要你敢让GPU等,那么就一定会降低帧率)

1. **静态批处理Static batching** 虽然减少了Draw Call,但是需要额外的内存去存储合并之后的几何结构.所以,在静态批处理之前,如果几个对象共享相同的几何结构,那么将为每个对象创建一个几何图形.会占用部分内存.使用讲台批处理很简单的啦,只用在PlayerSetting中勾选Static Batching就可以的啦.

2. **动态批处理Dynamic batching:** 如果动态物体使用着同一个材质球,那么Unity会自动对这些物体进行批处理

    * 1. 必须是小于900个网格顶点的物体, 300面.
    * 2. 如果着色器使用了顶点位置 法线 和UV三种值.那么只能批处理300个顶点一下的物体,也就是100面.
    * 3. 不要使用缩放尺度. 使用缩放尺度(1,1,1)和 (1,2,1)的两个物体将不会进行批处理.但是使用缩放尺度(1,2,1)和(1,3,1)的两个物体将可以进行批处理.<font color = red>在unity5中，动态批处理对于模型缩放的限制已经不存在了。</font>
    * 4. 所以，拥有lightmap的物体将不会进行批处理（除非他们指向lightmap的同一部分）

3. **UGUI批处理:** 在UGUI中,Batch是以Canvas为单位的,即在同一个Canvas下的UI元素最终都会被Batch到同一个Mesh中.但是在Batch前,UGUI会将UI元素的材质(通常就是Atlas)进行重排.在不改变渲染结果的前提下,尽可能的将相同材质的UI合并在同一个SubMesh下.尽可能的把DrawCall降到最低.

    <font color = red>建议: 将频繁变化的(位置,颜色,长宽等)的UI元素从复杂的Canvas中分离出来,因为每次改变都会引起整个Canvas的重构.</font> 

4. **粒子系统的批处理:** Unity会自动将若干个材质以及深度相同的例子系统在合并前进行合批,从而通过一个Draw Call来降低渲染的开销.

    补充:粒子系统的批处理与半透明物体的动态合批机制相当.对于半透明的物体,由于其渲染顺序是从后向前渲染.(必须如此,保证渲染的正确性).动态拼合只能对渲染顺序相邻且材质相同的物体有效。而在决定半透明物体的渲染顺序时，Unity首先会按Shader中的RenderQueue进行排序；其次（相同RenderQueue时），会根据每个半透明物件到屏幕的距离，距离大的优先渲染。因此，需要尽可能地将相同材质的粒子系统放在比较接近的深度下，才能更多地使动态拼合生效。但通常由于相机的运动、粒子系统的分散分布等原因造成粒子系统之间的穿插，能够动态拼合的数量往往都是很少的，所以我们在粒子系统模块看到的开销分布通常类似该图，主要都是未拼合粒子系统造成。(**说了半天没卵用,因为很多都没法合到一起**)

5. **Mesh批处理：** 带有蒙皮的Mesh不支持哦.可以用插件来搞.(MeshBaker)

6. Shader中Pass语句块越多(因为要引用材质),就会产生更多的Draw Call.

# 合并网格
```C#

using UnityEngine;  
using System.Collections;  
  
[RequireComponent(typeof(MeshRenderer))]  
[RequireComponent(typeof(MeshFilter))]  
public class CombineTest : MonoBehaviour {  
  
    void Start ()   
    {  
        //获取材质  
        MeshRenderer[] meshRenderers = GetComponentsInChildren<MeshRenderer>();  
        Material[] materials = new Material[meshRenderers.Length];  
  
        for (int i = 0; i < meshRenderers.Length; i++)  
        {  
            materials[i] = meshRenderers[i].sharedMaterial;  
        }  
  
        //获取mesh，使用CombineInstance类是因为CombineMeshes方法的需要  
        MeshFilter[] meshFilters = GetComponentsInChildren<MeshFilter>();  
        CombineInstance[] combineInstances = new CombineInstance[meshFilters.Length];  
  
        for (int i = 0; i < meshFilters.Length; i++)  
        {  
            combineInstances[i].mesh = meshFilters[i].sharedMesh;  
            //模型空间坐标转化为世界坐标  
            combineInstances[i].transform = meshFilters[i].transform.localToWorldMatrix;  
            //隐藏子物体  
            meshFilters[i].gameObject.SetActive(false);  
        }  
  
        //合并材质  
        transform.GetComponent<MeshRenderer>().sharedMaterials = materials;  
        //合并网格  
        transform.GetComponent<MeshFilter>().mesh = new Mesh();
        transform.GetComponent<MeshFilter>().mesh.CombineMeshes(combineInstances,false);  
        transform.gameObject.SetActive(true);  
    }  
}

```

```C#
void CombineMeshes(CombineInstance[] combine, bool mergeSubMeshes = true, bool useMatrices = true);
```
结合网格有利于性能最优化。如果mergeSubMeshes为true，所有的网格会被结合成一个单个子网格。否则每一个网格都将变成单个不同的子网格。如果所有的网格共享同一种材质，设定它为真。如果useMatrices为false，在CombineInstance结构中的变换矩阵将被忽略。
