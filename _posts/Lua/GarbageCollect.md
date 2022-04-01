# 垃圾回收

Lua 垃圾是自动回收的，但是也提供了 API 用于手动控制回收时机，在合适的时候手动调用 GC，较为平缓的控制内存占用。

调用 `collectgarbage([opt [, art]])` 控制 GC，opt有

* "collect" 直接开始一次完整的 GC。它是默任的 opt
* "stop" 停止自动 GC
* "restart" 重新开始自动 GC
* "count" 获得当前 Lua 使用的所有内存占用，单位k
* "step" 分步进行 GC，arg 为步数，当本次步数可完整 GC 则返回 true。**其实我没搞懂**
* "setpause" 设置 GC 的触发内存占用。以 100 为 1 倍，当设为 arg = 200 时，GC 的触发条件是当前占用内存达到上次 GC 后占用内存的两倍，数值越大， GC 频率越低，设置小于 100 会立即进行 GC 。使用该参数会返回上次设置的触发值
* "setstepmul" 设置 GC 的触发速度（相对内存申请速度而言）。以100为1倍，当设为 arg = 200 时，GC 的执行频率是内存申请的两倍，数值越大，GC 触发频率越高，不要设置小于 100 会永远无法完成 GC。详细看示例

注："setpause" 和 "setsetpmul" **共同**控制着 GC 频率

## 示例

``` lua
local function Func( )
    local a = {}
    for i = 1, 1000 do
        table.insert(a, i)
    end
end

collectgarbage("collect")

collectgarbage("setstepmul", 200)
print("count-size : " .. collectgarbage("count"))
local previous = collectgarbage("setpause", 200)

print("begin")
for i = 1, 8 do
    Func()
    print("count-size ".. i .." : " .. collectgarbage("count"))
end
print("end")

print("count-size : " .. collectgarbage("count"))
```

输出

``` console
count-size : 20.3857421875
begin
count-size 1 : 37.1953125
count-size 2 : 53.3115234375
count-size 3 : 69.43359375
count-size 4 : 37.009765625
count-size 5 : 53.1298828125
count-size 6 : 69.251953125
count-size 7 : 37.0107421875
count-size 8 : 53.1328125
end
count-size : 53.2177734375
```

可以初始有用到的内存大致占用 20kb，并从增长速率可以看出，每次 Func() 循环会产出 16kb 左右 garbage。设置`collectgarbage("setpause", 200)`后，根据说明，应该在 40kb 的时候触发一次 GC，但是似乎 GC 并没有很符合预期。在 53kb 后，再次提升为 69kb。第二次的循环就会让内存占用超过到 40kb，没有进行 GC 可以理解为申请内存时先判断是否超过设定值，37kb 时没有超过，所以又一次申请了 16kb 内存。但为什么还会出现 69kb 的情况呢，原因就在`collectgargage("setstepmul", 200)`上，200 速度太低了。当设置为 900 后，可获得

``` console
count-size : 20.4013671875
begin
count-size 1 : 37.2109375
count-size 2 : 53.3271484375
count-size 3 : 37.02734375
count-size 4 : 53.1455078125
count-size 5 : 37.02734375
count-size 6 : 53.1455078125
count-size 7 : 37.02734375
count-size 8 : 53.1455078125
end
count-size : 20.99609375
```

Get~