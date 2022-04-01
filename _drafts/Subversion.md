

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

## 清理文件

清理本地新增文件

```shell
svn cleanup --remove-unversioned
```



reference

[Show log problem]https://bugzilla.redhat.com/show_bug.cgi?id=556712