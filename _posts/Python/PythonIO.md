记录常用的文件操作，读写，压缩

用到的会有 os

shutil.rmtree(os.path.join(root, item))
        for item in files:
            os.remove(os.path.join(root, item))



shutil.copy

​	同名文件会覆盖

依赖副文件夹

同文件复制报错

|   方法   |                            Des                            |   SrcStr    |   DesStr    | NeedExist | IncludeMeta | Replace |
| :------: | :-------------------------------------------------------: | :---------: | :---------: | :-------: | :---------: | :-----: |
|   copy   |                           复制                            |    File     | File or Dir |    Yes    |     No      |   Yes   |
|  copy2   | 复制文件包括原数据，等同于`shutil.copy + shutil.copystat` |    File     | File or Dir |    Yes    |     Yes     |   Yes   |
| copyFile |                        仅文件内容                         |    File     |    File     |    Yes    |     No      |   No    |
| copymode |                        复制权限位                         | File or Dir | File or Dir |    Yes    |     No      |  None   |
| copystat |          复制权限位，最后访问时间，最后修改时间           | File or Dir | File or Dir |    Yes    |     No      |  None   |
|          |                                                           |             |             |           |             |         |
|          |                                                           |             |             |           |             |         |
|          |                                                           |             |             |           |             |         |

移动

#### shutil.move(src, des)

移动文件到目标路径或文件夹，包含改名功能，目标为目录，则必须是存在的。

移动文件夹到目标途径，并把最后一个名字为作为新目录的名字，如果目标目录不存在则创建。



文件夹复制

#### shutil.copytree(srcDir, desDir, ignore)

复制目录，并把最后一个名字为作为新目录的名字

srcDir 必须为存在的目录，desDir 若为不存在的目录则创建，ignore 回调可选择忽略怎样的文件。



文件夹创建

#### os.mkdir / os.mkdirs

复制文件夹，mkdir 要求目录的上一级必须已存在，mkdirs 则不要求，并且可以创建多级目录。所以没什么理由使用 mkdir。



### 移除文件夹

#### os.rmdir() 移除空文件夹

#### os.removedirs() 等于逐级向上调用 os.rmdir

#### shutil.rmtree() 全部移除文件夹，可设置 ignore_errors 忽略文件夹不存在的报错（任何报错都行）



### 移除文件

#### os.remove()



### 目录遍历

#### os.walk(top, topdown=True, onerror=None, followlinks=False)

- top 顶目录
- topdown 是否自上而下
- onerror 用于接收异常处理
- followlinks 是否对链接文件夹遍历

遍历不包括`.`, `..`, `.DS_Store`(Mac os 下会存在的特殊隐藏目录)，dirs, files 无序，dirs 的递进遍历也无序。



#### os.listdir(top)

- top 顶目录

返回 top 下的文件和目录，不包括子目录,`.`, `..`, 但包括`.DS_Store`，无序



如果需要有序遍历，只能自己实现



汇总

copyTo

copyFilesTo

ensureDir

ensureFile



文件读写



压缩



JSON