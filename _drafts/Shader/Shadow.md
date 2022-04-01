# 阴影

1. Pass 的 Tags 设置 `"LightMode" = "ShadowCaster"` 来表明该 Pass 为投射阴影 Pass，否则当 Shader 的包含 Fallback 时，会找 Fallback 中其他投射阴影 Pass。
2. 引用 UnityCG.cginc 和声明 multi_compile_shadowcaster，UnityCG 包含下面要用到所有宏
3. a2v 中需要包含有 vertex，tangent，normal。
4. v2f 需要包含有 V2F_SHADOW_CASTER，这里申明投射阴影需要参数。
5. vert 输入参数需要设置为 v，使用 TRANSFER_SHADOW_CASTER_NORMALOFFSET(o) 宏定义填充 v2f 中的 V2F_SHADOW_CASTER 变量。如果还包括顶点动画，需要在顶点动画之后再使用 TRANSFER_SHADOW_CASTER_NORMALOFFSET(o)。
6. frag 中片元裁减后，通过 SHADOW_CASTER_FRAGMENT(i) 输出即可。
