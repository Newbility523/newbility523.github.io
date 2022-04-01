# 合并两个有序列表

``` c++
ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
    ListNode* p1 = l1;
    ListNode* p2 = l2;
    ListNode temp = ListNode(0);
    ListNode* cur = &temp;
    ListNode* result = cur;
    while (p1 != NULL && p2 != NULL)
    {
        if (p1->val <= p2->val)
        {
            cur->next = p1;
            cur = p1;

            p1 = p1->next;
        }
        else
        {
            cur->next = p2;
            cur = p2;

            p2 = p2->next;
        }
    }

    cur->next = p1 == NULL ? p2 : p1;
    result = result -> next;

    return result;
}
```

可以写得再简约一些，当 if else 里的操作是指针，且只有左右区别时，可以使用 swap 交换指针，然后都用一边的指针做逻辑。while 中可以改为

``` c++
while (p1 != NULL && p2 != NULL)
{
    if (p1->val > p2->val)
    {
        swap(p1, p2);
    }

    cur->next = p1;
    cur = p1;
    p1 = p1->next;
}
```