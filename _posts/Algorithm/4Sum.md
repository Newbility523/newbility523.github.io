# 四数之和

``` c++
vector<vector<int>> fourSum(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    int len = nums.size();
    vector<vector<int>> result;

    for (int i = 0; i < len - 3; ++i)
    {
        while (i > 0 && i < len - 3 && nums[i] == nums[i - 1])
        {
            ++i;
        }
        for (int j = i + 1; j < len - 2; ++j)
        {
            while (j > i + 1 && j < len - 2 && nums[j] == nums[j - 1])
            {
                ++j;
            }
            int l = j + 1;
            int r = len - 1;
            while (l < r)
            {
                int add = nums[i] + nums[j] + nums[l] + nums[r] - target;
                if (add > 0)
                {
                    --r;
                }
                else if (add < 0)
                {
                    ++l;
                }
                else
                {
                    vector<int> newOne = {nums[i], nums[j], nums[l], nums[r]};
                    result.push_back(newOne);

                    while (l < r)
                    {
                        ++l;
                        if (nums[l] != nums[l - 1])
                            break;
                    }
                    while (l < r)
                    {
                        --r;
                        if (nums[r] != nums[r + 1])
                            break;
                    }
                }
            }
        }
    }

    return result;
}
```