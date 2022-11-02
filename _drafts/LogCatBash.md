先查看本地 Android SDK 路径

![image-20221018142809106](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221018142809106.png)

找出 adb.exe 所在目录

`C:\Users\Administrator\AppData\Local\Android\Sdk\platform-tools`

> 为了方便，把此目录添加进系统 Path 中



终端下运行

```bash
#夜神模拟器
adb connect 127.0.0.1:62001
#逍遥安卓模拟器
adb connect 127.0.0.1:21503
#天天模拟器
adb connect 127.0.0.1:6555
#海马玩模拟器
adb connect 127.0.0.1:53001
#网易MUMU
adb connect 127.0.0.1:7555
#原生模拟器
adb connect (你的IP地址)：5555
```



[判断是否 Development Build](https://www.cnblogs.com/zhaoqingqing/p/13332683.html)

Auto Connect 点选后就无需使用 adb 命令行

不同的 project 不影响真机 profiler



但实际情况下，不建议勾选 Auto Connect。官网的描述是，勾选后，会把 Editor ip 打进包里，然后运行游戏时会对 Editor ip 尝试进行连接，从而达到自动连接的效果。

然而在正式的工作环境中，打包任务都是交给专门的打包的机器或者人员复制。此时打进包里的 ip 肯定就不是要进行 profiler 的机器 ip，所以一直无法正常连接。

总结，不要勾选 Auto Connect，而是通过 adb 手动指定。



adb kill-server

adb forward tcp:34999 localabstract:Unity-com.ymgame.g01