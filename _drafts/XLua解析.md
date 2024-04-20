# XLua解析

## C++/Lua 交互原理

### 栈

### Lua 的 C API

| 函数                                                       | 说明                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| void lua_newtable (lua_State *L)                           | 创建新表。结果放入栈顶                                       |
| void lua_createtable (lua_State *L, int narr, int nrec);   | 更优的创建新表，参数用于指定数组、字典容量。结果放入栈顶     |
| int luaL_ref (lua_State *L, int t);                        | 将栈顶元素放入 t 中，并传入它的引用 id。会弹出栈元素         |
| void lua_rawseti (lua_State *L, int index, lua_Integer i); | 将栈顶元素作为索引 i 设置进栈上为 index 的表上。会弹出栈顶，注意，表还是在的。 |
| void lua_rawset (lua_State *L, int index);                 | 对栈顶的 -2 作为键名，-1 作为值，赋值进 index 的表中，并弹出 -1,-2。 |
| void lua_pushvalue (lua_State *L, int index);              | 将栈上 index 的内容复制一份加在栈顶                          |
| void lua_pop (lua_State *L, int n);                        | 从栈顶开始弹出 n 个元素                                      |
|                                                            |                                                              |



需要额外留意这些 LuaAPI 哪些会默认清空栈上的值



### C++ 调用 Lua 函数

lua_pcall 中指定了 n 个参数后，第 n + 1 个参数就被当做函数调用

### Lua 调用 C++ 函数

需要被调用的 C++ 函数，要通过栈注册到 Lua 中，达到类似`local c_func = a_func`的效果。然后获取 c_func 的 id，这个 id 传递给 Lua 就会被当做函数。

### 完整的例子

C# 和 C++/C 的交互

```C#
// 创建了一个弱表，引用保存在 cacheRef，栈最后是空的
LuaAPI.lua_newtable(L);
LuaAPI.lua_newtable(L);
LuaAPI.xlua_pushasciistring(L, "__mode");
LuaAPI.xlua_pushasciistring(L, "v");
LuaAPI.lua_rawset(L, -3);
LuaAPI.lua_setmetatable(L, -2);
cacheRef = LuaAPI.luaL_ref(L, LuaIndexes.LUA_REGISTRYINDEX);
```



## 一些开源库的做法



## XLua 做法

每一个 Unity 对象都用在 Lua 端由类型元表+对象 id 组成。当调用对像方法，实际是通过元表调用了提前记录到 Lua 的回调方法，这些方法都是静态的，即通过 Gen 生成的一系列 Wrap.cs

这些静态方法是和类型方法一对一的，Lua 调用它们时，会通过 id 获取调用方法的 Unity 对象。然后使用该对象执行实际的方法，再把结果传入 Lua 中。



## Lua 如何调用 C++ 的库



## 问题

1. xlua_setglobal 为什么不直接使用 lua_setglobal

```c
static int c_lua_setglobal(lua_State* L) {
	lua_setglobal(L, lua_tostring(L, 1));
	return 0;
}

LUA_API int xlua_setglobal (lua_State *L, const char *name) {
	int top = lua_gettop(L);
	lua_pushcfunction(L, c_lua_setglobal);
	lua_pushstring(L, name);
	lua_pushvalue(L, top);
	lua_remove(L, top);
	return lua_pcall(L, 2, 0, 0);
}
```

Copilot:

这段代码的目的是通过`xlua_setglobal`函数将一个值设置为Lua全局变量，但是这个过程是通过Lua的`pcall`函数来完成的，这意味着如果在设置全局变量的过程中发生错误，Lua不会直接崩溃，而是会返回一个错误。

`c_lua_setglobal`函数是一个C函数，它被压入Lua堆栈并通过`lua_pcall`函数调用。这个函数从堆栈中获取全局变量的名称和值，然后使用`lua_setglobal`函数将值设置为全局变量。

`xlua_setglobal`函数首先获取堆栈顶部的索引，然后将`c_lua_setglobal`函数、全局变量的名称和堆栈顶部的值压入堆栈，然后移除堆栈顶部的原始值。最后，它使用`lua_pcall`函数调用`c_lua_setglobal`函数。

这样做的好处是，如果在设置全局变量的过程中发生错误，`lua_pcall`函数会捕获这个错误并返回，而不是让Lua直接崩溃。这对于错误处理非常有用，因为你可以检查`lua_pcall`函数的返回值来确定是否发生了错误。

2. 为什么有时候使用正索引

   这取决于后续的操作影不影响索引，例如要进行多次 `lua_pushvalue`，如果使用负索引，每次进行`lua_pushvalue`都会导致后续的负索引修改，所以用正索引会方便些。