# 最接近要求的三数和

给出数组 Nums，求数组中最近接 target 的三数和。本题和三数和类似

## 最初作法

``` c++
int threeSumClosest(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    int len = nums.size();
    int resultDelta = INT32_MAX;
    int minDelta = INT32_MAX;
    for (int i = 0; i < len - 2; ++i)
    {
        while (i > 0 && i < len && nums[i] == nums[i - 1])
        {
            ++i;
        }

        int l = i + 1;
        int r = len - 1;
        while (l < r)
        {
            int curDelta = nums[i] + nums[l] + nums[r] - target;
            // curDelta = curDelta >= 0 ? curDelta : -curDelta;
            if (curDelta == 0)
            {
                return target;
            }
            else if (curDelta > 0)
            {
                while (l < r)
                {
                    --r;
                    if (nums[r] != nums[r + 1])
                        break;
                }
            }
            else
            {
                while (l < r)
                {
                    ++l;
                    if (nums[l] != nums[l - 1])
                        break;
                }
            }

            int absDelta = curDelta > 0 ? curDelta : -curDelta;
            if (absDelta < minDelta)
            {
                minDelta = absDelta;
                resultDelta = curDelta;
            }
        }
    }

    return target + resultDelta;
}
```