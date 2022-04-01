# ShaderLab 涉及到的矩阵

系统的归纳下模型从到屏幕经历的一系列坐标转换

首先，坐标空间是分为左手坐标系和右手坐标系，拇指 +x，食指 +y，中指 +z，分别用左右手尝试和坐标系的 xyz 的 + 方向匹配确定坐标系类型。

注意：+z 不代表正方向，只表示数值的增加方向，例如观察空间就以 -z 为正方向。

坐标系间的转换是使用矩阵和齐次坐标相乘实现的，齐次坐标是在三维坐标的基础上，再增一个 w 分量，不同坐标系中有不同含义。一般为 0 和 1，分别表示向量，点。

## 转换流程

从三维的模型空间到二维的屏幕空间，一共经历了一下转换

**模型空间** -> **世界空间** -*观察变化*-> **观察空间 (view space) / 摄像机空间 (camera space)** -> **裁切空间 (Clip Space)** -> **屏幕空间 (Screen Space)**

### 模型空间 (Model Space)

以模型自身为中心的坐标空间，等同于 transform 的 localPosition。左手坐标系，并且以 +z 为正方向。w 分量为 0 或 1。

### 世界空间 (World Space)

整个三维空间为中心的坐标空间，等同于 transform 的 worldPosition。左手坐标系，并且以 +z 为正方向。w 分量为 0 或 1。

### 观察空间 (View Space) / 摄像机空间 (Camera Space)

以摄像机为中心的坐标空间，右手坐标系，但以 -z 为正方向。w 为 0 或 1。

### 裁切空间 (Clip Space)

为投影准备的空间，根据摄像机的裁减屏幕构建出的坐标系，左手坐标系。 +z 为正方向。w 为观察空间的 -z，即 Z 轴的值的负数。在此空间下判断是否一个点是否可见根据。

* -w <= x <= w
* -w <= y <= w
* -w <= z <= w

### 屏幕空间 (Screen Space)

二维的坐标系，以屏幕左下角为原点 (0, 0)，右上角为 (screenWidth, screenHeight)。屏幕空间的坐标是用裁切空间的 xyz 分别除以 w 分量得到。得到的结果范围会在 [-1, 1] 内。这个过程称为齐次除法 (Homogeneous Division) 或 透视除法 (Perspective Division)。经过除法后的坐标就称为归一化的设备坐标 (Normalized Device Coordinates, NDC)。

所以实际的坐标公式 (从 [-1, 1] 线性变化到 [0, screenWidth]， [0, screenHeight])

* X*screen* = (X*clip* · screenWidth) / (2 · W*clip*) + screenWidth / 2
* Y*screen* = (Y*clip* · screenHeight) / (2 · W*clip*) + screenHeight / 2

## 切线空间

真实世界中，能看到物体的凹凸是由于物体的表面粗糙，法线不一致导致反射的光的有差异。为了实现凹凸的效果，我们是可以做一个精度极高的模型，顶点位置和真实世界的相近，但是这样模型会很大。但是实际上用于计算光照的只是顶点法线而已，所以可以将法线存好，直接进行计算，省去用高精度模型算出的法线。这就法线贴图 (Normal Map)。

既然是向量就要有坐标空间，在选用坐标系时，使用的是切线空间。切线空间 xyz 三个轴为**该顶点**的 Tangent，Binormal，Normal (TBN)。其中 Binormal 由 Normal 叉乘 Tangent 得到。所以在存储法线时，有相对于点的概念。模型的变化一般不影响法线的效果，因为切线空间下的法线是相对于点的方向。

如果模型空间，同一个模型，无论旋转缩放，差异不大，但是同一套贴图和法线应用到不同模型，因为模型空间的不同，法线贴图的真实信息就完全错乱了。

如果是世界坐标，影响更大，即使是原配的模型和贴图旋转后，法线就是错的了。

存储方面，贴图有 4 个通道 RGBA，且颜色范围为 [0, 1]，而一个向量的三个轴分量范围为 [-1, 1]，所以需要进行线性变换，公式为

* color = (normal + 1) / 2
* normal = color * 2 - 1

如果一个点的法线即表面的法线，即 (0, 0, 1), 转换为颜色为 (0.5, 0.5, 1)。所以法线贴图大多数像素都是蓝色

### Shader 例子

再使用法线纹理时，重点是要构造出世界空间转切线空间或者切下空间转世界空间的矩阵。

``` ShaderLab
...
float4 worldPos = mul(unity_ObjectToWorld, i.pos);

float3 worldNormal = UnityObjectToWorldNormal(i.normal).xyz;
float3 worldTangent = UnityObjectToWorldDir(i.tangent).xyz;
float3 worldBinormal = cross(worldNormal, worldTangent) * i.tangent.w;

-- tangent space to world space
o.T2W1 = float4(worldTangent.x, worldBinormal.x, worldNormal.x, worldPos.x);
o.T2W2 = float4(worldTangent.y, worldBinormal.y, worldNormal.y, worldPos.y);
o.T2W3 = float4(worldTangent.z, worldBinormal.z, worldNormal.z, worldPos.z);

-- world space to tangent space
-- o.W2T1 = float4(worldTangent.x, worldTangent.y, worldTangent.z, worldPos.x);
-- o.W2T2 = float4(worldBinormal.x, worldBinormal.y, worldBinormal.z, worldPos.y);
-- o.W2T3 = float4(worldNormal.x, worldNormal.y, worldNormal.z, worldPos.z);
...

-- unpacked normal
fixed3 bumpDir = UnpackNormal(tex2D(_BumpMap, i.uv.zw));
```

注意

* 在计算 Binormal 时，叉乘的结果又乘以了 Tangent.w ???
* 当获得 T2W 时，W2T 可以简单的由 T2W 反转获得
* 因为法线存进贴图，是经过线性变换的，反推需要根据公式。如果贴图类型设置为法线贴图，还可以直接使用 UnpackNormal 对采样的颜色直接算出法线。

## Shader 中屏幕空间采样

当要获取物体周围的图像时，有两种做法

* 使用包围盒纹理，通过 `texCUBE()` 和向量取样。
* 使用相机纹理（通过相机或 `GrabPass { "TEX_NAME" }` 生成)。

使用第二种方式的话就需要知道顶点的屏幕中的位置当做是 uv 对纹理取样。

做法是

``` ShaderLab
o.pos = UnityObjectToClip(i.vertex);
float3 pos = ComputeGrabScreenPos(o.pos);
```

需要知道的是 `UnityObjectToClip` 作用是转换模型坐标到裁减空间中，顶点着色器目的就是输出该坐标为投影做准备。此阶段的 `o.pos.xy` 只需要再除以自身的 `o.pos.w` 就可以得到 NDC，但是 NDC 不同的设备区间不同，OpengGL 为 [-1, 1]，DirectX [0, 1]。 `ComputeGrabScreenPos` 是用于处理不同平台下的裁减空间的差异问题，以及为处理线性变化，让齐次除法能直接获得 [0, 1] 的区间数值。

## NDC / 裁减空间转世界空间

一般用于接合深度贴图进行，[详情](DepthTexture.md#深度贴图转换坐标到世界空间)
