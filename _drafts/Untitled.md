https://pysvn.sourceforge.io/Docs/pysvn_prog_ref.html

远程开发设置



云服务器选购

ssh-copy-id 密钥登录

ssh -i 私钥 userName@host

ssh 简化登录

/.ssh/config

```
Host test    
	HostName host    
	User userName    
	IdentityFile 私钥路径
```

ssh test = ssh -i 私钥 userName@host



[ssh 传输文件](https://www.cnblogs.com/jiangyao/archive/2011/01/26/1945570.html)，在 VPN 还没装好的时候，很救命。

frp 安装

Wget 下载



* [ssh 详细教程](https://www.cnblogs.com/sunsky303/p/12835254.html)



https://loster5683.github.io/2019/12/17/frp/

https://blog.csdn.net/lsllll44/article/details/122703139



https://blog.csdn.net/lyq19870515/article/details/127206108

https://blog.csdn.net/rockage/article/details/124575215



win10 ssh 127.0.0.1无法连接

https://blog.csdn.net/LittyPt/article/details/125529269



https://blog.51cto.com/u_15072917/4381994



https://blog.csdn.net/weixin_33433927/article/details/116901684?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1-116901684-blog-124427458.pc_relevant_recovery_v2&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1-116901684-blog-124427458.pc_relevant_recovery_v2&utm_relevant_index=1



```shell
# 测试启动
./frps -c ./frps.ini

# 后台启动
nohup ./frps -c ./frps.ini > logs.out 2>1 &

# 查询启动任务ID
ps -ef | grep frps

# 杀死进程
kill -9 进程ID
```

常见问题

**Window 重启无法连接**

确保`服务`的 open ssd server 处于打开状态

**过一段时间后 frp 无法使用**

大概率服务器问题。

用户无操作一段时间后自动断开连接，从而以当前登录 shell 开启的服务都会被关闭，所以需要使用后台启动方式。





