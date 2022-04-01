
``` c++
string intToRoman(int num) {
    char roman[7] = {'I', 'V', 'X', 'L', 'C', 'D', 'M'};
    std::string result = "";
    int base = 0;
    while (num)
    {
        int cur = num % 10;
        std::string tempResult = "";

        if (cur < 4)
        {
            tempResult.append(cur, roman[base]);
        }
        else if (cur == 4)
        {
            tempResult.append(1, roman[base]);
            tempResult.append(1, roman[base + 1]);
        }
        else if (cur == 5)
        {
            tempResult.append(1, roman[base + 1]);
        }
        else if (cur < 9)
        {
            tempResult.append(1, roman[base + 1]);
            tempResult.append(cur - 5, roman[base]);
        }
        else
        {
            tempResult.append(1, roman[base]);
            tempResult.append(1, roman[base + 2]);
        }

        result = tempResult.append(result);
        base += 2;
        num = num / 10;
    }

    return result;
}
```