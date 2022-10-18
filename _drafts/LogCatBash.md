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