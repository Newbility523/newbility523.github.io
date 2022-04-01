
``` c++
int romanToInt(string s) {
    std::map<char, int> roman;
    roman['I'] = 1;
    roman['V'] = 5;
    roman['X'] = 10;
    roman['L'] = 50;
    roman['C'] = 100;
    roman['D'] = 500;
    roman['M'] = 1000;
    int index = 0;
    int result = 0;

    while (s[index] != '\0')
    {
        int cur = roman[s[index]];
        int next = s[index + 1] != '\0' ? roman[s[index + 1]] : 0;
        if (cur < next)
        {
            result = result + next - cur;
            index += 2;
        }
        else
        {
            result = result + cur;
            index += 1;
        }
    }

    return result;
}
```

## 另一种做法

效率没变化，但是流程上会统一些。

``` c++
int romanToInt(string s) {
    std::map<char, int> roman;
    roman['I'] = 1;
    roman['V'] = 5;
    roman['X'] = 10;
    roman['L'] = 50;
    roman['C'] = 100;
    roman['D'] = 500;
    roman['M'] = 1000;

    int index = 1;
    int result = 0;
    int pre = roman[s[0]];
    while (s[index] != '\0')
    {
        int cur = roman[s[index]];
        if (pre < cur)
        {
            result -= pre;
        }
        else
        {
            result += pre;
        }

        pre = cur;
        ++index;
    }

    result += pre;
    return result;
}
```

如果需要降低内存占用，可以吧 map 改为 switch