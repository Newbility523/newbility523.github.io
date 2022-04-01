# Atoi

``` c++
// MAX:2147483647
// MIN:-2147483648 
int myAtoi(string str) {
    int state = 0;
    int result = 0;
    int n = 0;
    char cur = str[n];
    do
    {
        if (cur == ' ')
        {
        }
        else if (cur >= '0' && cur <= '9')
        {
            state = 1;
            break;
        }
        else if (cur == '-' || cur == '+')
        {
            state = cur == '+' ? 1 : -1;
            cur = str[++n];
            break;
        }
        else
        {
            break;
        }

        cur = str[++n];
    } while (cur != '\0');

    while (cur >= '0' && cur <= '9')
    {
        int curInt = cur - '0';
        if (result > INT32_MAX / 10 || (result == INT32_MAX / 10 && curInt > 7))
        {
            return INT32_MAX;
        }
        else if (result < INT32_MIN / 10 || (result == INT32_MIN / 10 && curInt > 8))
        {
            return INT32_MIN;
        }

        result = result * 10 + curInt * state;
        cur = str[++n];
    }

    return result;
    }
```

速度较慢

## 改进后
``` c++
int myAtoi(string str) {
    int state = 0;
    int result = 0;
    int n = 0;
    char cur = str[n];
    while (cur != '\0')
    {
        
        if (cur == ' ' && state == 0)
        {
            cur = str[++n];
        }
        else if (cur >= '0' && cur <= '9')
        {
            if (state == 0)
            {
                state = 1;
            }
            else
            {
                int curInt = cur - '0';
                if (state == 1)
                {
                    if (result > (INT32_MAX - curInt) / 10)
                    {
                        return INT32_MAX;
                    }
                    else
                    {
                        result = result * 10 + curInt;
                    }
                }
                else
                {
                    if (result < (INT32_MIN + curInt) / 10)
                    {
                        return INT32_MIN;
                    }
                    else
                    {
                        result = result * 10 - curInt;
                    }
                    
                }

                cur = str[++n];
            }
        }
        else if (cur == '-' && state == 0)
        {
            state = -1;
            cur = str[++n];
        }
        else if (cur == '+' && state == 0)
        {
            state = 1;
            cur = str[++n];
        }
        else
        {
            break;
        }
    }

    return result;
}
```

优化了速度，其中包括

* 将两个 while 改成一个
* 极限判断的两个条件改成一个，减少多使用一次除法的概率
* 分开计算正负的累加，直接用 +-，取消统一乘以符号的操作
