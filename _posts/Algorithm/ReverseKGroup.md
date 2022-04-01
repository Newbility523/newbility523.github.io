# 反转列表里 K 个为一组的节点

只允许使用常数量级的额外空间

最初的做法里用到了指针数组，不是很好，可以参照题解改为 for 循环实现

## 最初做法

``` c++
ListNode* reverseKGroup(ListNode* head, int k) {
    ListNode* result = new ListNode(-1);
    result->next = head;
    ListNode* temp = head;
    vector<ListNode*> p;
    ListNode* tempHead = result;

    while (true)
    {
        int count = 0;
        while (temp != NULL && count < k)
        {
            ++count;
            p.push_back(temp);
            temp = temp->next;
        }

        if (count != k)
        {
            break;
        }

        ListNode* mid = p[k - 1]->next;
        ListNode* newHead = p[0];
        for (int i = 0; i < k; ++i)
        {
            p[i]->next = mid;
            mid = p[i];
        }

        tempHead->next = mid;
        tempHead = newHead;

        count = 0;
        p.clear();
    }

    return result->next;
}
```