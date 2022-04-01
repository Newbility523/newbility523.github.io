# Table

Lua 的表分为两种类型，List 和 Record 非数值索引都为 List, 其余则为 Record，也可以混搭。

``` lua
-- 纯 List
local t =
{
    1,
    2,
    [3] = 3,
    { a = "lalalal" },
}

-- 纯 Record
local t =
{
    a = "lalala",
    ["c"] = 123
}

-- 混搭
local t =
{
    1，
    a = "lalala"
}
```

## 索引

table 取值有两种方式，通过 "." 符号或 [ ] 。

``` lua
-- 等同
local t =
{
    a = "lalala",
    ["a"] = "lalala",
}

t.a = "lalala"
t.["a"] = "lalala"
t."a" = "lalala"
```

## 长度

最简单的获取 table 长度是用 "#" 获取。但 "#" 是获取的是**以索引 1 开始且连续无 nil 值的元素下标**，中间夹带 Record 类型的元素是不参与长度计数。但如果出现List风格中存在 nil 就无法正确获得长度。

``` lua
local t =
{
    1,
    nil,
}
-- #t = 1

local t =
{
    1,
    nil,
    2,
    --nil,
    --a = 2,
    --nil
}
-- #t = 3

local t =
{
    1,
    nil,
    2,
    nil,
    a = 2,
    nil
}
-- #t = 1
```

``` lua
local t =
{
    [0] = 1,
    2,
}
-- #t = 1

local t =
{
    [0] = 1,
    2,
    [1] = 1
}
-- #t = 1

local t =
{
    [0] = 1,
    2,
    3,
    [3] = 1,
    [6] = 1,
}
-- #t = 6 (因为找到了6)

local t =
{
    [0] = 1,
    2,
    3,
    [3] = 1,
    [110] = 1,
}
-- #t = 3 (因为没找到110)
```

总的来说，夹带 nil 时或不连续的 List 风格 table，无法通过 "#" 获取正确长度。通过遍历获取表格长度最安全。

## 遍历

遍历表有三种方式，（还有一种使用了新版本的 Lua 去除的 API，所以不做介绍）

* for key, value in pairs(t) do 以 **hash** 值遍历
* for key, value in ipairs(t) do 以 1 开始索引遍历**连续的数组**
* for i = 1, #t do 以 1 到 #t 索引遍历 t

示例

``` lua
local t =
{
    [0] = 0,
    1,
    2,
    a = "hello world",
    [4] = 4
}

for k, v in pairs(t) do
    print("k = " .. k .. " v = " .. v)
end
-->> output :
-->> k = 1 v = 1
-->> k = 2 v = 2
-->> k = 0 v = 0
-->> k = 4 v = 4
-->> k = a v = hello world

for k, v in ipairs(t) do
    print("k = " .. k .. " v = " .. v)
end
-->> output :
-->> k = 1 v = 1
-->> k = 2 v = 2

for i = 1, #t do
    print("i = " .. i .. " v = " .. t[i])
end
-->> output :
-->> i = 1 v = 1
-->> i = 2 v = 2
```

## 增删
