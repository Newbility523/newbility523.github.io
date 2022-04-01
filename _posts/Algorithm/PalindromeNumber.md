# 回文数字

数字正反调转数值相等，输出 true，否则输出 false

## 初始

``` c++
bool isPalindrome(int x) {
    if (x < 0)
    {
        return false;
    }

    int oriX = x;
    int revertX = 0;
    while (x > 0)
    {
        int n = x % 10;
        if (revertX > (INT32_MAX - n) / 10)
        {
            return false;
        }

        revertX = revertX * 10 + n;
        x = x / 10;
    }

    return oriX == revertX;
}
```

## 改进后

``` c++
bool isPalindrome(int x) {
    if (x < 0)
    {
        return false;
    }

    int oriX = x;
    long revertX = 0;
    while (x)
    {
        revertX = revertX * 10 + x % 10;
        x = x / 10;
    }

    return oriX == revertX;
}
```

改进点

* 对于正数才进行的 while 循环，可以用 while (x)，x > 0 实际还要转为 0，1。
* 使用 long 代替溢出的判断，这部分不一定正确，看需求，如果要求溢出视为非回文，还是要加上极限判断。