# AssetBundle服务器

* Window
* Linux

## Window 10

### 搭建

开启IIS：开启控制面板 -> 程序 -> 启用或关闭Window功能 -> ftp和http相关项。

![开启ftp/http](img/window_server_0.png)

1是用于开始ftp服务，2是开启http服务，如果没有2，就只能用过ftp://访问

点击确认后，再开始种输入IIS，打开IIS管理器。右键网站，选择添加网站

![添加网站](img/window_server_1.png)

![添加网站](img/window_server_2.png)

这时候就可以尝试访问了，出现有问题的错误，就算配置成功。因为目前做的都是最基本设置，我们没有再URL中指定访问的内容，又没有默认页面，还不允许浏览MyFtp目录下结构，自然报错。由于`WWW`加载资源都会指定详细的内容，就不搞其他花里胡哨的了。

![访问新建网站](img/window_server_3.png)

接下来开启FTP服务，因为没有这一步是无法访问除了.html，.js网页等之外的文件的。右键IIS管理器上新建的NewRes，选择“添加FTP发布”，进入配置界面，也是选中本机IP地址，选择“无SSL”，点击“下一步”

![开启ftp服务](img/window_server_4.png)

选择“匿名”，权限就设置只读，点击确认，至此一个可以用Http协议获取网站下文件的服务器就搭建完了。但是，仍有一个问题，由于AB素材是没后缀名的，用URL会访问不到。

![配置访问设置](img/window_server_5.png)

运行mmc

![打开MMC](img/window_server_6.png)

点击 文件 -> 添加管理单元 -> IIS。

![添加IIS](img/window_server_7.png)

完毕后，可发现MMC下多了和IIS子窗口，点击新建的网站，选IIS选项下多出了MIME,点击

![选择新网站](img/window_server_8.png)

点击添加，拓展名用"."，类型输入"application/octet-stream"

![添加类型](img/window_server_9.png)

![添加类型](img/window_server_10.png)

以上操作后，会在MyFtp文件夹先新增一个web.config文件，别删，删了就要重新添加一次mime类型。

至此，服务器搭建完毕，可以用http访问服务器下载素材了。

### 素材上传

还未参透，敬请期待

## Linux-Manjaro

### 搭建

### 素材上传