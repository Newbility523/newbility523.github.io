``` C#
Shader "Custom/Diffuse Texture" {
	Properties {
		_MainTex ("Base (RGB)", 2D) = "white" {}
	}
	SubShader {
		Tags { "RenderType"="Opaque" }
		LOD 200
		
		CGPROGRAM
		#pragma surface surf Lambert

		sampler2D _MainTex;

		struct Input {
			float2 uv_MainTex;
		};

		void surf (Input IN, inout SurfaceOutput o) {
			half4 c = tex2D (_MainTex, IN.uv_MainTex);
			o.Albedo = c.rgb;
			o.Alpha = c.a;
		}
		ENDCG
	} 
	FallBack "Diffuse"
}
```
## Shader "Custom/Diffuse Texture" 
* 声明Shader文件位置,引用的时候会看到.

## Properties
* Shader检视面板可见属性.

## 定义规则: <font color = red>**_Name("Display Name", type) = defaultValue[{options}]**</font>
* _Name : Shader内部中可以引用的属性名称.
* Display Name : 检视面板可见属性名称.
* type : 属性类型

    * Color : RGBA的颜色色值
    * 2D : 一张2的阶数大小的贴图.这张贴图在采样之后会被转为对应的基于模型UV的每个像素的颜色,最终被显示出来.
    * Rect : 一个非二阶大小贴图,其余同上
    * Cube : Cube map texture(立方体纹理),简单说就是六张2D贴图的组合.主要用来做反射效果(天空盒和动态反射),也会被转成对应点的采样.
    * Range(min, max) : 介于最小值与最大值之间的一个浮点数,一般用来当作调整Shader某些特性的参数 (比如透明度的渲染截至值可是是从0到1之间的值等)
    * Float : 一个浮点数
    * Vextor : 一个四维数

* defaultValue : 定义当前声明属性的默认值

    * Color : 比如(1, 1, 1, 1)
    * 2D/Cube/Rect : 贴图类型的,默认值可以是一个代表默认tint颜色的字符串,可以是空字符串或者"white" "black"之类.
    * Float Range : 一个浮点型的数
    * Vector : 一个四维数(x, y, z, w)

* {option} : 只跟2D/Cube/Rect之类的贴图属性有关.在写输入的时候至少实在贴图之后加一个什么都不包含的空白 {} .当我们需要一些特定选项的收可以把它卸载这对花括号内部.多个选项的时候可以用空格分开.可能的选择有ObjectLinear, EyeLinear, SphereMap, CubeReflect, CubeNormal中的一个，这些都是OpenGL中TexGen的模式.

```C#
   _MainColor("Main Color", Color) = (0, 0, 0, 0)
   _Texture("Texture", 2D) = "white"{}
```

# Tags

表面着色器被若干的Tags修饰,而硬件会通过判断这些标签来决定什么时候调用该着色器.

* Tags{"RenderType" = "Opaque"}
意义就是在渲染非透明物体的时候调用当前的SubShader,那么"RenderType" = "Transparent"表示在含有透明物体的时候调用(调用的都是当前的SubShader)
* 比较常用的有用的标签 : "IgnoreProjector" = "True"(不被Projector影响),
"ForceNoShadowCasting" = "True"(从不产生阴影),以及"Queue" = "XXX"(渲染顺序队列).

    * Background : 最早被调用的渲染(用来渲染天空盒或者背景)
    * Geometry : 默认值,用来渲染非透明物体
    * AlphaTest : 用来渲染经过AlphaTest的像素,单独为AlphaTest设定一个Queue是出于对效率的考虑
    * Transparent : 以从后往前的顺序渲染透明物体
    * Overlay : 用来渲染叠加效果,是渲染的最后阶段(镜头光晕之类的特效)

    这些预设值本质上是一组定义的整数, Background = 1000, Geometry = 2000, AlpaTest = 2450, Transparent = 3000, 最后Overlay = 4000,而我们在设置Queue的时候也可以自定义一些值.比如 "Queue" = "Background + 1000"之类的自定义类型.

# LOD
Level of detial.这个数值决定了我们能用什么样的Shader.在Unity Qulity Setting中我们可以设定允许的最大LOD.当设定的LOD值小于但却概念SubShader所设定的LOD时,这个Shader将不可用.

* VertexLit及其系列 = 100
* Decal, Reflective VertexLit = 150
* Diffuse = 200
* Diffuse Detail, Reflective Bumped Unlit, Reflective Bumped VertexLit = 250
* Bumped, Specular = 300
* Bumped Specular = 400
* Parallax = 500
* Parallax Specular = 600

# Shader本体

```C#
CGPROGRAM
#pragma surface surf Lambert

sampler2D _MainTex;

struct Input {
	float2 uv_MainTex;
};

void surf (Input IN, inout SurfaceOutput o) {
	half4 c = tex2D (_MainTex, IN.uv_MainTex);
	o.Albedo = c.rgb;
	o.Alpha = c.a;
}
ENDCG
```
* **CGPROGRAM ENDCG** 一段开始结束的标记,表明从CGPROGRAM开始一段CG程序(Unity中的SHader用的是Cg/HLSL语言).最后的ENDCG是结束的标记.

* **#param surface surf Lambert** : 一个编译指令.声明我们要写的是一个表面(surface)Shader.并且指定了光照模型(Lambert).
    
    * 语法:#param surface **surfaceFunctionName** lightModel[optionparams]

        * surface : 声明是一个表面着色器(可以看作是一个类型)
        * surface FunctionName : 着色器代码方法名字
        * lightModel : 使用的光照模型

* **sampler2D _MainTex**

    1. 在CG中,sampler2D就是和Textture绑定的一个数据容器的接口.Texture本身也是一块在内存中存储的.使用了RGB通道,每个通道有8bits的数据(读取到内存中之后才有以上属性).而具体的想知道这些像素与坐标对应的关系,以及获取这些数据,不可能一次次的自己计算内存地址或者偏移.所以可以通过sampler2D来对贴图进行操作.

    2. 虽然我们在Proprites中声明了一个_MainTex,但是那是在CGPROGRAM的外部.如果我们想在当前的SubShader的CG程序段内使用的话就需要再一次声明.<font color = red>必须使用和之前变量相同的名字进行声明</font>.其实sampler2D _MainTex做的事情就是再次声明并且链接了_MainTex,是的CG中的程序可以使用这个变量.

* **surf函数**

    在#param中我们已经声明了表面函数(surface)方法名字是surf(有点像是重写),所以surf函数就是着色器的工作核心.
    
    <font color = red>着色器,就是给定了输入,然后给输出进行着色的代码.规定: 1.第一个参数是Input参数,输入. 2.第二个参数是input的SurfaceOutput结构,输出.</font>

    <font color = yellow>Input是需要我们自己定义的结构</font>,所以我们休要把参与计算的数据都放到Input结构中,最后传入到surf中使用.**SurfaceOutput**是已经定义好的输出结构,但是初始化的内容暂定是空白的,需要我们定义输出的内容.

* **Input自定义输入结构**

    <font color = red>作为自定义的输入,必须命名为Input</font>

    ```C#
        struct Input {
	        float2 uv_MainTex;
        };
    ```

    以上,我们定义了一个float2类型的变量. uv_MainTex. _MainTex是我们自定一的samopler2D类型的一个变量.前面加上uv,代表提取_MainTex的uv值.

    uv mapping : 将一个2D贴图上的点按照规则映射到3D模型上.

    float2 : 厉害了,代表的是两个float类型.同理,float3代表的是三个float类型.
    vec2 vec3 vec4同上.

* **Surfaceoutput结构**
    ```C#
    struct SurfaceOutput {
        half3 Albedo;     //像素的颜色
        half3 Normal;     //像素的法向值
        half3 Emission;   //像素的发散颜色
        half Specular;    //像素的镜面高光
        half Gloss;       //像素的发光强度
        half Alpha;       //像素的透明度
    };
    ```
    half跟float都是浮点类型.但是half的精度要低一些,运算性能比较高.

* **shader内部(例子)**
    ```C#
    void surf (Input IN, inout SurfaceOutput o) {
			half4 c = tex2D (_MainTex, IN.uv_MainTex);
			o.Albedo = c.rgb;
			o.Alpha = c.a;
		}
    ```
    这里面用到了一个tex2D的函数.这是CG程序中用来在一张贴图中对一个点进行采样的方法.返回的是一个float4类型(这边应该是为了方便计算所以返回的float4类型强制转换成了低精度的half4类型,都是4个哦),这里是对_MainTex在输入点进行的采样.所以这代码的意思就是提取_MainTex的uv坐标,然后将rgb(颜色)和a(alpha透明度)赋值给输出.

以上.

实例Shader : https://docs.unity3d.com/Manual/SL-SurfaceShaderExamples.html

参考博客 : https://onevcat.com/2013/07/shader-tutorial-1//