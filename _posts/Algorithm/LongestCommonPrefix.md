
``` c++
string longestCommonPrefix(vector<string>& strs) {
    int count = 0;
    if (strs.size() == 0)
    {
        return "";
    }

    while (true)
    {
        char cur = strs[0][count];
        if (cur != '\0')
        {
            for (int i = 1; i < strs.size(); ++i)
            {
                if (strs[i][count] == cur)
                {
                    continue;
                }
                else
                {
                    return count <= 0 ? "" : strs[0].substr(0, count);
                }
            }
        }
        else
        {
            break;
        }

        ++count;
    }

    return count <= 0 ? "" : strs[0].substr(0, count);
}
```