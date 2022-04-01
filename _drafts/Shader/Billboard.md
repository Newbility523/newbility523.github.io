# Billboard 广告牌

广告牌效果实际上是让物体的渲染针对相机视角做出相应的调整，类似 UI。

但是实际的 Billboard 可以分为几种

---

* 固定轴，如固定 Y 轴可以模拟树木，仅用一个面片实现横向移动下，朝向永远对着相机。
* 非固定轴，类似 UI，无论摄像机的旋转，移动，都以固定的朝向和角度面对相机，但和 UI 不太一致的是，有近大远小的效果。

## 实现

实现的关键是更根据需要的效果，构建一个坐标系，并转为到模型空间。然后的到目标坐标系到模型空间的矩阵，通过逆矩阵求的目标空间下的坐标即可。

对于类似 UI 的 Billboard 的效果

``` shaderlab
v2f vert(a2v i) {
    v2f o;

    float4 localPos = mul(i.pos, UNITY_MATRIX_MV);

    o.pos = UnityObjectToClipPos(localPos);

    o.uv = TRANSFORM_TEX(i.texcoord, _MainTex);

    return o;
}
```

将视角坐标下的单位轴转到模型空间中，