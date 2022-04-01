# 画面颜色调整

* 亮度、曝光
* 饱和度、黑白
* 对比度

对于各种画面效果的调整，并没有标准的说法，而且网上大神的同一效果的实现也不尽相同。例如，最简单的亮度调整，是整体 RGB 值增减 n 还是乘以 n 呢，对于前面的做法是不会影响饱和度的，而后面则会。我的理解来说，更愿意称前一种为调整亮度，后一种为调整曝光。但由于实现调整画面的目的，目的是为了将美术同志的实现的效果展示在游戏中，所以就以美术使用的工具 Ps 为准。(以下效果都以美术的描述或 Ps 为准)

总的来说，亮度，饱和度，对比度是互相影响的，改变任何一项，都会带来其他项的变化

## 亮度、曝光

处理是类似的，将原 RGB 颜色整体向增加的方向调整，只是曝光的处理应比亮度的调整更剧烈。

``` cg
第一种做法
    outColor = inColor + (n, n, n)  // 亮度
    outColor = inColor * n          // 曝光

第二种做法
    outColor = inColor * n          // 亮度
    outColor = inColor * 2^n        // 曝光
```

## 饱和度

饱和度是有具体数值公式的，完全可以粗暴的将 RGB 转为 HBS 后，单独调整 HBS 再转为 RGB，但是效率偏低。饱和对最低就是灰色，可以调整灰色在原色中比例来达到调整饱和度的效果。但是 (0.1, 0.1, 0.1) 是灰，(0.9, 0.9, 0.9) 也是灰，要用那个呢。调整饱和度，不应该改变亮度，所以要去当前亮度的灰色值。

``` cg
gray = inColor.r * 0.2125 + inColor.g * 0.7154 + inColor.b * 0.0721
colorGray = (gray, gray, gray)
outColor = lerp(colorGray, inColor, _Saturation)
```

其中 (0.2125, 0.7154, 0.0721) 是一条求灰色的经验公式，也可以换成 (0.299, 0.587, 0.114)。注意，这些公式的各分量的和都会为 1。

所以，以上经验公式也能运用在置灰的 shader 上

## 对比度

对于对比度的调整的理解，是最迷惑的。

有说法为：“增加对比对，是让亮的更亮，暗的更暗”。也有说法补充到：“增加对比度，会让颜色更鲜明”。基于这两种说法，做法可能完全不同。

假设亮度可以度量，对于第一种说法，就要先找到画面中间的亮度，基于中间亮度，对当前 RGB + n，这个操作是对整个 RGB **同向**。对于第二种说，提到了饱和度的相关的表现，那这种操作应该是对 RGB **非同向**，取一个中间的亮度，调整各分量距离该亮度的偏移程度。

在《Shader 入门精要》中，选用的是第二种。

``` cg
midColor = (0.5, 0.5, 0.5)
outColor = left(midColor, inColor, _Contrast)
```

## 边缘检测 Edge detect

如果单纯从颜色出发，区分边缘的标准可以以颜色、亮度、纹理等属性，通过卷积核，对当前像素为中心的 9 宫格赋予不同权重，得出当前像素的 "边缘值"。最后根据 "边缘值" 对当前颜色添加一定的边缘颜色即可。

常见的卷积核

* Roberts
* Prewitt
* Sobel

以下例子以灰度值作为边缘标准，Sobel 作为算子

``` Shader Lab
v2f vert(a2v i) {
        v2f o;
        o.pos = UnityObjectToClipPos(i.pos);

        half2 uv = TRANSFORM_TEX(i.texcoord, _MainTex);
        o.uv[0] = uv + _MainTex_TexelSize * half2(-1, -1);
        o.uv[1] = uv + _MainTex_TexelSize * half2(0, -1);
        o.uv[2] = uv + _MainTex_TexelSize * half2(1, -1);
        o.uv[3] = uv + _MainTex_TexelSize * half2(-1, 0);
        o.uv[4] = uv;
        o.uv[5] = uv + _MainTex_TexelSize * half2(1, 0);
        o.uv[6] = uv + _MainTex_TexelSize * half2(-1, 1);
        o.uv[7] = uv + _MainTex_TexelSize * half2(0, 1);
        o.uv[8] = uv + _MainTex_TexelSize * half2(1, 1);

        return o;
    }

    float luminance(fixed4 color) {
        return 0.2125 * color.r + 0.7154 * color.g + 0.0721 * color.b;
    }

    float Sobel(v2f info) {
        half Gx[9] = {
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        };

        half Gy[9] = {
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        };

        float edge = 0;
        float curColor = 0;
        float edgeX = 0;
        float edgeY = 0;

        for (int i = 0; i < 9; ++i) {
            curColor = luminance(tex2D(_MainTex, info.uv[i]));
            edgeX += Gx[i] * curColor;
            edgeY += Gy[i] * curColor;
        }

        edge = 1 - abs(edgeX) - abs(edgeY);

        return edge;
    }

    fixed4 frag(v2f i) : SV_TARGET {
        half edge = Sobel(i);

        edge = lerp(edge, 1, 1 - _EdgeScale);
        fixed3 colorWithEdge = lerp(_EdgeColor, tex2D(_MainTex, i.uv[4]), edge);
        fixed3 colorOnlyEdge = lerp(_EdgeColor, _EdgeBgColor, edge);
        fixed3 finalColor = lerp(colorWithEdge, colorOnlyEdge, _EdgeOnly);
        return fixed4(finalColor, 1.0);
    }
```

注意

* edge 越小表示边缘约明显
* 关键点在于将周围 8 个像素的 uv 的传递给片元着色器

[另外一种做法，深度纹理实现边缘检测，更加精准](DepthTexture.md#示例三-边缘检测)

## 高斯模糊 Gaussian blur

模糊可以理解当前像素颜色掺杂周围像素的颜色。也是通过卷积赋予周围像素不同权重，但是为了亮度保持不变，权重的累加为 1。

当前像素坐标为 (x, y), 若算子的采样区间为 5 * 5，可以将简化采样区间，由 25 缩减为十字区间，即 ([x - 2, x - 1, x, x + 1, x + 2], y)，以及 (x, [y - 2, y - 1, y, y + 1, y + 2])。又由于对称性，权重数组只需定义到长度为 3 即可。

以下例子采用算子区间 5 * 5，且高斯权重从中心往边缘分别为 {0.4026, 0.2442, 0.0545}

``` Shader Lab
// Pass 1
v2f vert_gussain_vertical(a2v i) {
    v2f o;
    o.pos = UnityObjectToClipPos(i.pos);

    half2 uv = TRANSFORM_TEX(i.texcoord, _MainTex);
    o.uv[0] = uv;
    o.uv[1] = uv + half2(0, _MainTex_TexelSize.y) * 1.0 * _BlurSpread;
    o.uv[2] = uv - half2(0, _MainTex_TexelSize.y) * 1.0 * _BlurSpread;
    o.uv[3] = uv + half2(0, _MainTex_TexelSize.y) * 2.0 * _BlurSpread;
    o.uv[4] = uv - half2(0, _MainTex_TexelSize.y) * 2.0 * _BlurSpread;

    return o;
}

// Pass 2
v2f vert_gussain_horizontal(a2v i) {
    v2f o;
    o.pos = UnityObjectToClipPos(i.pos);

    half2 uv = TRANSFORM_TEX(i.texcoord, _MainTex);
    o.uv[0] = uv;
    o.uv[1] = uv + half2(_MainTex_TexelSize.x, 0) * 1.0 * _BlurSpread;
    o.uv[2] = uv - half2(_MainTex_TexelSize.x, 0) * 1.0 * _BlurSpread;
    o.uv[3] = uv + half2(_MainTex_TexelSize.x, 0) * 2.0 * _BlurSpread;
    o.uv[4] = uv - half2(_MainTex_TexelSize.x, 0) * 2.0 * _BlurSpread;

    return o;
}

fixed4 frag_gussain(v2f i) : SV_TARGET {
    half weight[3] = { 0.4026, 0.2442, 0.0545 };

    fixed3 color = fixed3(0, 0, 0);
    for (int it = 0; it < 5; ++it) {
        color +=  tex2D(_MainTex, i.uv[it]) * weight[ceil(it * 0.5)];
    }

    return fixed4(color, 1.0);
}
```

注意

* 要简化采样区间就必须将横竖的模糊分开用两个 Pass 处理。
* 增强模糊效果可以通过多次模糊，图像压缩或者适当拉大采样。

## 泛光 Bloom

泛光是常用的一种后期处理方式，大致的流程为提取图像中的高亮区域，仅对这些区域进行模糊后，再和原图像融合。

``` Shader lab
// 提取高亮部分
v2f vert(a2v i) {
    v2f o;
    o.pos = UnityObjectToClipPos(i.pos);
    o.uv = TRANSFORM_TEX(i.texcoord, _MainTex);

    return o;
}

float luminance(fixed3 color) {
    return 0.2125 * color.r + 0.7154 * color.g + 0.0721 * color.b;
}

// Pass 1
// _LuminanceThreshold 高亮区域判定阈值
fixed4 frag(v2f i) : SV_TARGET {
    fixed3 color = tex2D(_MainTex, i.uv);
    float val = clamp(luminance(color) - _LuminanceThreshold, 0, 1);

    return fixed4(color * val, 1);
}

// 合并
v2f_bloom vert_bloom(a2v i) {
    v2f_bloom o;
    o.pos = UnityObjectToClipPos(i.pos);
    o.uv.xy = TRANSFORM_TEX(i.texcoord, _MainTex);
    o.uv.zw = TRANSFORM_TEX(i.texcoord, _BloomTex);

    #if UNITY_UV_STARTS_AT_TOP
    if (_MainTex_TexelSize.y < 0.0) {
        o.uv.w = 1.0 - o.uv.w;
    }
    #endif

    return o;
}

// Pass 2, 3 模糊 Pass，同上

// Pass 4
fixed4 frag_bloom(v2f_bloom i) : SV_TARGET {
    fixed3 colorOri = tex2D(_MainTex, i.uv.xy);
    fixed3 colorBloom = tex2D(_BloomTex, i.uv.zw);

    return fixed4(colorOri + colorBloom, 1);
}

ENDCG
```

注意

* 提取出的 _BloomTex 要注意平台 uv 值差异

## 运动模糊

即将当前的画面和前一帧画面进行一定比例的融合，要点在于要缓存上一帧的处理后的相机纹理。

``` C#
[Range(0.0f, 0.9f)]
public float blurAmount = 0.5f;
private RenderTexture accumulationTexture;

private void OnRenderImage (RenderTexture src, RenderTexture dest)
{
    if (accumulationTexture == null || accumulationTexture.width != src.width || accumulationTexture.height != src.height)
    {
        DestroyImmediate(accumulationTexture);
        accumulationTexture = new RenderTexture(src.width, src.height, 0);
        accumulationTexture.hideFlags = HideFlags.HideAndDontSave;
        Graphics.Blit(src, accumulationTexture);
    }

    accumulationTexture.MarkRestoreExpected();

    material.SetFloat("_BlurAmount", 1.0f - blurAmount);

    Graphics.Blit (src, accumulationTexture, material);
    Graphics.Blit (accumulationTexture, dest);
}
```

shader 混合比较简单

``` Shader lab
Pass {
    Blend SrcAlpha OneMinusSrcAlpha One Zero

    // ...

    fixed4 frag (v2f i) : SV_TARGET {
        return fixed4(tex2D(_MainTex, i.uv).rgb, _BlurAmount);
    }
}
```

[运动模糊也可以通过深度纹理实现](DepthTexture.md#示例一-运动模糊-深度纹理版)
