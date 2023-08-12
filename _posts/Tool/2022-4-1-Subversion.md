---
layout: post
title: SVN 学习
excerpt: SVN 学习 
tags: 
categories: Personal
---

虽然工作日常都是使用 TortoiseSVN，但是在一些打包机或者远程上并 TortoiseSVN，甚至没有桌面系统，SVN 命令行模式就有必要掌握一下了。而且如果在脚本工具要用 SVN 也需要使用命令行调用。

## 本地创建库

创建

```shell
svnadmin create /opt/svn/runoob
```

开启

```shell
# 指定目录和端口号
svnserve -d -r 目录 --listen-port 端口号
# 指定目录，使用默认端口号 3690
svnserve -d -r 目录
```

目录指定单个仓库目录，svn 就会为该仓库服务，也可以指定存放仓库的上层目录，这样 svn 就能对这个目录下的所有仓库服务。

注意，我在 window 下测试开启 svn 服务器，成功后并不会输出任何信息，终端会停住，无法进行任何操作，即使 Ctrl + C。

![image-20220208102343725](C:/Users/Administrator/AppData/Roaming/Typora/typora-user-images/image-20220208102343725.png)



## 查询

### info

![image-20220214115338907](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220214115338907.png)

此时，可以如果只要显示某个字段

| 字段                  | 含义                                    |
| --------------------- | --------------------------------------- |
| kind                  | 文件类型：文件夹输出 dir，文件输出 file |
| revision              | 版本，如 43                             |
| last-changed-author   | 最近修改人                              |
| last-changed-revision | 最近修改的版本                          |
| last-changed-date     | 最近修改的时间                          |
| relative-url          | 相对于项目的路径 ^/newFileAfter39.txt   |
| repos-root-url        | 绝对路径 svn://127.0.0.1/project1       |
| repos-uuid            | fb095efa-f254-874e-8a7b-d0e31b133803    |



### status 文件或目录变化状态

```shell
svn status
svn st
```



| 版本状态 | 含义             |
| -------- | ---------------- |
| M        | 修改             |
| !        | 版本控制文件丢失 |
| ?        | 不在版本控制内   |
| D        | 删除             |
| A        | 添加             |
| +        |                  |
| C        | 冲突             |

! 和 ? 是一个未确定的状态，直接提交是无效的。例如 ! 的文件表示丢失，但这个丢失是删除呢，还是真的不小心删了呢？用指令说明

```shell
# 对于 file.txt，有 ! 状态（表示丢失）
# 丢失是我删掉的，我想把它从版本内移除
# 此时提交是无效的
svn ci -m "msg"
# 先行确认，确认要删掉再提交才有效
svn rm file.txt
svn ci -m "msg"

# 丢失是不小心删掉的，我想复原
# 提交是无效的
svn ci -m "msg"
# 还原
svn revert file.txt

# ? 状态同理
```



### 常见错误处理

显示 log 报错

![image-20220125150156374](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220125150156374.png)

解决方法：

将 conf\svnserve.conf 修改

成 anon-access = none1

或 anon-access = read

且 authz 加上

\* = r

在 anon-access = none 的情况下，svn 回强制对所有操作进行账号权限判断，在已有账号缓存的情况下，就能自动登录，并且显示到 log。anon-access = read 的话，虽然我们的本意指代“对未知用户开放查阅权限”，用于 show log，很合理。但是权限都是要和 authz 搭配使用的，这种情况下需要配置 \* = r ，否则未知用户都算不上。



## Conflict 冲突

### Text Conflict

情形：

对`/test.txt`修改提交失败

![image-20220127152631545](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220127152631545.png)

执行 update，发现冲突。

![image-20220127152801337](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220127152801337.png)

提示输入处理方式，这里只给出了常用的几个提示，实际可以输入的指令输入 s 看到全部。

常用如下：

| 指令 | 全称           | 作用                           |
| :--- | :------------- | :----------------------------- |
| tf   | their full     | 全部使用他人的                 |
| mf   | mine full      | 全部使用本地的                 |
| tc   | their conflict | 对于**冲突**部分全部使用别人的 |
| mc   | mine conflict  | 对于**冲突**部分全部使用自己的 |
| p    | postpone       | 展缓处理这个文件               |
| q    | quit postpone  | 退出处理余下的所有冲突文件     |
| e    | edit           | 进入编辑模式，手动处理冲突     |

对于 tf/mf 和 tc/tc 的区别是，f 表示 full，会使用一方的内容完全替换掉，c 则只处理 conflict 部分。更通常来说，会用 tc/mc。

统一处理冲突

`svn resolve`会重新进入冲突处理模式，svn 逐个询问如何处理冲突，统一处理需要额外添加命令。

```shell
# -R 
svn resolve --accept theirs-full -R
```



### Tree conflict

情形：

对`/dir2/file.txt`修改提交失败

![image-20220126164620844](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220126164620844.png)

执行 update，发现冲突。

![image-20220126165124553](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220126165124553.png)

提示 *local dir edit, incoming dir delete or move upon update*（本地文件夹内有修改，但即将删除改文件夹，或被移动了）

其实如果是本地文件有修改，其他人却删除了，一样会导致 tree conflict

我此处先输入了 p 展缓处理。



#### 不同情形处理方法

##### 保留我的修改

1. 可以在更新出现冲突后，直接输入 **r**，
2. `svn resolve --accept working -R .`

以上做法都表示：**还原**被移除的文件夹以及下面的**所有内容**，并保留本地的修改。

##### 放弃本地修改

首先，在update后，出现冲突的便捷处理指令内并没有相关的命令，只有 **r mark resolved**。自然的回想到使用

```shell
 svn resolve --accept theirs-full -R
```

但是会有报错

![image-20220126174854108](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220126174854108.png)

提示里表明，tree conflict 不支持这种处理。但是如果接受建议里的用 working 代替，就替代了别人的修改，与目的不符。

所以，换个思路，放弃本地修改只能先 revert 。

```shell
 svn revert dir2/ -R
```

有点怪...



注意：使用 shell 脚本调用 svn up 发现冲突时，弹出的请求处理冲突的对话并不会影响后续指令的执行。



一些常用组合指令

```shell
# 查看冲突
svn st | grep '^C'
```



## 清理文件

清理本地新增文件

```shell
svn cleanup --remove-unversioned
```



还原文件到某个版本

https://stackoverflow.com/questions/2812901/reverting-single-file-in-svn-to-a-particular-revision





## SVN 疑难杂症处理汇总

**svn sqlite[S5]:database is locked**

终端中使用`Ctrl + Z`退出 update 的过程再次 update 容易出现。原因是数据库被锁住了，查看后台可以发现仍有关于 svn 的进程。

```shell
cd .svn
mv wc.db wc.db.old
sqlite3 wc.db.old
.backup main wc.db
.exit
cd ..
svn cleanup
```



**校验错误**

![image-20220419205923125](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220419205923125.png)

![image-20220609170607179](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220609170607179.png)

```
svn: warning: W155027: Tree conflict can only be resolved to 'working' state; 'D:\BuildProject\Yimi01_Main\Client\project\Assets\RawResources\Character\Prefab\Face\Materials' not resolved
svn: E155027: Failure occurred resolving one or more conflicts
```



**文件大小写换名**

![image-20220805101438326](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220805101438326.png)

![image-20220805101647180](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220805101647180.png)

```
svn: E155010: Commit failed (details follow):
svn: E155010: 'D:\Yimi01\Client\project\Assets\TextAssets\LuaJITScript64\MainGame\Util\UTF8Util.lua' is scheduled for addition, but is missing
```



![image-20220809110231262](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220809110231262.png)

![image-20220809110242184](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220809110242184.png)

图集工具无法检测到变化并生成提交。



Linux 使用 SVN 的问题

[参考](https://stackoverflow.com/questions/2599281/cant-make-svn-store-passwords-even-though-the-configuration-is-set-to-allow-it)

在使用 wsl 时，才发现 linux 下使用 svn 的任何指令都需要输入账号密码，无法接受。经过一阵搜索以及验证。大致有三种解决办法

* 修改 `~/.subversion/config` 或 `~/.subversion/servers` 的配置
* 使用密码管理工具 `gpg-agent`
* 手动修改 `~/.subversion/auth/svn.simple`

网上大多数的教程讲的都是怎么调整 `config` 或 `servers` 文件保存密码，但是随着 svn 版本迭代，这种方式已经被**禁止**了。（只允许密码管理工具）

> window，mac 上用的好好的是因为，系统也带了密码管理工具。



 `gpg-agent` 的用法没去尝试，大致了解最终需要通过 `svn gpg-agent command` 的形式使用 svn。虽然可以改 alias 解决这个问题，但是还是太麻烦了点。

> 正途，但是太麻烦
>
> Ubuntu 16.10 (*Subversion* 1.9.4 versus 1.9.3 in 16.04) *svn* has stopped using *GPG*-*Agent* and started using GNOME Keyring to store my password.
>
> 突然又看到不支持了，无所谓了，反正不用



原理上虽然 svn 已经屏蔽了保存密码的操作，但是我们可以强制将密码写入认证文件中。这就是最后的解决办法，简单明了。

> 明文保存密码虽然确实不安全，但通过秘钥登录 ssh 能很大程度避免密码泄露问题，所以能接受。



注意：

如果后续种种原因对 repo 输入密码，会覆盖掉原本改动的 `svn.simple` 

如果调整的配置文件乱了，可以直接删掉 `~/.subverion` ，重新执行 svn 命令就会重新生成



参考

* [Show log problem](https://bugzilla.redhat.com/show_bug.cgi?id=556712)
* https://blog.csdn.net/oujiangping/article/details/77864660