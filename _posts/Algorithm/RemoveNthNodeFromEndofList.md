
# 移除列表倒数低 N 个结点

这题很容易会想到遍历链表获得长度，减去 N 得到应移除结点的前结点索引，然后在遍历。但是这样不够高效，需要进行两次遍历。

可以遍历链表时，设定一个指针 P 指向当前遍历结点的前 N 个，当结点到达最后，自然 P 所指向的就是倒数第 N 个结点。

``` c++
ListNode* removeNthFromEnd(ListNode* head, int n) {
    ListNode* p = NULL;
    ListNode* cur = head;
    int curN = 0;
    while (cur != NULL)
    {
        ++curN;
        if (curN >= n + 1)
        {
            p = p == NULL ? head : p -> next;
        }

        cur = cur->next;
    }

    if (p != NULL)
    {
        p->next = p->next->next;
    }
    else if (curN >= n)
    {
        head = head->next;
    }

    return head;
}
```