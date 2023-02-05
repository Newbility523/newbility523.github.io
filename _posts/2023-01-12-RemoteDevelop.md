---
title: "VSCode 远程办公"
author: huangzhuofu
keywords: frp, vscode, remove develop, ssh
data: 2023-01-12 00:17:26
summary: 远程办公配置说明
---

## VSCode 远程办公

[TOC]

以下方式基于 Frp 内网穿透实现，内网穿透相当于将本机电脑暴露在公网上，为了安全，所以请先确保自己的电脑的账号密码足够复杂。



**功能**

就代码方面和本地开发无异，支持 Lua debug，支持插件（本地机和远程机装了一样的插件即可，且只需远程机配置过就行）。改动也是都是实时更新的，装上 svn 插件，还能直接提交。

建议开发模式两个窗口，本地 vscode 改代码，向日葵/toDesk 远程控制 Unity 



### 开启 ssh 服务器

以下内容要在远程机操作（公司电脑）



#### 开启 window 自带的

在开启菜单搜索 ”服务“

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128173106810.png" alt="image-20221128173106810" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



打开，找到 OpenSSH SSH Server。（键盘输入 o 可快速定位 o 开头的条目）

如果发现没开启，可以选中右键点击开启。并且建议再右键它的属性，把它改为自动开启。

**[如果没有，则说明没安装，根据下面步骤安装即可](#安装 OpenSSH Server)**

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128172858130.png" alt="image-20221128172858130" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128173414962.png" alt="image-20221128173414962" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



#### 安装 OpenSSH Server

##### 通过 Window 自带的功能安装

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128173759584.png" alt="image-20221128173759584" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;" />

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128173836549.png" alt="image-20221128173836549" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128173945207.png" alt="image-20221128173945207" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>

等到安装完毕后重新[执行开启](#开启 Window 的 ssh 服务器功能) 



##### 手动安装

系统安装的方式可能因为网速原因迟迟无法完成，可以尝试离线安装，即压缩包 **OpenSSH-Win64.zip**

1. 解压到 C:\Program Files\OpenSSH-Win64

2. 使用 PowerShell，右键管理员模式开启，运行指令 

   ```shell
   set-executionpolicy remotesigned
   ```

3. 安装

   ```shell
   # 先 cd 到安装目录
   cd "C:\Program Files\OpenSSH-Win64"
   # 运行安装脚本
   .\install-sshd.ps1
   ```

4. 启动服务，[也可以用上面的](#开启 Window 的 ssh 服务器功能) 

   ```shell
   net start sshd
   ```

5. 测试

   ```shell
   # 一般来说 Administrator 是当前的 Windows 的账号名，如果不是改就成你自己的。
   ssh Administrator@127.0.0.1
   # 连接上后可通过可通过 exit 断开连接
   ```

   

### Frp 配置

#### 服务器

[**Frp**(Fast reverse proxy) 项目地址](https://github.com/fatedier/frp)

**服务器下拉取最新 frp 服务器代码**

```shell
# 下载 frp
wget https://github.com/fatedier/frp/releases/download/v0.44.0/frp_0.44.0_linux_amd64.tar.gz
# 解压
tar zxvf frp_0.44.0_linux_amd64.tar.gz
```

> 下载后无需对配置调整，可直接开启。

**开启服务**

```shell
# 进入 frp 目录启动
./frps -c ./frps.ini
```

> `Frps` `frps.ini` 的 s 表明是服务器相关文件，c 表明是客户端相关文件，`frps.ini` 是服务器的配置文件。

**frp 启动检测 / 关闭**

```shell
# 查询启动任务ID
ps -ef | grep frps
# 杀死进程
kill -9 进程ID
```

**更优的启动方式**

```shell
# 后台启动
nohup ./frps -c ./frps.ini > logs.out 2>1 &
```

> 连接远程服务器时，用户无操作一段时间后自动断开连接，那么以当前登录 shell 开启的服务都会被关闭，所以需要使用后台启动方式，保持 frp 服务运行。



#### 客户端

资源地址同上，解压 **frp.zip** 到任意位置，调整 Frp 客户端配置，即 frpc.ini

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128170323225.png" alt="image-20221128170323225" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>

需调整内容仅两项

* [ssh_yimi_pc] 

  需要唯一，改为一个不会和其他人重复的字符串，例如用自己名字 [ssh_huangzhuofu]。

* Remote_port = 6000

  请按照下面分配的端口区间填写自己的 remote_port，避免重复

  1. 小夫：6000 - 6009

  2. 丹佳：6010 - 6019

  3. 宣任：6020 - 6029

  4. 圣杰：6030 - 6039

  5. 镇科：6040 - 6049

  6. 俊鹏：6050 - 6059

  7. 萌萌：6060 - 6069

  8. 淑怡：6070 - 6079

  9. 子康：6080 - 6089

  10. 黄红：6090 - 6099

  11. 德昊：6100 - 6109

  12. 邵洋：6110 - 6119

  13. 小卫：6120 - 6129

      

完成后，双击目录下的 start.bat 运行即可。如果没有失败字样，说明成功。



#### 客户端进阶处理

##### 开机启动

虽然每次启动只要点一次 start.bat 文件，每次打开都要手动还是有点不爽。[所以让 bat 开机自启动。](https://lo-li.cn/239)

**秘钥登录**

既然开启自动开启 frp，就有充足的理由保护好自己的电脑，以免无聊的人登录搞破坏，虽然改个好点的密码也行，更好的是通过秘钥登录 ssh。



### 安装配置 VSCode 远程插件

此时切换到本地机器（家里），下面根据图片步骤操作。

安装插件 Remote Development

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128195443313.png" alt="image-20221128195443313" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



Ctrl + Shift + P，输入 Connect to Host，选中第一个点击

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128200154853.png" alt="image-20221128200154853" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128200525295.png" alt="image-20221128200525295" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



ssh Administrator@43.139.182.28:6000，需要注意

Adminstrator为用户名，如果不是，按照实际的填

43.139.182.28 为 frpc.ini 里的远程服务器地址，这里填一样的即可

6000 为你 frpc.ini 修改的端口号，也要按实际的填，6000 是小夫的

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128200654341.png" alt="image-20221128200654341" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



如果是第一次远程，会提示你保存地址，选第一个即可

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128200740679.png" alt="image-20221128200740679" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



完毕后，下次可点击左下角，快速进行远程连接

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128201217094.png" alt="image-20221128201217094" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



选择刚刚填入的 ip

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128201332005.png" alt="image-20221128201332005" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



第一次会询问你连接的是什么类型系统，选择 Windows

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128200851057.png" alt="image-20221128200851057" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>

确认添加该机器

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128200958062.png" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



一切正常的话，左下角就如图显示

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128201452264.png" alt="image-20221128201452264" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



然后 vscode 就可以打开公司的目录。(如果不记得目录也可以一层层输入选择的。例如输入 E:\ 可以列出 E 盘下的文件)

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128201800092.png" alt="image-20221128201800092" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



成功！！！

<img src="https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20221128203516916.png" alt="image-20221128203516916" style="border-radius:3px; box-shadow:rgba(0,0,0,0.15) 0 0 8px;background:#FBFBFB;border:1px solid #ddd;margin:10px auto;margin-left: 15px;padding:5px;"/>



## 常见问题排查

**Window 重启无法连接**

确保`服务`的 open ssd server 处于打开状态

