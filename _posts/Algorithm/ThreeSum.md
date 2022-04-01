# 三数之和

数组内，求所有三数之和为 0 的组合，不能重复，例如有

[-1, 0, 1, -1]

唯一解为 [-1, 0, 1]

## 原始做法

一开始无法做出，看了题解，按照理解写一份，超时...

``` c++
vector<vector<int>> threeSum1(vector<int>& nums) {
    vector<vector<int>> result;
    sort(nums.begin(), nums.end());
    int len = nums.size();
    if (len == 0 || nums[0] > 0 || nums[len - 1] < 0) 
    {
        return result;
    }

    for (int i = 0; i < len - 2; ++i)
    {
        while (i > 0 && i < len - 2 && nums[i] == nums[i - 1])
        {
            ++i;
        }
        for (int j = i + 1; j < len - 1; ++j)
        {
            if (nums[j] > -nums[i])
            {
                break;
            }
            else
            {
                for (int l = j + 1; l < len; ++l)
                {
                    int plus = nums[i] + nums[j] + nums[l];
                    if (plus == 0)
                    {
                        vector<int> temp = {nums[i], nums[j], nums[l]};
                        result.push_back(temp);

                        while (l + 1 < len && nums[l] == nums[l + 1])
                        {
                            ++l;
                        }
                    }
                    else if (plus > 0)
                    {
                        break;
                    }
                }
            }

            while (j + 1 < len - 1 && nums[j] == nums[j + 1])
            {
                ++j;
            }
        }
    }

    return result;
}
```
## 改进做法

无法理解大佬们 while 中的缩写，按照理解改成易读的方式

``` c++
vector<vector<int>> threeSum(vector<int>& nums) {
    vector<vector<int>> result;
    sort(nums.begin(), nums.end());
    int len = nums.size();
    if (len == 0 || nums[0] > 0 || nums[len - 1] < 0) 
    {
        return result;
    }

    for (int i = 0; i < len - 2; ++i)
    {
        while (i > 0 && i < len - 2 && nums[i] == nums[i - 1])
        {
            ++i;
        }
        int l = i + 1;
        int r = len - 1;
        while (l < r)
        {
            int plus = nums[i] + nums[l] + nums[r];
            if (plus > 0)
            {
                --r;
            }
            else if(plus < 0)
            {
                ++l;
            }
            else
            {
                vector<int> temp = {nums[i], nums[l], nums[r]};
                result.push_back(temp);

                // 大佬的两个 while 写法
                // while (l < r && nums[l] == nums[++l]);
                // while (l < r && nums[r] == nums[--r]);
                // 下面是我的，感觉这样容易理解
                while (l < r)
                {
                    ++l;
                    if (nums[l] != nums[l - 1])
                    {
                        break;
                    }
                }
                while (l < r)
                {
                    --r;
                    if (nums[r] != nums[r + 1])
                    {
                        break;
                    }
                }
            }
        }
    }

    return result;
}
```