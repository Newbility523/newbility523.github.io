## 迭代器

剖析 Lua 中 for 迭代器的工作原理，以及重写 Lua 迭代器。

使用 Lua 时最常用的就是 ipairs 和 pairs 了，一个是数组类型的遍历，一种是字典类型遍历（也称泛型遍历）。

由简单的说起

以 ipairs 为例，当我们使用如下结构是

``` lua
for k, v in ipairs(tab) do
    func()
end

-- 其实等同于
for var_1, var_2 in explist do
    func
end

-- 再等共同于
local iteraFunc, tab, var = explist
while true do
    local var_1, ..., var_n = iteraFunc(tab, var)
    if var_1 then
        var = var_1
        func
    end
end
```

由上可以得出
* 关键字 **in** 后的表达式是主要用于获取迭代函数的。但是其实也包括一些其他的参数，这得看 for 后面我们添加了多少参数。并且以 ipairs 为例的话，tab 以及 var，应该就是相应的表，var 则是起始索引。explist 只被调用一次，而后每次调用返回的迭代函数，传入不变的 tab，以及每次迭代就变化的 var - 索引

实际使用
``` lua
local function iterator(tab, index)
    print("iterating")
    index = index + 1
    if tab[index] then
        return index, tab[index]
    end
end

local function ipairs(tab)
    print("get ready")
    return iterator, tab, 0
end

for k, v in ipairs(tab) do
    func()
end
```

这样就实现了 ipairs 迭代器

还有种写法，效果是一致

``` lua
for k, v in func(), tab, ... do
    otherFunc()
end
```

根据原理，也可以写成一个闭包函数，函数中自己保存 tab 和 index，这样可以应对更多复杂的情况，如下

``` lua
local function GetIterator(tab)
    local index = 0
    print("get ready")
    return function()
        print("iterating")
        index = index + 1
        if tab[index] then
            return index, tab[index]
        end
    end
end

for k, v in GetIterator(tab) do
    otherFunc()
end
```

对于 pairs 的实现则要用 lua 内部提供的 next 函数

``` lua
local function iterator(tab, index)
    local nextIndex, nextValue = next(tab, index)
    if nextIndex then
        return nextIndex, nextValue
    end
end
```
### 特殊写法

对于非闭包的迭代，**in** 关键字有另一种写法

``` lua
for k, v in func(v1, v2) do
end
-- 等同于
for k, v in func(), v1, v2 do
end
```

但对于返回闭包函数的迭代就无法使用这种写法，至于为啥，尚不清楚

## 通过元表实现

由上可知，for 循环实际就是需要在**in**后面实现一个返回迭代表的函数。

对于实现过自定义过 __index 或 __newindex 的表，再次遍历要是都使用特定的函数会有点麻烦。还有另一种方法，元表种提供一个 __pairs 的键，当使用默认的 pairs 函数进行遍历，会优先调用元表的 __pairs，所以还有这种写法

``` lua
local mt = {
    __pairs = function(tab)
        local function iterator(tab, index)
            index = index + 1
            if tab[index] then
                return index, tab[index]
            end
        end

        return iterator, tab, 0
    end
}
```
## 效率比较
