<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=default"></script>

# LeetCode 刷题记录

## 求和

You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)

Output: 7 -> 0 -> 8

Explanation: 342 + 465 = 807.

[原题连接](https://leetcode-cn.com/problems/add-two-numbers)

### 最初做法

$$x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$$

\\(x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}\\)

\\(O(x)=1\\)

```C++
ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    ListNode* result = NULL;
    ListNode* cur = NULL;

    int v1, v2, v3 = 0;

    while (l1 != NULL || l2 != NULL || v3 != 0)
    {
        v1 = l1 == NULL ? 0 : l1->val;
        v2 = l2 == NULL ? 0 : l2->val;
        v3 = v1 + v2 + v3;
        if (result == NULL)
        {
            result = new ListNode(v3 % 10);
            cur = result;
        }
        else
        {
            cur->next = new ListNode(v3 % 10);
            cur = cur->next;
        }

        v3 = v3 / 10;
        l1 = l1 == NULL ? l1 : l1->next;
        l2 = l2 == NULL ? l2 : l2->next;
    }

    return result;
}
```

### 改进后

```C++
ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    ListNode* result = new ListNode(0);
    ListNode* cur = result;

    int v1, v2, v3 = 0;

    while (l1 != NULL || l2 != NULL || v3 != 0)
    {
        v1 = l1 == NULL ? 0 : l1->val;
        v2 = l2 == NULL ? 0 : l2->val;
        v3 = v1 + v2 + v3;
        cur->next = new ListNode(v3 % 10);

        v3 = v3 / 10;
        l1 = l1 == NULL ? l1 : l1->next;
        l2 = l2 == NULL ? l2 : l2->next;
        cur = cur->next;
    }

    if (v3 > 0)
    {
        cur->next = new ListNode(v3);
    }

    return result->next;
}
```

在做算法题时，每当做完一道，对别和其他人的做法，总会发现被人的更加简洁，自己的或多或少有多余的操作，例如上题中就在 while 中用了 if，虽然一味追求简洁会让代码易读性降低，但是这 if 确实是可以省掉的。做题时其实都有这样的念头，但是就是没明白什么地方写进 while 里。

现在整理一下，while 是循环，由于题中返回的要求是链表，所以链表肯定有第一个节点创建和后面节点的链接。除开第一个节点，后面的操作都是一样的，那么就把第一个节点抽出 while 来创建。

## 最长不重复字符串

Given a string, find the length of the longest substring without repeating characters.

``` c++
Input: "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

Input: "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.

Input: "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Note that the answer must be a substring, "pwke" is a subsequence and not a substring.
```

### 最初做法

``` c++
int lengthOfLongestSubstring(string s) {
    char dic[128] = "\0";
    bool isExit = false;
    if (s.length() >= 1)
    {
        for (int i = 0; i <= s.length() - 1; ++i)
        {
            if (dic[s[i]] != '\0')
            {
                isExit = true;
                break;
            }
            else
            {
                dic[s[i]] = 1;
            }
        }
    }

    if (!isExit)
    {
        return s.length();
    }
    else
    {
        int right = lengthOfLongestSubstring(s.substr(1, s.length() - 1));
        int left = lengthOfLongestSubstring(s.substr(0, s.length() - 1));
        return right >= left ? right : left;
    }
}
```

运行结果超时。

### 改进后

``` c++
int lengthOfLongestSubstring(string s) {
    vector<int> dic(256, -1);
    int size = -1;
    int left = 0;
    for (int i = 0; i < s.length(); ++i)
    {

        if (dic[s[i]] == -1)
        {
            size = i - left > size ? i - left : size;
        }
        else
        {
            if (dic[s[i]] >= left)
            {
                int oldSize = size;
                int newSize = i - (dic[s[i]] + 1);
                size = oldSize > newSize ? oldSize : newSize;
                left = dic[s[i]] + 1;
            }
            else
            {
                size = i - left > size ? i - left : size;
            }
        }

        dic[s[i]] = i;
    }

    return size + 1;
}
```

### 再改进

``` c++
int lengthOfLongestSubstring(string s) {
    vector<int> dic(256, -1);
    int size = -1;
    int left = 0;
    int tempSize = -1;
    for (int i = 0; i < s.length(); ++i)
    {
        left = left > dic[s[i]] + 1 ? left : dic[s[i]] + 1;
        tempSize = i - left;
        size = size > tempSize ? size : tempSize;
        dic[s[i]] = i;
    }

    return size + 1;
}
```

[链接](https://leetcode-cn.com/problems/longest-substring-without-repeating-characters)
