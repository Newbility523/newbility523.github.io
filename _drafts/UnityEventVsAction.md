UnityEvent Unity内置事件类型

System.Event C# 底层事件类型

先说结论

1. 如果不是为了在Editor 下编辑事件，尽量用 Event。
2. UntiyEvent 运行速度比 Event 慢
3. UntiyEvent GC 也会更多

参考

https://stackoverflow.com/questions/44734580/why-choose-unityevent-over-native-c-sharp-events

https://www.reddit.com/r/Unity3D/comments/35sa5h/unityevent_vs_delegate_event_benchmark_for_those/#bottom-comments

https://www.jacksondunstan.com/articles/3335