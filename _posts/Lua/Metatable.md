## 元表 metatable

元表是一个表，当把一个表 mt 设置成表 a 的元表时，a 表的一些属性就会由元表 mt 的控制

先大致说下元表的工作流程，以对表的赋值为例。当我们对表 a 的 "key" 进行一些操作 `a.key = 1` 时，会先判断表 a 能否直接进该操作，如果不行，这个操作就会交给元表

## 设置元表

设置元表很简单

``` lua 
local mt = {}                   -- 创建表 mt，准备作为元表
local a = {}                    -- 新表 a
setmetatable(a, mt)             -- 设置 mt 作为 a 的元表

-- 由于 setmetatable 返回的就是表，所以也有这种写法
local mt = {}                   -- 创建表 mt，准备作为元表
local a = setmetatable({}, mt)  -- 设置 mt 作为 a 的元表
```

但是这样的元表是没有任何效果的，因为 mt 还没有设置对于的键，也就属性

## 元表属性

元表存在这些键时就可以实现功能，大致分为以下几类

* __index : 索引**不存在的** key，没有赋值操作
* __newindex : 对**不存在的** key 赋值
* __add : 重载加法操作
* __tostring : 输出，类似 C# 的 ToString()
* __len: # （取长度）操作。 如果对象不是字符串，Lua 会尝试它的元方法。 如果有元方法，则调用它并将对象以参数形式传入， 而返回值（被调整为单个）则作为结果。 如果对象是一张表且没有元方法， Lua 使用表的取长度操作（参见 §3.4.7）。 其它情况，均抛出错误。

## __index

对于相应的值，可以是表，也可以是函数。如

``` lua 
local mt = {
    __index = function(t, k)
        print("you are indexing key", k)
        return -1
    end

    -- 或者这样
    __index = {
        key1 = 1,
        key2 = 2,
    }
}

local a = setmetatable({}, mt)
```

当属性时函数时，再触发时，就调用该函数，如 __index 的函数会被传入两个参数，t 是被操作的表，k 就是所以的键，返回什么就有函数的 return 决定。

如上，当调用 `print(a.key1)` 时，因为 a 是没有 key1 的，所以会调用 mt.__index，传入的就是 a 和 "key1" ，得到的就是屏幕输出一段 log "you are indexing key key1 -1"

另外的，__index 的值是表时，当用到 __index 时，就相当于对 __index 的表进行索引。 `print(a.key1)` 会因为 a 不存在 "key1" 转而对 __index 进行索引，返回的就是 1 了。

如果设置元表时改一改

``` lua
local a = setmetatable({ key1 = 100 }, mt)
```

那么将不会调用 __index，因为表 a 就已经有 "key1" 了，需要注意。

## __newindex

类似 __index ，不过在 函数实现时，传参不一样。

``` lua
local mt = {
    __newindex = function (t, k, v)
        print("setting new key value")
    end
}
```

## __add


## 运用场景

对于 __index，__newindex 一般用在读取权限的控制上。例如对于配置表，我们一般不需要也不愿意在游戏运行中被更改，一旦更改这种问题就很可能莫名其妙，也很难排查。这种情况就需要有个只读属性的表了，也就是对 __newindex 进行控制。实现如下

``` lua
-- 原配置表
local monster_Config = {
    { id = 1, name = "Rua", attac = 10, hp = 100, isFly = true },
    { id = 2, name = "Mua", attac = 0, hp = 10, isFly = false },
}

-- 配置表封装
local function SetReadOnly(ori)
    local t = {}
    t.__allValue = {}
    for k, v in pairs(ori) do
        t.__allValue[k] = v
    end

    t.ForceSet = function (t, k, v)
        t.__allValue[k] = v
    end

    local mt = {
        __newindex = function(t, k, v)
            print("you are not supported to do this")
        end
    }

    return setmetatable(t, mt)
end

return SetReadOnly(monster_Config)
```

## 遍历

可以发现，当上文对 monster_config 进行元表的限制后，似乎对 monster_config 进行遍历会有问题，修改过元表遍历会怎样的，试一下

``` lua
for k, v in pairs(monster_config) do
    print(string.format("k = %s, v = %s", k, v))
end

-- >>>>> output
k = ForceSet, v = function: 00000183EAA8C6B0
k = __allValue, v = table: 00000183EAAA3300
```

所以还需要解决遍历问题，下面重写迭代器

``` lua
-- 对于 mt，新增 __pairs 的实现
local mt = {
    __pairs = function(t)
        local function iterator(t, index)
            local nextIndex, nextValue = next(t.__allValue, index)
            if nextIndex then
                return nextIndex, nextValue
            end
        end

        return iterator, t, nil
    end
}

-- 对于 ipairs，则进行全局重写
local function ipairs(tab, index)
    local function iterator(tab, index)
        index = index + 1
        if tab[index] then
            return index, tab[index]
        end
    end

    if tab.__allValue then
        return iterator, tab.__allValue, 0
    else
        return iterator, tab, 0
    end
end
```

对于 ipairs 的全局重写改动影响较大，比较在意的话，可以使用约定用另一种关键字代替表格的 ipairs 遍历，实质都是遍历其中的 __allValues。

## 注意

* __index 和 __newindex 的生效都需要原来的表中不存在相应的键值，才会有效。
* __index 和 __newindex 是可以造成死循环问题的，如 
``` lua 
local mt = {
    __newindex = function(t, k, v)
        t.k = v -- dead loop
    end
}
``` 

## __add

以下介绍 __add 的重写

``` lua
local mt = {
    __add = function(tabA, tabB)
        local result = {}
        for k, v in ipairs(tabA) do
            result[k] = tabA[k] + tabB[k]
        end
    end
}

local tab1 = {1, 2, 3}
local tab2 = {1, 1, 1}

setmetatable(tab, mt)

local result = tab1 + tab2
for k, v in ipairs(result) do
    print(k, v)
end

-- >>> output
2
3
4
```

需要注意的是，元方法的调用，只有在原 **+** 无法调用的情况下才会调用，例如两个表相加，表+字符串等等。

并且在遇见这种情况的时候，会从左到右检测运算的元素是否有 __add 方法，对找到的第一个 __add 方法依次传入参与运算的元素

类似 __add 的有

* __sub: - 操作。
* __mul: * 操作。
* __div: / 操作。
* __mod: % 操作。
* __pow: ^ （次方）操作。
* __unm: - （取负）操作。
* __concat: .. （连接）操作。 类似 __add 不同的是 Lua 在任何操作数即不是一个字符串 也不是数字（数字总能转换为对应的字符串）的情况下尝试元方法。
* __eq: == （等于）操作。
* __lt: < （小于）操作。
* __le: <= （小于等于）操作。比价特殊的是，如果触发了 le 的比较事件，优先查找 __le 若不存在，则查找 __lt