`vector<string> paths` 不是引用类型？为什么作为参赛传递插值无效

重载字符串 + , 不然太麻烦了

splint 静态代码分析工具

如何编写跨平台代码，是否要遵循 POSIX



C++ 中没有 byte，可以用 unsign char 代替。

## std::cin 注意事项

C++ 的标准输入一般使用一下三种

* cin >>  输入
* cin.get() 通常用于获取一个字符，但其实也能获取字符串
* cin.getline() 用于获取一行

直接 `cin >>` 输入会过滤掉回车符，直到输入字符

当用 cin 或 cin.get() 输入字符时，会用回车表示确定，此时 cin 和 cin.get() 的返回结果能正确获取字符串，不会包含回车符。**但是回车符会残留在缓冲区内**，当这两个语句后面接着是 getline() 时，getline() 会直接获取缓冲区内的回车，感觉像跳过了 getline() 一样。

### 使用 ignore前清空缓冲区。

```c++
string str;
cin.clear(); // 如果只是为了清空缓冲区，可以不用
cin.ignore(); // 清空缓冲区
getline(cin, str);
```

以上函数都使用了默认的方式调用，有必要再说明下 cin.ignore 的用法，完整的

```c++
ignore(int cout = 1, char endChar = EOF)
```

ignore 是阻塞的，当缓冲区为空时，效果会持续到下一次输入。也就是说下面的做法是可以的

```c++
// 输入 name:Carl，但只需 name: 后的文字
string name;
cin.ignore(4)
cin >> str;			// 都行
getline(cin, str);	// 都行
// str = Carl
```

ignore 有两个参数 cout 和 endChar。cout 移除前几个字符，endChar 则是移除第一个指定字符和它前的所有字符。这两个参数的条件达到任意一个，就会起作用。例如

```
//缓冲区为 abce12345
cin.ignore(5, 'b') // 会清空前两个字符 ab
cin.ignore(5, '4') // 会清空前5个字符 abce1
```

默认情况下清空缓冲区第一个字符，一般情况下也够用了。

最后，推荐使用 getline()，因为 getline 可以直接搭配 C++ 字符串 string，而不是 char*。

[参考文档](https://blog.csdn.net/K346K346/article/details/48213811)，关于 cin 更详细的说明和 EOF 问题，可以看这个。

## 指针问题

看 C/C++ 代码，和其他语言最大不同就是函数经常需要传**指针长度**。传递数组，要传长度，传递 char* 字符串，要长度，申请空间也要手动 sizeof ，可以说是非常繁琐了。

但也算有心理准备，因为 C/C++ 就是因为可以通过指针自由控制内存出名的。对于申请到的任何一块内存地址，想怎么操作这块区域，都是允许的，即使类型不一致，甚至不检查越界，越界问题由程序员自己把控。很容易让人觉得，编译器不知道指针所指的内存区间大小，然而...

### new 和 delete

C++ 申请内存使用 new，清空内存使用 delete。一个普通的使用例子

```c++
someType* t = new someType;
// ...
delete t
// or 
someType* t = new someType[n];
// ...
delete[] t
```

可能感觉不太强烈，再给个 C 中的使用例子，C 是 malloc 和 free

```c
 char* p = (char *)malloc(sizeof(char));
 // ...
 free(p);
```

有两个点

* C++ new 的时候不需要 sizeof
* delete 和 free 的时候都不需要指定大小

这就和以往的认知很不一样了。**编译器是知道指针所指区域大小的**。

具体做法就是实际申请的内存会比指定的要大一点点，头部存储所指区域的大小，之后才是具体指针所指向的区域。

```
int* i = new int;
// 内存
[  4][byte][byte][byte][byte]
//     ↑指针 i
```

当调用 delete/free 时往前一个字节就可得到删除指针所指区域的大小了。具体多少个字节不同位数电脑不一致。

所以这就又回到我最开始的疑问了，既然能通过这样的方式知道指针所指大小，为什么不做成规范，这样就不用每次传递指针都要捎多一个长度了。

### delete 和 delete[]

使用 new[] 的空间需要用 delete[] 回收，然而实际上用 delete 这块区域也能全部回收。那为什么要用 delete[] 呢

因为 delete 的操作对于自定义结构来说，会先调用它的析构函数，再回收内存。

delete 和 delete[] 的区别就在于是仅仅调用头对象的析构，还是所有对象的析构了。

### new[] 和 []

创建数组一般方式有

```c++
int ary[10];
int* ary = new int[10];
```

两种方式下，ary 都是 int* ，区别在于 ary[] 是的空间是在栈下的，会自动回收，new 出来的都是分配在堆上，内存的管理都交给程序员。

**总之 new 了，记得 delete**

## 类型转换

在定制网络协议传输数据的时候，需要频繁将不同类型存入字节数组，或者从字节数组按需解析。

例如输入一个数字，存入字节

```c++
int i = 0;
cin >> i;
unsign char d = i;
```

需要留意，高位的数据会被舍弃掉。

但是如果就是想用 4 个 byte 存 N 呢，难道要将 int 拆分成一个个字节，再分别存入吗。

```c++

```

如果要连续存入 N 个 int，要用一个中间数存好在一个个放进 

这也太麻烦了。C# 可是直接封装在了各个类型里，数组都可以转为 byte 数组。

其实可以直接将 byte* 转化成 int* 数组，因为指针类似可以理解为操纵这块内存的单位大小。

例如一块8字节的内存，byte* 可以 8 次遍历完，强转为 int* 只需 2 次完成遍历。强转为 int* 对第一个元素存入 int 就相当于 byte* 将前4个元素存入了各个字节数据。如下

```c++
// 输入需要存入的整数数量
// 存入byte数组，第一字节表示整数数量
int operandCount = 0;
cin >> operandCount;

unsigned char *opmsg = new unsigned char[sizeof(int) * operandCount + 1];
opmsg[0] = operandCount;	// 第一字节表示整数数量

for (int i = 0; i < operandCount; ++i)
{
	cout << "input num." << i + 1 << ": ";
	cin >> *(int*)(opmsg + i * sizeof(int) + 1);
}

cout << "Unpack" << endl;

int unPackCount = opmsg[0];
cout << "cout = " << unPackCount << endl;
int* datePointer = (int*)(opmsg + 1);

for (int i = 0; i < unPackCount; ++i)
{
    temp = *(datePointer + i);
    cout << "num." << i + 1 << " : " << temp << endl;
}

delete[] opmsg;
```

在输入例子中，计算 index 使用了 i * sizeof(int) 因为此时 opmsg 仍然第 byte 类型，每加 1 就相当于 1 字节。

输出中则**提前转换好了类型**，后续就无须计算 size 了

