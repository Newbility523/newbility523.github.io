# 翻转数字

反序输出数字，正负不变，当反序数字将会溢出 Int32 时返回 0

## 最初作法

``` c++
int reverse(int x) {
    int maxInts[10] = {2, 1, 4, 7, 4, 8, 3, 6, 4, 7};
    int minInts[10] = {2, 1, 4, 7, 4, 8, 3, 6, 4, 8};
    int* target = x >= 0 ? maxInts : minInts;

    int symbol = x >= 0 ? 1 : -1;
    int result = 0;
    int overflowState = 0;
    int count = 0;
    while (x != 0)
    {
        int n = x % 10 * symbol;
        if (overflowState == 0)
        {
            int maxN = *(target + count);
            if (n > maxN)
            {
                overflowState = 1;
            }
            else if (n < maxN)
            {
                overflowState = -1;
            }
        }

        if (x < 10 && x > -10 && count == 9 && overflowState == 1)
        {
            return 0;
        }

        result = result * 10 + n;
        x = x / 10;
        ++count;
    }

    return result * symbol;
}
```

## 改进作法

``` c++
int reverse(int x) {
    int result = 0;
    while (x != 0)
    {
        int n = x % 10;
        if (result > INT32_MAX / 10 || (result == INT32_MAX / 10 && n > 7))
        {
            return 0;
        }
        else if (result < INT32_MIN / 10 || (result == INT32_MIN / 10 && n < -8))
        {
            return 0;
        }

        x = x / 10;
        result = result * 10 + n;
    }

    return result;
}
```

在选择用数组进行越界判断，是考虑到当区域临界值时，无法用 Int32 直接比较，且不使用更高的位数，所以用单独的每一位对比大小，仅当位数到达10位后，再处理溢出结果。

然而实际上少于10位的数字是可以直接比较的，只需在最后一位判断是否超过极限的个位数即可。