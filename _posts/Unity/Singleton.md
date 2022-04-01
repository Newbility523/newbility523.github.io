# SingleTon 单例模式

单例模式在项目中很常用，意义在于保留一个对象的全局引用。

对于 C#
``` C#
// 最普通写法，要点在于限制构造函数的使用权限
public class Example {
    private static Example instance;
    public static Example Instance
    {
        get
        {
            if (intance == null)
            {
                intance = new Example();
            }

            return instance;
        }
    }

    private Example() { }
}
```

上述代码存在一个问题，就是多线程的情况下且在 instance = null 时，同时获取 `Example.Instance` 会产生两个 Example 对象，破坏单例原则。所以有两种方式较好的解决这个问题。

``` C#
// 利用锁
public class Example {
    private static Example instance;
    private static object _lock = new object();

    public static Example Instance
    {
        get
        {
            if (intance == null)
            {
                lock(_lock)
                {
                    if (intance == null)
                    {
                        intance = new Example();
                    }
                }
            }

            return instance;
        }
    }

    private Example() { }
}
```

由于多线程使用单例的问题仅在于初始化单例的时候，所以锁的位置只需在构造附近即可。而且若少了双层判断，靠后的进程还是能在等待后进入构造函数代码。但加多一个判断就可以避免。

``` C#
// 利用静态构造函数特性
public class Example {
    private static Example instance = new Example();
    public static Example Instance
    {
        get;
    }

    private Example() { }
}
```

上述的方法就单纯的利用特性，在Example所在的程序集加载时，立刻新建一个对象，并保存。缺点是，无论是否用到，都会实例出这个单例对象。

## MonoBehaviour 下的单例

在 MonoBehaviour 的脚本，是不能用 new 的，且无多线程情况。所以单例的方式要改改。

``` C#
public class Example: MonoBehaviour {
    private static Example instance;
    public static Example Instance
    {
        get
        {
            if (instance == null)
            {
                var go = new GameObject();
                instance = go.AddComponent("Example");
            }

            return instance;
        }
    }

    private void Awake()
    {
        if (instance == null)
        {
            instance = this;
        }
    }

    private void OnDestroy()
    {
        if (instance != null)
        {
            instance = null;
        }
    }
}
```

因为单例用的情况较多，为了减少工作，可实现单例类，需要的单例都从继承该类

。。。待补


