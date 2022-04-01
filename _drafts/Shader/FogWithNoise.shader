Shader "Fog with noise" {
    Properties {
        _MainTex ("Main texture", 2D) = "white" {}
        _FogNoise ("Fog noise", 2D) = "white" {}
        _FogSpeedX ("Fog speed x", Range(1.0, 10.0)) = 1.0
        _FogSpeedY ("Fog speed y", Range(1.0, 10.0)) = 1.0
        _NoiseScale ("Noise scale", Range(0.0, 5.0)) = 1.0
        _FogColor ("Fog color", Color) = (1.0, 1.0, 1.0, 1.0)
        _FogDensity ("Fog density", Float) = 1.0
        _FogStart ("Fog start height", Float) = 1.0
        _FogEnd ("Fog end height", Float) = 1.0
    }

    SubShader {
        CGINCLUDE

        sampler2D _MainTex;
        float4 _MainTex_TexelSize;
        sampler2D _CameraDepthTexture;
        sampler2D _FogNoise;
        float4x4 _CornersRay;
        float _FogSpeedX;
        float _FogSpeedY;
        float _NoiseScale;
        fixed4 _FogColor;
        float _FogDensity;
        float _FogStart;
        float _FogEnd;

        #include "UnityCG.cginc"

        struct a2v {
            float4 vertex : POSITION;
            float2 texcoord : TEXCOORD0;
        };

        struct v2f {
            float4 pos : SV_POSITION;
            float2 uv : TEXCOORD0;
            float2 uv_depth : TEXCOORD1;
            float3 depthRay : TEXCOORD2;
        };

        v2f vert(a2v i) {
            v2f o;
            o.pos = UnityObjectToClipPos(i.vertex);
            o.uv = i.texcoord;
            o.uv_depth = i.texcoord;

            #if UNITY_UV_STARTS_AT_TOP
                if (_MainTex_TexelSize.y < 0) {
                    o.uv_depth.y = 1 - o.uv_depth.y;
                }
            #endif

            int index = 0;
            if (o.uv.x < 0.5 && o.uv.y < 0.5) {
                index = 0;
            } else if (o.uv.x > 0.5 && o.uv.y < 0.5) {
                index = 1;
            } else if (o.uv.x > 0.5 && o.uv.y > 0.5) {
                index = 2;
            } else {
                index = 3;
            }

            #ifdef UNITY_UV_STARTS_AT_TOP
                if (_MainTex_TexelSize.y < 0) {
                    index = 3 - index;
                }
            #endif

            o.depthRay = _CornersRay[index];

            return o;
        }

        fixed4 frag(v2f i) : SV_TARGET {
            float linearDepth = LinearEyeDepth(SAMPLE_DEPTH_TEXTURE(_CameraDepthTexture, i.uv_depth));
            float3 worldPos = _WorldSpaceCameraPos + linearDepth * i.depthRay;
            float2 speed = float2(_FogSpeedX, _FogSpeedY) * _Time.y;
            // - 0.5 可以让雾的变化有增有减，不然就只会在原有的基础上增加。
            float noise = (tex2D(_FogNoise, i.uv + speed).r - 0.5) * _NoiseScale;
            float fogDensity = (_FogEnd - worldPos.y) / (_FogEnd - _FogStart);
            fogDensity = saturate(fogDensity * _FogDensity * (1 + noise));

            fixed4 finalColor = tex2D(_MainTex, i.uv);
            finalColor.rgb = lerp(finalColor, _FogColor, fogDensity);

            return finalColor;
        }

        ENDCG

        Pass {
            CGPROGRAM

            #pragma vertex vert
            #pragma fragment frag

            ENDCG
        }
    }

    Fallback Off
}