# 深度纹理 Depth Texture

深度纹理是指将深度信息缓存在一张纹理贴图中。

但需要注意的是，深度的纹理颜色数值并不像法线贴图直接。法线贴图是直接通过 RG 通道存储 xy 轴分量，通过简单的映射就得到实际的法线方向。

深度纹理则是将 NDC 的 Z 轴转为一种**灰色**，所以也会有特定的编码和解码算法，按我的理解 NDC 完全可以像发现贴图直接映射即可，但可能是由于处理远裁平面精度丢失问题。目前找到的资料表明算法**可能**如下

``` Shader lab
// color belong to [0, 1]

```

所以需要通过有了 uv 后，通过 Unity 内置的深度纹理采样函数`SAMPLE_DEPTH_TEXTURE`和映射就可以获得 NDC 下的 Z 轴数值。

``` shader lab
// camera uv = uv_depth
float d = SAMPLE_DEPTH_TEXTURE(_CameraDepthTexture, i.uv_depth);
float3 ndc = float4(i.uv_depth.xy * 2 - 1, d * 2 - 1);
```

注意

* 用到深度纹理 shader 是放在相机 material 中的， 模型的（四边形平面）uv = uv_depth 自然是屏幕空间的四个角的 uv 值，所以 uv_depth.xy 可以直接映射回 NDC
* 此时 ndc 是三维的，w 还无法求得。

## 深度贴图转换坐标到世界空间

深度贴图可以用做处理一些全局雾效的效果，原理为对于不同高于的像素混杂雾效颜色。雾效的深度值为雾效的起始高度 - 像素高度，如果这个计算是在世界空间下进行，就要先求像素的世界坐标。

推导公式如下

``` Math
∵  NDC = (i.uv_depth.xy, depthColorValue, 1) * 2 - 1
    Clip.xyz / Clip.w = NDC
    MatrixClipToWorld 为裁剪空间转转世界空间矩阵
∴  MatrixClipToWorld * Clip.w * (NDC, 1) = World

∵  在透视投影变换以及转为 NDC 过程中，矩阵的变化是线性的，非线性是发生在 Clip / Clip.w 阶段。

∴  可以通过线性变化可以进行交换得
    Clip.w * MatrixClipToWorld * (NDC, 1) = World

∵  对于 World.w ，有 World.w 恒为 1
∴  Clip.w * (MatrixClipToWorld * (NDC, 1)).w = World.w = 1
    Clip.w = 1 / (MatrixClipToWorld * (NDC, 1)).w

∴  tempWorld = MatrixClipToWorld * (NDC, 1)
    World = tempWorld / tempWorld.w
```

公式的推导要点在于 Clip.w 的提前。我的理解是，透视投影是线性的，注意，是 Clip。这时候的坐标范围为 [-Clip.w, Clip.w]，w 又为 -View.z，非线性部分源于 Clip.w。

## 示例一 运动模糊 深度纹理版

通过当前帧世界坐标转裁减空间逆矩阵的，求得当前像素点在此时的世界位置，然后上一帧的透视投影矩阵转为上一帧的裁减空间坐标，再与当前像素的裁减空间坐标求差值，可得当上一帧相对于当前帧的运动向量（包含方向和大小）。

利用这个运动方向，取该方向上的屏幕纹理进行用一定比例融合，就能达到模糊效果。

``` ShaderLab
fixed4 frag(v2f i) : SV_TARGET {
    float d = SAMPLE_DEPTH_TEXTURE(_CameraDepthTexture, i.uv_depth);
    float4 ndc = float4(i.uv_depth.xy * 2 - 1, d * 2 - 1, 1);
    float4 tempWorldPos = mul(_CurrentViewProjectionInverseMatrix, ndc);
    float4 worldPos = tempWorldPos / tempWorldPos.w;

    float4 previousClip = mul(_PreviousViewProjectionMatrix, worldPos);
    float4 previousNDC = previousClip / previousClip.w;
    float2 speed = (ndc.xy - previousNDC.xy) / 2.0;

    float2 uv = i.uv;
    float4 c = tex2D(_MainTex, uv);
    uv += speed * _BlurSize;
    for (int it = 1; it < 3; it++, uv += speed * _BlurSize) {
        float4 currentColor = tex2D(_MainTex, uv);
        c += currentColor;
    }

    c /= 3;

    return fixed4 (c.rgb, 1.0);
}
```

这种运动模糊，会有以下几个问题

1. 这个版本的运动模糊是基于相机的透视投影矩阵变换，如果相机不发生移动，矩阵就不变，就不会有运动模糊效果。
2. 该模糊效果也是建立在当前相机纹理进行混合的，没有上一帧的画面缓存信息。所以对于弧形的运动模糊效果较差，只有直线的采样。
3. 如果 speed * _BlurSize 大于实际的位移距离就会在运动的反方向出现不合乎常理的幻影。

[另外一种做法，实现运动模糊](ColorAdjust.md#运动模糊)

## 示例二 雾效

上文已经提到雾效的计算原理，并介绍了通过矩阵 NDC 坐标转换到世界空间的推导。但是那种方法还是相对低效，可以利用向量和相机坐标的方式算出世界坐标。

对于屏幕任一一点，可以理为，世界坐标下，相机坐标沿着相机点位向近裁平面一点的方向唯一的结果。

``` Math
以下坐标均在世界坐标空间下，屏幕中心 O，相机位置 C，目标屏幕点位 P，目标对应的世界点位 Q，近裁平面深度 N，目标点位深度 D。

根据三角形相似有
CQ / CP = D / N
CQ = (D / N) * CP
```

其中 CP 可以通过先求的相机到近裁平面四个点向量，再通过插值得到。深度则由深度图得到。

具体实现如下

``` C#
private void OnRenderImage(RenderTexture source, RenderTexture destination)
{
    float nearPlane = camera.nearClipPlane;
    float fov = camera.fieldOfView;
    float aspect = camera.aspect;

    float upLength = nearPlane * Mathf.Tan(fov * 0.5f * Mathf.Deg2Rad);
    Vector3 baseForward = cameraTran.forward * nearPlane;
    Vector3 up = cameraTran.up * upLength;
    Vector3 right = cameraTran.right * upLength * aspect;

    Vector3 topLeft = (baseForward + up - right) / nearPlane;
    Vector3 topRight = (baseForward + up + right) / nearPlane;
    Vector3 downLeft = (baseForward - up - right) / nearPlane;
    Vector3 downRight = (baseForward - up + right) / nearPlane;

    Matrix4x4 matrix = Matrix4x4.identity;

    // 顺序很重要，需要和 shader 的判断对应
    matrix.SetRow(0, downLeft);
    matrix.SetRow(1, downRight);
    matrix.SetRow(2, topRight);
    matrix.SetRow(3, topLeft);

    material.SetMatrix("_FrustumCornersRay", matrix);
    material.SetFloat("_FogStart", fogStart);
    material.SetFloat("_FogEnd", fogEnd);
    material.SetFloat("_FogDensity", fogDensity);
    material.SetColor("_FogColor", fogColor);
}
```

``` ShaderLab
    ...
    sampler2D _MainTex;
    half4 _MainTex_TexelSize;
    float _FogStart;
    float _FogEnd;
    float _FogDensity;
    fixed4 _FogColor;
    float4x4 _FrustumCornersRay;    // 四个角的向量
    sampler2D _CameraDepthTexture;
    ...
    v2f vert(a2v i) {
        v2f o;
        o.pos = UnityObjectToClipPos(i.pos);

        o.uv = i.texcoord;
        o.uv_depth = i.texcoord;

        #if UNITY_UV_STARTS_AT_TOP
            if (_MainTex_TexelSize.y < 0)
                o.uv_depth.y = 1 - o.uv_depth.y;
        #endif

        int index = 0;

        if (o.uv.x < 0.5 && o.uv.y < 0.5)
            index = 0;
        else if (o.uv.x > 0.5 && o.uv.y < 0.5)
            index = 1;
        else if (o.uv.x > 0.5 && o.uv.y > 0.5)
            index = 2;
        else
            index = 3;

        #if UNITY_UV_STARTS_AT_TOP
            if (_MainTex_TexelSize.y < 0)
                index = 3 - index;
        #endif

        o.dir = _FrustumCornersRay[index];

        return o;
    }

    fixed4 frag(v2f i) : SV_TARGET {
        float d = LinearEyeDepth(SAMPLE_DEPTH_TEXTURE(_CameraDepthTexture, i.uv_depth));
        float3 worldPos = _WorldSpaceCameraPos + i.dir.xyz * d;

        float fog = (_FogEnd - worldPos.y) / (_FogEnd - _FogStart);
        fog = saturate(fog * _FogDensity);

        fixed4 mainColor = tex2D(_MainTex, i.uv);
        fixed4 resultColor = lerp(mainColor, _FogColor, fog);

        return fixed4(resultColor.rgb, 1.0);
    }
    ...
```

注意，片元着色器中的向量 dir 是通过顶点着色器中传过来的四个近裁平面的向量得到的，要留意 uv 和向量对应。

最后，计算出世界坐标高度，用高度融合一定比例的雾效颜色即可。

## 示例三 边缘检测

边缘检测如果单纯通过算子根据颜色值计算边界是不太准确的，这时候可以利用深度纹理。试想一下，一个平面前有个球，从相机向球的边界射出射线，刚触碰球的边界和刚脱离球边界而接触平面的射线深度是相差很大的。此外《Shader 入门精要》中还使用了法线的变化作为依据，在光滑的平面中会比较有效。

还是使用算子，不过把计算数据改为深度和法线。以下例子使用了 Robert 算子。

``` ShaderLab
    ...
    sampler2D _MainTex;
    float4 _MainTex_TexelSize;
    float _DetectSize;                      // 采样距离
    float _NormalScale;                     // 法线差距缩放
    float _DepthScale;                      // 深度差距缩放
    fixed4 _EdgeColor;
    float _EdgeOnly;
    sampler2D _CameraDepthNormalsTexture;   // 从相机获得的深度法线贴图，RG 通道为法线，BA 为深度纹理
    ...
    v2f vert(a2v i) {
        v2f o;
        o.pos = UnityObjectToClipPos(i.pos);

        float2 uv = i.texcoord.xy;
        o.uv[0] = uv;
        #if UNITY_UV_STARTS_AT_TOP
            if (_MainTex_TexelSize.y < 0)
                uv.y = 1 - uv.y;
        #endif

        o.uv[1] = uv + _MainTex_TexelSize.xy * half2(1, 1) * _DetectSize;
        o.uv[2] = uv + _MainTex_TexelSize.xy * half2(-1, -1) * _DetectSize;
        o.uv[3] = uv + _MainTex_TexelSize.xy * half2(-1, 1) * _DetectSize;
        o.uv[4] = uv + _MainTex_TexelSize.xy * half2(1, -1) * _DetectSize;

        return o;
    }

    float CheckSame(half4 sample1, half4 sample2) {
        half2 normal1 = sample1.xy;
        // 深度纹理需要特定的解码函数
        float depth1 = DecodeFloatRG(sample1.zw);
        half2 normal2 = sample2.xy;
        float depth2 = DecodeFloatRG(sample2.zw);

        // 法线纹理不需要解码，可以直接算差值，效果相近
        half2 normalDiff = (normal1 - normal2) * _NormalScale;
        float isNormalEdge = abs(normalDiff.x + normalDiff.y) > 0.1;
        float depthDiff = abs(depth1 - depth2) * _DepthScale;
        // 注意由于深度的非线性，对于深度范围较大的像素周围，深度差值也会迅速增大，所以根据深度放大判断标准 * depth1
        float isDepthEdge = depthDiff > 0.1 * depth1;

        return isNormalEdge * isDepthEdge ? 1.0 : 0.0;
    }

    fixed4 frag(v2f i) : SV_TARGET {
        float edge = 1;
        half4 sample1 = tex2D(_CameraDepthNormalsTexture, i.uv[1]);
        half4 sample2 = tex2D(_CameraDepthNormalsTexture, i.uv[2]);
        half4 sample3 = tex2D(_CameraDepthNormalsTexture, i.uv[3]);
        half4 sample4 = tex2D(_CameraDepthNormalsTexture, i.uv[4]);

        edge *= CheckSame(sample1, sample2);
        edge *= CheckSame(sample3, sample4);

        fixed4 oriColor = tex2D(_MainTex, i.uv[0]);
        fixed4 color = lerp(oriColor, _EdgeColor, edge * _EdgeOnly);

        return fixed4(color.rgb, 1.0);
    }
    ...
```

[另外一种做法，实现边缘检测](ColorAdjust.md#边缘检测-Edge-detect)
