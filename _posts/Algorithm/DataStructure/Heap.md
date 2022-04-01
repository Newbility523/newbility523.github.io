# 堆

堆类似树的结构，但是可以用数组进行表示，可以用有效节省空间和提高效率。

## 大顶堆 / 小顶堆

堆的每个节点可以有两个子节点，如果父节点都比子节点大 / 小，且每个节点在拥有右节点的情况下，左节点不为空，则称为大 / 小顶堆。为了描述方便，一下说明和结构实现都以大顶堆为例。

所以堆的顶节点肯定是最大的节点，但子节点间的关系就无法确认，例如无法确认最小的节点在左子树还是右子树。

堆的这个属性往往用于存储最关心的前 N 个数据，并且不在意 N 个数据之间的具体顺序。例如在处理前 N 个最大元素的问题，可以先对所有元素进行排序，在选取前 N 个。然而求算元素的具体顺序就增加了不必要的判断次数，因为我们只需要前 N 个，具体顺序对结果没有影响。 

### 堆的一些属性

更具上问提到的堆的要求，可以得到以下堆的属性：

* 堆的高度为 `h = floor(log(2, n)) + 1`，n 为节点数学数量。
* index 为 i 的节点，`parentIndex = floor((i - 1) / 2)`
* index 为 i 的节点，`leftIndex = 2 * i + 1`，`rightIndex = 2 * i + 2`

## 增删节点

### 增加

为了不破坏堆的特性，增加节点从末尾开始增加。假设新增为节点 c ，父节点为 a，同级的左节点为 b。根据堆的属性，c 和 b 无需比较，c 和 a 进行比较，如果 c 大于 a 则可直接和 a 换位置，因为 a 是必定大雨 b 的。所以替换位置后的 c 不会破坏 a，b，c 三个节点的堆属性，然后继续向上。维护以 c 新位置作为子节点的堆直至顶点。

### 删除

删除任意索引节点，删除要比增加多一次判断操作，假设删除节点为 a，左子节点为 b，右子节点为 c，则先取尾节点和 a 替换。删除后，a，b，c 节点堆属性可能以破坏，进行维护。因为顶节点事堆属性里三个节点最大的，需要先的到左右节点中较大的那个节点，然后再进行替换判断。假设 b 是较大的，则和 a 替换，替换后，以 a 节点新位置位顶结点的堆属性可能破坏了，再进判断，直至尾结点。

堆节点的增删操作有相似的规律，对于修改的节点要么一直上升，要么一直下移。

### 实现代码

``` c++
#include <iostream>
#include <math.h>
#include "HeapDemo.h"

#define MAX_LOOP_COUNT 1000
#define DEFAULT_VALUE  -1

void Swap(int &a, int &b)
{
    int temp = a;
    a = b;
    b = temp;
}

enum HeapTopType
{
    Max,
    Min,
};

class Heap_Demo {
private:
    int* array;
    int curSize;
    int totalSize;
    HeapTopType type;

    int GetNewIndex()
    {
    	return curSize < totalSize - 1 ? curSize : totalSize - 1;
		}
 
    void InitSize(int s)
    {
        curSize = 0;
        totalSize = s + 1;
        array = new int[totalSize];
        for (int i = 0; i < totalSize; ++i)
        {    
            array[totalSize - 1] = DEFAULT_VALUE;
        }
    }

public:
    Heap_Demo(int * ary, int s)
    {
      	type = Max;
        InitSize(s);

        for (int i = 0; i < s; ++i)
        {
            Add(ary[i]);
        }
    }

    Heap_Demo(int s)
    {
    		type = Max;

    		InitSize(s);
		}


    void Add(int num)
    {
        int curIndex = GetNewIndex();
        array[curIndex] = num;
        ++curSize;

        int count = 0;
        while (curIndex > 0)
        {
            ++count;
            if (count > MAX_LOOP_COUNT)
            {
                std::cout << "Error: deap looping" << std::endl;
                return;
            }

            int parentIndex = int(floor(((curIndex - 1) / 2)));
            if (parentIndex < 0) break;

            if (type == Max)
            {
                if (array[parentIndex] > array[curIndex]) break;
            }
            else if (type == Min)
            {
                if (array[parentIndex] < array[curIndex]) break;
            }

            Swap(array[parentIndex], array[curIndex]);
            curIndex = parentIndex;
        }
		}

    void Delete(int value)
    {
        for (int i = 0; i < curSize; ++i)
        {
            if (array[i] == value)
            {
                DeleteAt(i);
                return;
            }
        }
    }
      
    void DeleteAt(int index)
    {
        if (index < 0 || index > curSize - 1)
        {
            std::cout << "Error, please remove index from " << 0 << " to " << curSize - 1;
            return;
        }

        int removeIndex = index;
        std::cout << "Removing index at " << index << " value : " << array[index] << "\n";

        Swap(array[removeIndex], array[curSize - 1]);
        --curSize;

        int curIndex = removeIndex;
        while (curIndex < curSize - 1 && curIndex >= 0)
        {
            int leftChild = 2 * curIndex + 1;
            int rightChild = 2 * curIndex + 2;
            int switchIndex = -1;
            if (leftChild < curSize - 1)
            {
                switchIndex = leftChild;

                if (rightChild < curSize - 1)
                {
                    if ((type == Max && array[rightChild] > array[leftChild])
                        || (type == Min && array[rightChild] < array[leftChild]))
                    {
                        switchIndex = rightChild;
                    }
                }

                if (switchIndex != -1)
                {
                    if ((type == Max && array[switchIndex] > array[curIndex])
                        || (type == Min && array[switchIndex] < array[curIndex]))
                    {
                        Swap(array[switchIndex], array[curIndex]);
                    }
                }
            }

            curIndex = switchIndex;
        }
		}
      
    void Display()
    {
        for (int i = 0; i < curSize; ++i)
        {
            std::cout << array[i] << "\t";
        }

        std::cout << "|\t";

        for (int i = curSize; i < totalSize - 1; ++i)
        {
            std::cout << array[i] << "\t";
        }

        std::cout << "||\t";
        std::cout << array[totalSize - 1] << "\t";

        std::cout << "\n";
    }
      
    int GetTop()
    {
        if (curSize > 0)
        {
            return array[0];
        }

        return DEFAULT_VALUE;
    }
 
    int PopTop()
    {
        int top = GetTop();
        DeleteAt(0);
        return top;
    }
      
    ~Heap_Demo()
    {
      delete[] array;
      array = NULL;
    }
}

```





