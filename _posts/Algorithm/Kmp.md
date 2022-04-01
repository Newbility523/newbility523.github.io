# 字符串查找算法 KMP

当我们在查找字符串 `str`的子串`subStr`时，大致的想法是设定两个指针`i` `j`，分别指向`str` `subStr`的头，逐个比较，当字符相同时，`++j`,当不符合时`++i` `j = 0`。直到匹配到`str`或`subStr`尾，比较`j`是否等于`subStr.length()`，相等则表明匹配成功，且起始索引为`i`；否则不存在，返回`-1`。对于特殊的情况，`subStr`为空的情况下返回 0。

这种算法复杂度为`n * m`其中 m，n 为 `str` `subStr` 的长度。

但其实如果事先对`subStr`进行分析，就可以避免一些不必要的比较。如果`subStr = aaaa`而`str = aaabaaaa`，当匹配到 `i = 0, j = 3`时，`a != b`，这时候 i + 1，j = 0，然后就可以直接比较 subStr[2] 和 str[3]，因为当我们匹配到 b 时，aaaa 和 aaab 已经知道匹配过了 3 个 a，后退一位后，也还有两个 a 已经匹配过，所以可以跳过直接匹配第三位。

所以，可以创建一个 next 数组代表**成功**匹配到 j 位置时，如果**后一个字符匹配失败可以跳过多少个字符**。这就是 KMP 算法的原理。

例如 aaaa，第一个字符不算，则可以得到 0123（最后一个 3 没什么用）。对于上一个例子的 aaabaaaa 中，j = 3 时 ’b‘ 处匹配失败，则根据 next 数组，可以取 next[2] = 2，让 b 和 sub[2] 进行比较，如果还不匹配，则继续查询 next 数组直到可以跳为 0。

``` c++
#include <iostream>
#include <string.h>

using namespace std;

int* GetJumpMap(string str)
{
    int* a = new int[str.length()];
    int count = 0;
    a[0] = 0;
    for (int i = 1; i < str.length(); ++i)
    {
        if (str[i] == str[count])
        {
            ++count;
            a[i] = count;
        }
        else
        {
            while(count > 0 && str[i] != str[count])
            {
                count = a[count - 1];
            }

            if (str[i] == str[count])
            {
                ++count;
            }

            a[i] = count;
        }
    }

    return a;
}

int IndexOf(string str, string subStr)
{
    if (subStr.length() == 0)
    {
        return 0;
    }

    if (str.length() == 0)
    {
        return -1;
    }

    int* next = GetJumpMap(subStr);

    int i = 0;
    int j = 0;
    while (str[i] != '\0' && subStr[j] != '\0')
    {
        if (str[i + j] == subStr[j])
        {
            ++j;
        }
        else if (j > 0 && next[j - 1] != 0)
        {
            i = i + j - next[j - 1];
            j = next[j - 1];
        }
        else
        {
            ++i;
            j = 0;
        }
    } 

    if (j == subStr.length())
    {
        return i;
    }
    else
    {
        return -1;
    }
}

```



