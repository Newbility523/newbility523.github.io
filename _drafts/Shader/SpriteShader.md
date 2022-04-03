# Sprite shader 出现图集错乱的情况

在项目后期，需要在 3D 空间下显示卡片，我们第一次使用了 Sprite Renderer 组件，Editor 下表现良好。但是因为 XLua 没添加适配代码，打包的 apk 和 ipa 都没法调用里面的接口。所以只能用改用 plane，并加上 Sprite-Default Shader 替代，效果一模一样，只是改素材的方法从 sprite 改成了 mainTexture。

在 Editor 下感觉 panel + Sprite-Default 就等同于 Sprite Renderer，但是打包后又发现问题。

打出的包是使用图集加载图片的，所以当把 Load Sprite 的方法改为 Load Texture，mainTexture 接收到的就是一张**完整的图集**，除非将图集里的图片打散。

出现这个问题的原因，其实就是传入的图片和预想中的不一致，但是我们又不想打散图集。那就只能将 sprite 在图集里的 UV 传进 Shader 里纠正，就可以了。

这里再提下 UV 坐标系，UV 是以左下角为原点，标准取值范围为 [0.0, 1.0]。

### 如何重现呢

Editor 下将 Sprite Packer 的模式修改为 Always Enabled（Legacy），测试可以通过 Frame debug 查看传入 material 的纹理是否为图集

### 那怎么获取 Sprite 的 UV 值呢？

1. Sprite.textureRect 的 x，y，width，height 为 sprite 图集内的坐标、长宽（左下角为原点），Sprite.texture 即为 sprite 所在的图集，width，height 为图集长宽。计算公式如下

   ``` c#
   // 注意图集打包模式不能为 Tightly ！！！
   var rect = s.textureRect;
   float startUVX = rect.x / s.texture.width;
   float startUVY = rect.y / s.texture.height;
   float endUVX = startUVX + rect.width / s.texture.width;
   float endUVY = startUVY + rect.height / s.texture.height;
   Debug.Log(string.Format("{{ name = {0}, x = {1}, y = {2}, w = {3}, h = {4} }},", s.name, startUVX, startUVY, endUVX, endUVY));
   ```

2. UnityEngine.Sprites.DataUtility.GetOuterUV(sprite) 也能直接返回一个 Vector4，直接获得 Sprite 在图集中的左下右上 UV 值。

由于项目后期，没法使用 GetOuterUV 的方式，故采用了通过 Sprite 计算的方式（本来还打算把图集里的所有 UV 都存下来，幸亏有同事提醒可以用 Sprite...）

最后就只要在片元着色器内，把顶点的 uv 转换下，在进行纹理取样即可。

假设原来的是

``` shader
// ...
fixed4 frag (v2f i) : SV_Target
{
    fixed4 col = tex2D(_MainTex, i.uv);
    return col;
}
```

修改后

```shader
Properties
{
	// 隐藏防止手动修改，并且设置默认(0,0,1,1)，即使未传入 rectUV 显示结果也没有问题
	[HideInInspector]rectUV ("rectUV", Vector) = (0.0, 0.0, 1.0, 1.0) 
}

// ...
// sprite 在图集里的 uv
float4 rectUV;		
fixed4 frag (v2f i) : SV_Target
{
    fixed2 r = i.uv;
    r.x = rectUV.x + (rectUV.z - rectUV.x) * r.x;
    r.y = rectUV.y + (rectUV.w - rectUV.y) * r.y;
    fixed4 col = tex2D(_MainTex, r);

    return col;
}
```