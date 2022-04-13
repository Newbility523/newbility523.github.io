

## Texture Packer 

### 安装，破解

记录下 Texture Packer 的安装过程，维持破解也需要一些手段，备忘。因为这部分说明可能会面向美术同学，所以大部分操作会补充操作示意图。

1. 替换
2. 进站出站屏蔽
3. Path 添加
4. 失败清理

压缩包内包含 32 位和 64 位系统的版本，以下用 64 位版本进行说明。**没执行完所有步骤，都不要打开 Texture Packer**。



#### 安装

1. 解压`TexturePacker_4.9.0_x64.rar`后打开，运行安装包`TexturePacker-4.9.0-x64.msi`。完成后，不要打开。

2. 复制`Fix x64`下的两个文件，替换掉安装目录下的，即`C:\Program Files\CodeAndWeb\TexturePacker\bin`

   

#### 断网屏蔽

网上的破解在上一步已经完成，但是实际情况是会在使用过程中，Texture Packer 重新提示购买弹窗，或者甚至直接报错闪退。经过测试，是因为 Texture Packer 联网导致的，使用这个工具的都没有联网需求，所以直接对 Texture Packer 进行网络屏蔽。

[**如果你已经提示购买窗口，要卸载软件，清理后重新从头破解。**](#卸载重试)

![image-20220413193401523](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220413193401523.png)

![image-20220413193857630](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220413193857630.png)

![image-20220413193937424](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220413193937424.png)

![image-20220413193955050](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220413193955050.png)

![image-20220413194031751](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220413194031751.png)

以上例子是对`TexturePacker.exe`进行的入站进行屏蔽，出站也需要这样的配置（出站的配置就在入站的旁边），完成后还要对`TexturePackerGUI.exe`也再来一套一摸一样的屏蔽。（一共四个配置）



**至此，Texture Packer 的破解才算完成，可以打开 Texture Packer 进行使用了。**



#### Path 添加

为了使用方便，最好把 Texture Packer 添加进系统 Path 中。右键`我的电脑`→`属性`

![image-20220413195017662](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220413195017662.png)

![image-20220413195138803](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220413195138803.png)

在命令行终端测试以下，输入`TexturePacker` 如果有输出使用说明，就算完成。



#### 卸载重试

如果因为某种原有破解失败，就需要先卸载，并进行清理注册表后再按步骤进行。

![image-20220413195600465](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220413195600465.png)

右键选择卸载。

清理注册表则需要安装 360 安全卫士，选择清理注册表即可。

