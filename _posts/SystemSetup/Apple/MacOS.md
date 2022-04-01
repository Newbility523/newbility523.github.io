# MacOS 下系统操作

## 安装包管理器

### Homebrew

[Homebrew](https://brew.sh/) 是 Mac 下的软件包管理器，安装官网说法，终端执行以下指令即可安装 Homebrew。

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

该命令会根据当前芯片类型选择安装的版本，路径也有所不同。

* Intal: `/usr/local/homebrew/`
* M1(ARM): `/opt/homebrew/`

如果是 M1，安装的 Homebrew 并不在默认的 Path 中，但是以上的指令最后会贴心的补充说明，并提供修改的指令，复制执行即可。

安装回依赖 git(系统自带)， 过程肯能会因为国内访问 git 连接不畅通导致中断，在安装了 VPN 后，可以设置 git 的代理改善网络条件。

### Homebrew 使用

终端内输入 **brew** 使用

```shell
# 搜索软件
brew search appName
# 查看软件详细信息，包括库里的信息，以及本地安装情况
brew info appName
# 安装
brew install appName
# 卸载
brew uninstall appName
# 检查 brew 配置
brew doctor
```

默认情况下 brew 安装软件的目录`/opt/homebrew/bin`也是不在 Path 中的，需要设置。

```

```



## Path 路径设置

在安装了某些应用后，可能会出现在终端中无法直接调用的情况，例如  ` zsh: command not found: cmake`

解决是将软件路径添加进 Path 中，有两种方式（以 Cmake 为例）：

* 临时修改 Path，当此终端关闭时失效。

  在终端中输入

  ````bash
  export PATH=/Applications/CMake.app/Contents/bin:$PATH
  ````

* 为当前用户修改 Path，一直有效

  要确认自己使用的是什么 shell，bash，还是 zsh，我所使用的 MacOS Big sur 默认是 zsh。

  在自己所在用户目录编辑 bash_profile 即 `~/.bash_profile`。如果没有则创建

  ``` bash
  # open / create and edit config file
  vim ~/.bash_profile
  # append
  export CMAKE_ROOT=/Applications/CMake.app/Contents/bin/
  export PATH=$CMAKE_ROOT:$PATH
  # save and exit
  :wp
  # make change work
  source ~/.bash_profile
  
  # if you are using zsh, you shoule edit .zshrc which is zsh config file.
  vim ~/.zshrc
  # append
  source ~/.bash_profile
  # save and exit
  :wp
  # make change work
  source ~/.zshrc
  ```

从这里也能看出同 Linux 不太一样的是，可执行文件路径是在`/Applications/appName.app/Contents/bin`下的

