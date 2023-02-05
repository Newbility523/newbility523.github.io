## 权限查看

```shell
    ls -l
```

输出的信息是当前路径下的文件和文件夹属性，构成为

权限 所有者 所属组 时间 名称

左边字符串即代表文件/文件夹的权限属性，共10位。第一位表示 "d" 为文件夹，"-" 为文件。剩余 9 位代表改项对用户所有者、用户组、其他组的权限，每组权限都分为三个 r (read 读)，w (write 写)，x (execute 执行)，且顺序固定为读写执行，若为 "-" 表示该没有位置的权限，如: "r-x" 表示读和执行权限。再举个完整点的例子，若有 "-rwxr----x" 表示这个文件的所有者有读写执行权力权限，用户组仅有读的权限，而其他组仅有执行权限。

**注意，不同于 Window 下 .exe 后缀表示可执行文件的是，在 Linux 下能否执行完全取决于文件的 x 权限是否被赋予，后缀名并没有其他实际意义（当然后缀名可以便于分辨文件的类型和使用场景）。**

## 用户管理

在介绍命令前，先说明命令操作的系统配置文件，主要的是以下三个

* /etc/passwd
* /etc/shadow
* /etc/group

先介绍各个文件的作用

### /etc/passwd

![passwd](/img/passwd.png)

系统的用户都存在这里，每个用户占用一行，格式内容如下

用户名:密码占位:用户ID:用户组ID:备注:Home目录:shell软件路径

### /etc/shadow

![shadow](/img/shadow.png)

用户加密后的密码，注意，打开该文件需要管理员权限，否则打开看到是空白的

### /etc/group

![group](/img/group.png)

所有用户组信息，格式如下

组名:密码占位:组ID:组内成员

### 添加用户，管理密码，变更用户属性用到以下命令

* useradd 添加用户

```shell
    -d # 新增目录给用户
    -m # 若新增目录不存在，创建它
    -g # 指定用户组
    -G # 指定多个附属的多个用户组，用逗号分隔
    -s # 指定用户默认使用的 shell，后跟 shell 的路径
    -u # 指定用户 id
    -c # 添加备注
```

最简单用法 `useradd name` 这个会默认指定一个同名用户目录到 `/home/name`，但是**不会创建**。当需要创建用户是带上目录，就只能再创建时用上 `-m`，如 `useradd -d /home/carl -m carl`，否则就只能手动创建目录，并修改目录权限。对于未指定 home 路径或 home 路径不存在的用户，登录时会定位到根目录下。

* passwd 新建/修改密码

```shell
    -d # 删掉用户密码，用户下次登录无需密码，但会造成 ssh 用该账号登录
    -l # 锁定密码，账号无法登录，且用户自身无法改变自己密码
    -u # 解锁密码，恢复账号可用密码登录
```

直接接用户名，即修改密码，如 `passwd carl`。

* userdel 删除用户以及相关文件

```shell
    -f # 强制删除，即使登陆也会被强制退出
    -r # 同时移除用户的 home 目录
```

* usermod 用户信息修改

大部分参数和 `useradd` 一致，下面只列举增加的

```shell
    -l # 修改名称
    -a # 添加附属用户组
```

有时候在使用 `useradd name` 时会忘了添加用户目录，想用 `usermod -d /home/name -m name` 补上，其实这样是无效的，该命令只有在新指定的 home 目录和 `/etc/pssswd` 下的不一致才会生效，`useradd name` 默认是在 `/etc/passwd` 配置的就是 `/home/name`。所以要生效，可以改为 `usermod -d /home/name1 name` 即可。

更改用户名输入 `usermod -l new-name old-name` 即可。注意，改名会更改配套的配置，例如用户 home 目录的属性，实际文件夹的名字是没改的。

还有新增的命令 `-a`，根据之前的命令 `useradd -G groupA,groupB carl` 设置用户的附属用户组，`usermod -G` 也能达到相同的效果，但是有时候需要的是在旧的基础上，新增一个组 groupC，就可以使用 `usermod -a groupC`。

### 用户组的管理

* groupadd 添加用户组

```shell
    -g # 指定 id 创建用户组
```

使用较为简单，`groupadd -g 9527 newgroup` 新增一个组 id 为 9527，名称是 newgroup

* groupmod 修改用户组

```shell
    -n # 改名
```

用法同 `usermod`

* groupdel 删除用户组

```shell
    -f # 强制删除，及时是用户的主要组 ???
```

* newgrp 切换用户组

直接使用 `newgrp groupA` 切换到所属的其他用户组 groupA



[Tmux 使用](https://zhuanlan.zhihu.com/p/137715607)
