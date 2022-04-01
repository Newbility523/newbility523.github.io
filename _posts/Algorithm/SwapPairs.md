# 交换链表节点

不允许使用交换指的方式。

``` c++
ListNode* swapPairs(ListNode* head) {
    ListNode* p1 = new ListNode(0);
    ListNode* result = p1;
    p1->next = head;
    ListNode* p2 = p1 != NULL ? p1->next : p1;
    ListNode* p3 = p2 != NULL ? p2->next : p2;

    while (p1 != NULL && p2 != NULL && p3 != NULL)
    {
        p1->next = p3;
        p2->next = p3->next;
        p3->next = p2;

        p1 = p2;
        p2 = p1 != NULL ? p1->next : p1;
        p3 = p2 != NULL ? p2->next : p2;
    }

    return result->next;
}
```