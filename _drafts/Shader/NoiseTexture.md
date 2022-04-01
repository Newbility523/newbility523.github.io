# 噪点纹理

当 shader 的效果中需要一些随机值时，实现生产随机值会比运行时生成效率更高，也更可控。我们会把这些随机值存进图片中，称为噪点图。

噪点图分多种，有的变化具有连续性，有的具有突变性，有的会像登高图，具有几何形状。

## 消融效果

游戏中，怪物死亡后的消融效果，就是使用了噪点图。根据噪点图取值 n，然后裁减掉 n < q 的片元，q 为 [0, 1] 且随时间增涨。

``` ShaderLab
...
Cull Off
...
fixed4 frag(v2f i) : SV_TARGET {
    // 裁减掉 r 值不足 _Dissolve 的片元。
    fixed noiseValue = tex2D(_NoiseMap, i.uv).r;
    fixed burnValue = noiseValue - _Dissolve;
    clip(burnValue);

    fixed3 albedo = tex2D(_MainTex, i.uv).rgb * _Color.rgb;
    fixed3 tangentNormal = UnpackNormal(tex2D(_BumpMap, i.uv));
    tangentNormal.xy *= _Temp;
    tangentNormal = normalize(tangentNormal);
    fixed3 tangentLightDir = normalize(i.tangentLightDir);

    fixed3 ambient = UNITY_LIGHTMODEL_AMBIENT.rgb * albedo;

    UNITY_LIGHT_ATTENUATION(atten, i, i.worldPos);
    fixed3 diffuse = _LightColor0.rgb * albedo * max(0, dot(tangentNormal, tangentLightDir)) * atten;

    // 除了裁减，还将 _Dissolve ~ _DissolveWidth + _Dissolve 间的片元进行颜色过渡
    fixed3 burnColorWeight = smoothstep(0, _DissolveWidth, burnValue);
    fixed3 burnColor = lerp(_BurnOutsideColor, _BurnInsideColor, burnColorWeight);
    // 因为消融效果类似燃烧，所以用粗暴的次方提亮颜色。
    burnColor = pow(burnColor, 5);

    diffuse = lerp(burnColor, diffuse, burnColorWeight);

    return fixed4(ambient + diffuse, 1.0);
}
```

因为消融后，透过消失的片元应该能看到物体内部，所以 `Cull Off` 将背面进行渲染和自定义一次阴影投射。

``` ShaderLab
// Shadow Caster
Pass {
    Tags {
        "LightMode" = "ShadowCaster"
    }

    CGPROGRAM

    sampler2D _MainTex;
    half4 _MainTex_ST;
    sampler2D _NoiseMap;
    float _Dissolve;

    #pragma vertex vert
    #pragma fragment frag
    #include "UnityCG.cginc"
    #pragma multi_compile_shadowcaster

    struct a2v {
        float4 vertex : POSITION;
        float4 tangent : TANGENT;
        float3 normal : NORMAL;
        float4 texcoord : TEXCOORD0;
    };

    struct v2f {
        V2F_SHADOW_CASTER;
        float2 uv : TEXCOORD1;
    };

    v2f vert(a2v v) {
        v2f o;

        TRANSFER_SHADOW_CASTER_NORMALOFFSET(o)
        o.uv = TRANSFORM_TEX(v.texcoord, _MainTex);

        return o;
    }

    fixed4 frag(v2f i) : SV_TARGET {
        fixed burnValue = tex2D(_NoiseMap, i.uv).r;
        clip(burnValue - _Dissolve);

        SHADOW_CASTER_FRAGMENT(i)
    }

    ENDCG
}
```

阴影的原理说明[阴影的实现](./Shadow.md)