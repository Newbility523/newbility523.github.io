
CG在Shader之中的使用,需要包含在CGPROGRAM跟ENDCG之间.
```C#
    CGPROGRAM

    ENDCG
```

`float half fixed` 精度是递减的. float4 fl4 = (float2(1, 2), 1, 1)可以有以上的用法. `需要注意的是,Color用的是half,这是一个优化的问题.half本身是8位的,所以每一个RBG本身就是256个色素.那么一共就是256三次方 = 1677216色值`

`swizzle` 例如:floa4 fl4 = (1, 1, 1, 1).那么对应的取值就可以是分fl4.xyzw 也可以是fl4.rgba 两者不可混用.

`float2x2` 二阶矩阵. float2x2 MX2 = {1, 1, 1, 1};对其取值的时候可以通过下标获取,跟数组是一样的.对数组类型的赋值使用的是`{}`花括号.其它正常赋值是小括号.

`float arr[4]` 数组类型是不可以使用swizzle的.赋值的时候用的是`{}`,例如:float ar[4] = {1, 2, 3, 4}

`支持typedef #define`宏定义.

`struct结构体` 声明:
```C#
    struct v2f{
        float a;
        float2 b;
    }; //跟C语言类似,所以结尾必须添加分号.
```

使用的时候要实例化结构体的对象.

```C#
    v2f o;
    o.a = 1;
    o.b = float2(1, 2);
```

<font color = red>CG : goto switch case and default are not support</font>虽然不会报错.但是并不能取得正确的结果.

`循环次数是有限制的`.小于1024.大于等于1024就报错.

`函数` 

```C#
    void Func(flaot4 c);  //前向声明
    void frag(inout float4 col : COLOR)
    {
        Func(col);
    }

    void Func(float4 c)
    {
        c = float4(1, 1, 1, 1);
    }
```
如果没有`void Func();`的前向声明是会报未定义的错.跟C语言特性一样,变量或者函数在使用前必须声明.参数类型跟命名也必须保持一致.传参是值拷贝类型.所以不会对原值产生影响.

`MUL`MUL(Matrix, V)跟MUL(V, Matrix)得到的结果是一样的,内部其实是对矩阵进行了转置.

`DOT`点乘.计算的是两个向量之间的夹角.

`Corss`叉乘.计算的是垂直于两个向量的法向量.(会有一个方向的问题.Cull剔除会用到)

`2D矩阵旋转`

```C#
[cos sin]
[-sin cos]
```
2D矩阵坐标A,B,C.

A本身的坐标生成的2D矩阵为[A.x, A.y],旋转计算:

`A.x * cos(旋转角度) - A.x * sin(旋转角度) + A.y * sin(旋转角度) + A.y * cos(旋转角度)`计算得出的是A本身旋转之后的坐标.

`3D矩阵旋转`
```C#
     X                y               z
[1   0    0]    [cos  0  sin]    [cos   sin  0]
[0  cos sin]    [0    1    0]    [-sin  cos  0]
[0 -sin cos]    [-sin 0  cos]    [0      0   1]
```
X旋转的话X所在的行列除了第一个为1,其它全为0.