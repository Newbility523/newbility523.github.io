```C#
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Reflection;

namespace RefrenceDllTest
{
    class Program
    {
        static void Main(string[] args)
        {
            Assembly assembly = Assembly.Load("DLLTest");

            Console.WriteLine("Assembly FullName : " + assembly.FullName);

            AssemblyName assemName = assembly.GetName();
            Console.WriteLine("assemName : " + assemName);

            var obj = assembly.CreateInstance("DLLTest.TestDLLClass", false, BindingFlags.Default, null, args, null, null);
            Type type = assembly.GetType("DLLTest.TestDLLClass");
            MethodInfo method = type.GetMethod("GetIntMax");
            object[] param = new object[2] { 1, 2 };
            Console.WriteLine(method.Invoke(obj, param));

            PropertyInfo[] properties = type.GetProperties();
            for(int index = 0; index < properties.Length; index++)
                Console.WriteLine("Property Name : " + properties[index].Name);

            Console.ReadKey();
        }
    }

    class ReflectTest
    {

    }
}
```

```C#
DLL文件源码
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLLTest
{
    public class TestDLLClass
    {
        public TestDLLClass() { }
        public int GetIntMax(int a, int b) { return a > b ? a : b; }
        public int _PubInt { get; set; }
        public void SetPubInt(int val) { _PubInt = val; }
        private string _Str;
        private void SetString(string val) { _Str = val; }
    }
}

```

1. 需要先生成Dll文件.可以在创建项目的时候设定为库文件.或者`右键解决方案->属性->应用程序->输出类型设置为类库`.

2. 生成的dll文件在项目本身的`文件夹位置->bin->Debug->.dll.`

3. 若想要引用dll,需要将dll提前复制到对应项目文件目录的`bin\Debug`文件夹内部即可.(bin的子目录好像也会找不到,只能是Debug里面,因为使用的是Assembly.Load方法,直接读取的,如果是LoadFrom的话应该可以放在别的文件夹内部,只用指定路径即可)

4. 使用`Assembly.Load("Dll文件名");`生成一个Assembly对象.

5. 然后用获取的Assembly对象的`CreateInstance("命名空间.类名")`方法实例化一个对象出来.

6. 通过Type的反射,获取`命名空间.类名`的Type类型.
7. 通过Type获取对应的方法:` MethodInfo method = type.GetMethod("GetIntMax");`,在Dll中有一个叫GetIntMax的方法.

8. method.Invoke(实例化出来的对象obj, 参数)

```C#
输出:
Assembly FullName : DLLTest, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
assemName : DLLTest, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
2
Property Name : _PubInt

```

# Waring
1. `type.GetProperty` 获取属性只有GetSet函数才可以访问,以上,_Str没找到方法可以访问.(可能有别的方法,但是最好还是设置为属性)

