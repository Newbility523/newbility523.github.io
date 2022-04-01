```C#
Shader "Custom/SurfaceShaderTest" {
	Properties {
		_MainTex("Main Texture", 2D) = "White"{}
		_BumpMap("BumpMap", 2D) = "bump"{}
		_RimColor("RimColor", COLOR) = (0.26, 0.19, 0.16, 0.0)
		_RimPower("RimPower", Range(0.5, 8.0)) = 3.0
	}
	SubShader{
		Tags{"RednderType" = "Opaque"}

		CGPROGRAM
		#pragma surface surf Lambert
		struct Input{
			float2  uv_MainTex;
			float2  uv_BumpMap;
			float2 viewDir;
		};
		sampler2D _MainTex;
		sampler2D _BumpMap;
		float4 _RimColor;
		float3 _RimPower;
		void surf(Input IN, inout SurfaceOutput o)
		{
			o.Albedo = tex2D(_MainTex, IN.uv_MainTex).rgb;
			o.Normal = UnpackNormal(tex2D(_BumpMap, IN.uv_BumpMap));
			half rim = 1.0 - saturate(dot(normalize(IN.viewDir), o.Normal));
			o.Emission = _RimColor.rgb * pow(rim, _RimPower);
		}
		ENDCG
	}
	FallBack "Diffuse"
}

```

# 注意项
1. struct Input{XX};结构体是要以<font color = red>分号结尾</font>的!

2. 有些特殊变量大小写是固定的,例如法线:`Normal`,如果写成`normal是会报错的`.(操蛋)

3. Input的结构体中,如果以uv开头的话,那么后面跟的变量必须是Properties中声明的变量(名字不能变).因为要从这些变量中取UV值.而且必须是2D Cube等这些贴图类型.其它的倒是可以自己随意命名.

4. Input结构体中的变量必须用IN.XXX调用.自定义的变量如果不在输入结构中可以不用.

5. Inout SurfaceOutput o结构的属性都是<font color = red>大写</font>开头的!,小写是会报错的.

6. properties中不区分大小写

# 法线贴图(Normal Mapping)

法线贴图简单的说就是在不增加模型多边形数量的前提下,通过渲染暗部和亮部的不同颜色深度,来为原来的贴图和模型增加视觉细节和真实效果.

简单原理就是在普通是贴图的基础上,再另外提供一张对应原来贴图的,可以渲染浓淡的贴图.

``o.Normal = UnpackNormal(tex2D(_Bump, IN.uv_Bump);``
UnpackNormal就是CG语言中设置法线的函数.

# 光照模型
Lambert是一个很经典的漫反射模型.光强和入射光的方向和反射点处表面法线方向夹角的余弦成正比.简单的解释就是一个点的反射光强是和该点的法线向量和入射光向量和强度和夹角有关系的.(就特么是两个向量的点积.)

# 自定义光照模型
```C#
#pragma surface surf CustomDiffuse

		inline float4 LightingCustomDiffuse(SurfaceOutput s, fixed3 lightDir, fixed atten)
		{
			float difLight = max(0, dot(s.Normal, lightDir));
			float4 col;
			col.rgb = s.Albedo * _LightColor0.rgb * (difLight * atten * 2);
			col.a = s.Alpha;
			return col;
		}
```

1. 我们自定义的光照名称为CustonDiffuse.
2. 实现光照函数 : <font color = red>Lighting(Lighting name)</font>.我们在上面个定义的光照模型的名字为CustonDiffuse,所以要实现的光照函数的名称就是LightingCustomDiffuse.(类似与uv_MainTex,uv是一种特殊操作符,对_MainTex进行uv的取值,这边的Lighting也是同样的作用).
3. 所以我们以前用的Lambert其实也是有一个叫做LightingLambert的函数的.在Unity的内建Shader中,有一个叫Lighting.cginc文件.里面就包含了对LightingLambert的实现.
4. **SurfaceOutput s :** 经过表面计算函数surf处理后的输出.我们将对其上面的点进行光线的处理.

	**fixed3 lightDir** 光线方向

	**fixed atten** 表示光衰减的系数

# pass语句块

```C#
	pass{
			Name "PASSNAME"
			color[_Color]  //着色
			Material{
				diffuse[_Color]  //漫反射
				ambient[_Ambient] //环境光
				specular[_Specular]  //镜面反射
				shininess[_Shininess] //高亮部位大小(光照反射高光部位，比如光头的发光点)
				emission[_Emission] //自发光
			}
			Lighting on  //开启光照或者反射的话必须要打开光照
			separatespecular on  //镜面反射必须要打开的属性

			settexture[_MainTex]  //[自选参数，一般都是定义在Properties中]
			{
				combine texture * primary double
			}

			settexture[_MainTex2]  //[自选参数，一般都是定义在Properties中]
			{
				constantColor[_ConstantColor]  //一个固定值的Color
				combine texture * previous double, texture * constant
			}
		}
```

## Name

Pass的命名必须是`大写`

## Material
Material可以变相的理解是对当前材质的操作.给其加上各种各样的环境变量然后计算颜色.

`diffuse[Color]` 漫反射的光照.Color是一个我们在Properties中声明的一个变量.
`ambient[Color]` 环境光.指定一个环境光,然后计算被环境光照射之后的颜色.
`specular[Color]` 镜面光. 用于在直接光照的部位产生高强光.
`shininess[Range]` 高光区域大小. 需要传入的是一个Range类型参数.
`Emission[_Color]` 自发光.

## combine

`combine texture * primary double`,第一个settexture之前,我们计算了一部分顶点光照的数据，但是在combine的时候我们只混合了输入的_MainTex,并没有混合已经计算过的顶点光照数据。所以在这边乘了一个`primary`,这是Fixed Function Shader中一个关键词，代表的是以上已经计算过的顶点光照之后的一个颜色值。因为颜色值都是0-1之间的变量，所以两个相乘之后会变得比其中任意一个都要小。所以，`double`表示的就是当前的计算值翻倍。也就是`（combine testure * primary） * 2`,还有一个`quad`，代表的是四倍。

combie的第二个参数我们传了一个texture.作用是使用texture本身的Alpha值.那么就要求材质本身勾选了`Alpha from GrayScal`选项(算是开启材质的Alpha透明度),参数之间是用`,`隔开的.

`constantColor[_ConstantColor]` 设置一个固定值的颜色.后面的textute * `constant`,代表用自定义的固定值颜色的Alpha值.`constant`是一个内部变量.


## settexture
如果要混合多张Texture，是不能在settexture[]中再增加一个函数的，应该是再声明一个同样的settexture[]函数，但是两个各自传入的2D Texture不同。并且，要记得primary只是第一个settexture之前的颜色，所以需要将`primary`更换为`previous`,`previous`代表的是当前settexture以上全部的颜色值。

settexture是有限的。不能写很多个,但是基本最少都支持两个。

## constantColor
自定义的一个颜色.可用用关键字`constant`进行访问.主要用来在coimbinr中跟texture进行想成获取Alpha值.