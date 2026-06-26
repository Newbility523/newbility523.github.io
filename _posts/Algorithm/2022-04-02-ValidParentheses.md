---
layout: post
title: "有效的括号"
date: 2022-04-02
section: algorithm
topic: leetcode
tags: ["algorithm", "leetcode"]
---

# 有效的括号

输入一个字符串，仅包含 "(, ), {, }, [, ]"，判断是否两两匹配。

``` c++
bool isValid(string s) {
    int n = 0;
    stack<char> charStack;
    map<char, char> parentheses;
    parentheses['('] = ')';
    parentheses['{'] = '}';
    parentheses['['] = ']';

    while (s[n] != '\0')
    {
        if (s[n] == '(' || s[n] == '{' || s[n] == '[')
        {
            charStack.push(s[n]);
        }
        else
        {
            if (!charStack.empty() && parentheses[charStack.top()] == s[n])
            {
                charStack.pop();
            }
            else
            {
                return false;
            }
        }

        ++n;
    }

    return charStack.empty();
}
```