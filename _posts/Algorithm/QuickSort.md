# Quick Sort 快速排序

## 原理

大致原理是选择一个数为基准，一轮排序后，将所有大于基准的放在它右边，小的放在它左边。步骤如下：

1. 选择待排数组 a 中一个为基准，一般为第一个。
2. 设置 i，j 索引，分别指向开头和结尾。
3. 从 j 向左寻找，**先**检查 j 上的值是否大于基准，**大于**则 `--j`，否则停下并复制该值到 a[i]。
4. 再从 i 向右虚招，**先**检查 i 上的值是否小于基准，**小于**则 `++i`， 否则停下并复制该值到 a[j]。
5. 重复步骤 3 和 4，直到 `i == j` 将基准值复制到 a[i]。
6. 对 i 两边递归以上步骤。

代码实现

``` c++
// C++
void QuickSort(int a[], int l, int r)
{
    if (l >= r)
    {
        return;
    }

    int nl = l;
    int nr = r;
    int temp = a[nl];
    while (nl < nr)
    {
        while (a[nr] > temp && nl < nr)
        {
            --nr;
        }

        a[nl] = a[nr];

        while (a[nl] < temp && nl < nr)
        {
            ++nl;
        }

        a[nr] = a[nl];
    }

    a[nr] = temp;

    QuickSort(a, l, nl - 1);
    QuickSort(a, nl + 1, r);
}
```

## 算法分析

算法复杂度
* 最优 nlogn ：每次选中的基准恰好是数组的中值
* 最差 n^2 ：已排序的情况。