## Jekyll

前情提要 MDWebsite。

尝试过后，发现我做的就是静态网页部署的框架的内容，那么使用现有的比较热门的 Jekyll 丰富我的博客

本地安装 Jekyll，无论是否是 Mac，直接使用官网教程的指令安装基本都会出问题，如

```shell
Error installing jekyll: Failed to build gem native extension
```

Gem 是 Ruby 的包管理器，不同系统出厂自带的 Ruby 可能都是很老的版本，[并不适用于 Jekyll 的安装](https://www.rubyonmac.dev/error-error-installing-jekyll-error-failed-to-build-gem-native-extension)。

所以先安装 [安装 RVM](https://www.how2shout.com/linux/how-to-install-rvm-ruby-version-manager-on-ubuntu-20-04-lts/)，它可以管理不同版本的 Ruby 和 Gem，需要用什么版本，设置下就好。

如果出现以下警告，根据提示处理。

```shell
WARNING: you have set GEM_HOME="/home/client/gems" This is conflicting with RVM. Make sure to call:
		unset GEM_HOME
# 处理方式
unset GEM_HOME ; \curl -sSL https://get.rvm.io | bash -s stable
```



大概率出现无法访问 RVM 的某些网络结点，可以设置 [VPN](https://segmentfault.com/a/1190000041862051)

补充几点：

1. 下载选项的 adm64 和 arm64 是不同的，一般 64 位 PC 都是 amd64。arm64 是移动平台或者苹果新芯片。
2. 下载的是 clash-linux-amd64-xxx 其实压缩包，在调整执行权限的时候，要先对其解压，再对里面的内容 `chmod +x`
3. `Country.mmdb` 和 `config.yaml` 都要重新下载，并且无法通过命令行使用订阅获取正确的`config.yaml` ，我的处理方式是通过 pc clash 客户端那边拷一份服务器上。
4. Ping 命令是无法代理的测试连通性，如`ping -c 3 www.google.com`，应该使用 `curl www.google.com`，能返回 HTML 结果就是通了。
5. 保证了 VPN 通后，可能某些版本的 Ubuntu 仍然无法安装指定版本的 ruby，就例如我当前的 `Ubuntu 22.04.1 LTS x86_64 ` 

 ``` shell
 # 通过 neofetch 查看
 sudo apt install neofetch
 neofetch
 ```

原因如下

https://github.com/rbenv/ruby-build/discussions/1940

https://blog.francium.tech/setting-up-ruby-2-7-6-on-ubuntu-22-04-fdb9560715f7

解决办法是

```shell
rvm pkg install openssl
rvm install 2.7.2 --with-openssl-dir=$HOME/.rvm/usr
```



**至此终于正常使用 [RVM](https://www.how2shout.com/linux/how-to-install-rvm-ruby-version-manager-on-ubuntu-20-04-lts/) 了**