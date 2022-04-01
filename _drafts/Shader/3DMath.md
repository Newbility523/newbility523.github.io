# 3D 数学

## 平面直线的表达方式

### 截距式

若平面与三个坐标轴相交的坐标值为 (a, 0, 0)，(0，b, 0)，(0, 0, c)，则有平面表达式

``` math
    X / a + Y / b + Z / c = 1
```

### 一般式

若已知平面的法线为 n = (A, B, C)，则有平面表达式

``` math
    AX + BY + CZ + D = 0
```

其中 D 为常数

### 法线式

若已知平面的法线为 n，n 与 XYZ 轴的夹角为 α，β，θ。则有平面表达式

``` math
    cosα · X + cosβ · Y + cosθ · Z = 0
```

## 点是否在三角形内

### 点与直线方位

若有一点 P 在三角形 ABC 内, 则相对于 AB，BC，CA，P 点的方位是一致的，都在它们右边或左边。由此规律，可以通过三角形的边组成的向量**叉乘**各点与 P 组成的向量的到方向，如果一致则在三角形内。

``` C#
private bool IsInTriangle(Vector3 A, Vector3 B, Vector3 C, Vector3 P)
{
    vector3 AB = B - A;
    vector3 AP = P - A;
    float dir1 = cross(AB, AP);

    vector3 BC = C - B;
    vector3 BP = P - B;
    float dir2 = cross(BC, BP);

    vector3 CA = A - C;
    vector3 CP = P - C;
    float dir3 = cross(CA, CP);

    return (dir1 * dir2) >= 0 && (dir2 * dir3) >= 0
}
```

### 构建坐标

对于三角形 ABC，可用 AB，AC 作为 x 轴和 y 轴，则 BC 上的任一点 (x, y) 都有 x + y = 1。所以若存在一点 P 在三角形内，则有 x > 0， y > 0，且 x + y <= 1。

``` c#
private bool IsInTriangle(Vector3 A, Vector3 B, Vector3 C, Vector3 P)
{
    Vector3 AB = B - A;
    Vector3 AC = C - A;
    Vector3 AP = P - A;

    float dot00 = Vector3.Dot(AB, AB);
    float dot01 = Vector3.Dot(AB, AC);
    float dot02 = Vector3.Dot(AB, AP);
    float dot11 = Vector3.Dot(AC, AC);
    float dot12 = Vector3.Dot(AC, AP);

    float inverDeno = 1 / (dot00 * dot11 - dot01 * dot01);

    float x = (dot11 * dot02 - dot01 * dot12) * inverDeno;
    if (x < 0 || x > 1)
    {
        return false;
    }

    float y = (dot00 * dot12 - dot01 * dot02) * inverDeno;
    if (y < 0 || y > 1)
    {
        return false;
    }

    return x + y <= 1;
}
```

## 点与平面距离

若有一点 P(x, y, z)，且平面一般表达式为 AX + BY + CZ + D = 0。则距离 d = Ax + By + Cz + D，注意距离有正负之分。

## 射线与平面的交点

设有 P 点朝 d 方向射出，若和平面 U 有交点 M。则 M 点可看作 P 点朝 d 方向偏移 PM 距离。PM 可由 P 到屏幕距离除以 d 与 n 夹角的余弦值得到。

``` c#
private bool IsHit(Vector3 p1, Vector3 p2, Vector3 p3, Ray ray, out Vector3 hitpoint)
{
    hitpoint = Vector3.zero;
    Vector3 rayDir = ray.direction;
    Vector3 rayPoint = ray.origin;
    // 法线
    Vector3 n = Vector3.Cross(p2 - p1, p3 - p1).normalized;

    // 线段一般式
    float A = n.x;
    float B = n.y;
    float C = n.z;
    float D = Vector3.Dot(n, p1);

    float cosAngle = Mathf.Abs(Vector3.Dot(rayDir, n)) / rayDir.magnitude;

    float distanceToPlane = Vector3.Dot(rayPoint, n) + D;
    float raySide = Vector3.Dot(n, rayDir) * distanceToPlane;
    // 判断射线是否在平面的同一侧，若相同，则表明点已超过平面无法相交
    if (raySide > 0)
    {
        return false;
    }
    // 为 0 代表射线开始点即为相交点
    else if (raySide == 0)
    {
        hitpoint = rayPoint;

        return true;
    }

    float hitlenght = distanceToPlane / cosAngle;
    hitpoint = rayPoint + rayDir.normalized * hitlenght;

    return true;
}
```