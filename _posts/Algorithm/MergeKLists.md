# 合并多个有序列表

原始的做法中，用的是逐一合并的方式，有适当的优化：将已空的列表往后诺，减少重复遍历空列表的时间。

在优化做法中，使用归并排序，可以大幅度减少排序次数。但是占用空间仍然非常高

## 原始做法

``` c++
    ListNode* mergeKLists(vector<ListNode*>& lists) {
       ListNode* result = new ListNode(0);
        ListNode* head;
        head = result;
        int len = lists.size();
        int emptyEnd = len;
        while (true)
        {
            int minIndex = -1;
            for (int i = 0; i < emptyEnd;)
            {
                 if (lists[i] == NULL)
                {
                    lists[i] = lists[emptyEnd - 1];
                    lists[emptyEnd - 1] = NULL;
                    --emptyEnd;
                    continue;
                }
                else
                {
                    if (minIndex == -1 || lists[i]->val < lists[minIndex]->val)
                    {
                        minIndex = i;
                    }

                    ++i;
                }
            }

            if (minIndex == -1)
            {
                break;
            }
            else
            {
                if (emptyEnd == 1)
                {
                    result->next = lists[minIndex];
                    break;
                }
                else
                { 
                    result->next = lists[minIndex];
                    result = result->next;
                    lists[minIndex] = lists[minIndex]->next;
                }
            }
        }

        return head->next;
    }
};
```

## 优化做法

``` c++
ListNode* mergeKLists(vector<ListNode*>& lists) {
    ListNode* result = MergeLists(lists, 0, lists.size() - 1);

    return result;
}

ListNode* MergeLists(vector<ListNode*>& lists, int left, int right)
{
    int size = right - left;
    if (size < 0) 
    {
        return NULL;
    }
    if (size == 0)
    {
        return lists[left];
    }
    else if (size == 1)
    {
        return CombatTwoList(lists[left], lists[right]);
    }
    else
    {
        int mid = floor((left + right) / 2);
        ListNode* n1 = MergeLists(lists, left, mid);
        ListNode* n2 = MergeLists(lists, mid + 1, right);
        return CombatTwoList(n1, n2);
    }
}

ListNode* CombatTwoList(ListNode* n1, ListNode* n2)
{
    ListNode* temp = new ListNode(0);
    ListNode* result = temp;
    while (n1 != NULL and n2 != NULL)
    {
        if (n1->val < n2->val)
        {
            temp->next = n1;
            temp = temp->next;
            n1 = n1->next;
        }
        else
        {
            temp->next = n2;
            temp = temp->next;
            n2 = n2->next;
        }
    }

    temp->next = n1 == NULL ? n2 : n1;

    return result->next;
}
```
