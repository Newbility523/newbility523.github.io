# Lua Week Table 弱表

## week table 说明

lua中引用类型包括tables, function, thread, userdata。引用分为强引用和弱引用。不是弱表时，只用当自身引用设为`nil`, 或生命周期结束，gc才会回收相关内存；而弱表的键/值/键或值没有**被引用**时，就会在gc被设为`nil`并回收空间。

怎样是弱表：对一个表的metatable中的`__mode`设为"k", "v", "kv"时。如下：

``` lua
local t = {}
-- 当键值没被引用时，可被gc
setmetatable(t, { __mode = "v" })
-- 当值没被引用时，可被gc
setmetatable(t, { __mode = "k" })
-- 当键或值没被引用时，可被gc
setmetatable(t, { __mode = "kv" })
```

包括gc的例子

``` lua
-- 强引用
local t = {}
t[1] = { "something" }

-- 此时a就引用了t, 调用gc并不会回收a和t[1]
a = t[1]
collectgarbage("collect")

-- 解掉引用，调用gc会回收a，但不会回收t[1]，因为t[1]是仍指向{ "something" }创建时的空间
a = nil
collectgarbage("collect")


-- 弱引用/弱表
local t = {}
setmetatable(t, { __mode = "v"})
t[1] = { "something" }

-- 不变：此时a就引用了t[1], 调用gc并不会回收a和t[1]
a = t[1]
collectgarbage("collect")

-- 解掉引用，调用gc会回收a，同时回收t[1]，因为t是以键值表示的弱表
a = nil
collectgarbage("collect")
```

## week table应用

week table的特性在于无需手动检查和清理无用的资源。当是去了引用时，Lua自动调用gc的时候就会清除掉，方便省心。

### 有默认值的表

当创建表时，通常希望表的值再未指定的时候有默认值。通常的方法是设置metatable的`__index`。

最简单做法

``` lua
-- t 为需要设置默认值的表
-- v 默认值
local function set_default(t, v)
    local mt = {
        __index = function(t, k)
            return v
        end
    }

    setmetatable(t, mt)
end

local demo = {}
set_default(a, 100)
print(demo.a)
-->> output: 100
```

优化做法：统一只用一个元表，并把默认值存入所属的表内，设定唯一键值 `__`

``` lua
local mt = {
    __index = function(t, k)
        return t.__
    end
}

local function set_default(t, v)
    t.__ = v
    setmetatable(t, mt)
end
```

优化之缓存做法：利用week table特性，每次对表设置默认值，先检查默认值是否有缓存，存在的话，使用已经存在的meta表。对相同默认值出现十分频繁的时候使用。

``` lua
local weekTable = {}
setmetatable(weekTable, { __mode = "v" })

local function set_default(t, v)
    local cache = weekTable[v]
    if not cache then
        local res = {
            __index = function(tab, key)
                if "table" == type(v) then
                    return v[key]
                else
                    return key
                end
            end
        }
        weekTable[v] = res
        cache = res
    end

    setmetatable(t, cache)
end

local t = {}
local default = {
    a = 10,
    b = 200,
}
set_default(t, default)
print("t.a = " .. t.a)
-->> ouput: 10
print("t.b = " .. t.b)
-->> ouput: 200
```

## week table 不同弱表类型回收差异详解

对上方用弱表作为缓存实现带默认值的表进行分析，添加功能函数

``` lua
-- 求表长
local function table_len(t)
    local count = 0
    for k, v in pairs(t) do
        count = count + 1
    end

    return count
end
```

对于当前：只需 `t = nil` 即解除 t 的元表引用关系

``` lua
collectgarbage("collect")
print("weekTable.len = " .. table_len(weekTable))
--> ouput: weekTable.len = 1

t = nil
-- 也可以下行代替 t = nil
--setmetatable(t, nil)

collectgarbage("collect")
print("weekTable.len = " .. table_len(weekTable))
--> ouput: weekTable.len = 0
```

当修改`__mode = "k"`：这种情况略为复杂，需要default和t同时解除引用才可以。因为作为值，{ a = 10, b = 200} 被default以及t的metatable引用着。

``` lua
collectgarbage("collect")
print("weekTable.len = " .. table_len(weekTable))
--> ouput: weekTable.len = 1
default = nil
t = nil
-- 也可以下行代替 t = nil
--setmetatable(t, nil)

collectgarbage("collect")
print("weekTable.len = " .. table_len(weekTable))
--> ouput: weekTable.len = 0
```

当修改为`__mode = "kv"`则是上两种情况的总和。



### 及时清除使用率低的 require 模块

打开不同界面，就 require 一系列不同的 module，但是很多界面出现频率低。在切换场景调用 GC 也无法清空，module 内关联的配置表也无法解掉引用。这里可以尝试使用弱表，module 内用一个弱表代替 require 的缓存，当需要 GC 掉 module 时，先 GC 过一遍弱表，将没用的 module 记录缓存清掉，再找出清掉的 module key，把 lua 全局 loaded 的 nil 清掉，再调用一次 GC。

```lua
-- 解除 module
function unrequire(m)
    package.loaded[m] = nil
    _G[m] = nil
end
```

