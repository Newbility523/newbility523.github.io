
``` c++
vector<string> letterCombinations(string digits) {
        int cur = 0;

        vector<string> result;
        vector<string> temp2;
        while (digits[cur] != '\0')
        {
            string curChars = GetCharString(digits[cur]);
            if (result.size() == 0)
            {
                result.push_back("");
            }
            for (int i = 0; i < result.size(); ++i)
            {
                for (int j = 0; j < curChars.length(); ++j)
                {
                    string curStr = result[i];
                    temp2.push_back(curStr.append(1, curChars[j]));
                }
            }

            result = temp2;
            temp2.clear();

            ++cur;
        }

        return result;
    }

    string GetCharString(char c)
    {
        switch (c)
        {
            case '2':
                return "abc";
            case '3':
                return "def";
            case '4':
                return "ghi";
            case '5':
                return "jkl";
            case '6':
                return "mno";
            case '7':
                return "qprs";
            case '8':
                return "tuv";
            case '9':
                return "wxyz";
        }
    }
```