# N 个圆括号的所有组合情况

``` c++
vector<string> generateParenthesis(int n) {
    vector<string> result;
    if (n == 1)
    {
        result.push_back("()");
    }
    else
    {
        vector<string> temp = generateParenthesis(n - 1);
        int len = temp.size();
        for (int i = 0; i < len - 1; i++)
        {
            result.push_back("()" + temp[i]);
            result.push_back("(" + temp[i] + ")");
            result.push_back(temp[i] + "()");
        }

        result.push_back("(" + temp[len - 1] + ")");
        result.push_back("()" + temp[len - 1]);
    }

    return result;
}
```

建议在看看大家的解答情况，自己写的包含特殊情况总感觉不是很好。

[LeetCode 括号生成](https://leetcode-cn.com/problems/generate-parentheses/comments/)