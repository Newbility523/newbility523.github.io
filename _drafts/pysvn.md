# PythonSVN 使用说明

为了统一多平台的打包体验，以及提高打包脚本的可维护性和复用，旧项目使用的 

* Window cmd

* Mac bash

将统一为 bash + python 的方式（Window 下使用 git-bash）。

同时，一般情况下 python 要与 svn 交互，需要调用 bash 指令执行 svn 命令，再对输出进行处理。如

```shell
# sh Example-1: 获取版本号
svn cleanup $luapath
nowReviewNum=`svn up $luapath | grep "revision" |  grep -o "[0-9]\+"`

# sh Example-2: 提交本地所有文件
cd %PRODUCTION_RES_PATH%\win 
svn add . --force 
for /f "usebackq tokens=2*" %%i in (`svn status ^| findstr /r "^\!"`) do svn delete --force "%%i %%j" 
svn commit -m "auto commit the resources win assets " 
echo "win resources assets commit Ok." 
```

*以上例子来自  bash 脚本，因为旧项目没有 python 调用 svn 的例子。实际如果在 python 上处理，会比上述的例子更麻烦，因为要需要处理子进程交互。*

PythonSVN 的目的就是替用户处理烦人的 bash 交互和一系列字符串处理，让用户无需深入学习 svn 的命令，也能以直观的方式控制 svn，并且提供更方便的预设处理。一些使用例子：

```python
# Example-1: 获取版本号
base_revision = svn.revision("base", once_cwd=os.path.join(source_path, "LuaScript"))

# Example-2: 提交本地所有文件
svn.set_cwd(output_path)
svn.commit_replace("lua script update auto")
```

PythonSVN 的设计出发点是接口化常用的 SVN 的功能，而不是完全实现 svn 功能。例如在冲突处理和提交方面，会提供简易的处理，但更主要的根据特定的使用场景给出解决方案。并且抹去平台差异性，路径格式统一。

**依赖**

* Python  3.9.10
* SVN
* ~~Git-bash（For Window）~~

安装 [TortoiseSVN](https://tortoisesvn.net/downloads.html) 时，记得勾选 svn command line tool，即使忘了也可以重新安装包程序，添加这部分功能。

~~Git-bash 可以通过安装 [Git](https://git-scm.com/)，勾选 git-bash 安装，记得勾选作为 bash 的默认程序。~~

### Why PythonSVN



## Sample

一个更完整的使用例子

```python
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from PythonSVN import svn

if __name__ == '__main__':
    project = "./project"
    
    # 在使用进行 svn 操作前，需要设置工作目录，就和 TortoiseSVN 右键文件夹一样。
    # 后续的操作都会在该目录下进行
    svn.set_cwd(project)
    # 对 ./project 更新
    svn.update()
    
    # 输出当前目录状态，包含冲突情况、增删修改情况。
    print(svn.collect_status_info())
```

使用 PythonSVN 流程非常简单，

1. 将 PythonSVN 导入到你的脚本内
2. 设置工作目录
3. 执行 svn 命令。

设置工作目录有两种形式

##### 全局设置

```python
set_cwd(cwd_str: str)
```

之后所有操作，如没有特殊指代，都会再这个目录下进行

##### 特殊指定

```python
svn.diff(cache_base_revision, cur_base_revision, once_cwd=os.path.join(source_path, "LuaScript"))
```

PythonSVN 的接口允许通过`once_cwd`特指本次指令执行的路径，使用的接口如果内部使用了其他接口，也会再指定的路径下执行。后续未指定`once_cwd`的都会使用`set_cwd`下的路径。*（目前不是所有操作都支持once_cwd，使用的时候请留意接口声明）*

**注意：无论 PythonSVN 接口是否提供 once_cwd，都应该确保已经 set_cwd**



## 接口

现在对 PythonSVN 的接口进行说明，不再复述导入和设置工作目录这些前置工作。

### 更新

#### update

```python
update(files=None) 
```

对目录进行更新，也可以指定更新的文件，文件集合或者指定目录。同时对工作区执行 svn 的 cleanup，cleanup 可以将 svn 锁清空。

```python
# 整体更新
files = None
# 单个文件
files = "./foo.txt"
# 文件集合 1 (多个文件名中间空格区分)
files = "./foo1.txt ./foo2.txt"
# 文件集合 2
files = ["./foo1.txt", "./foo2.txt"]
# 目录
files = "./abc"
update(files)
```



### 版本信息

#### revision 版本

```python
revision(target, once_cwd=None) -> int
```

target 可选

* base 当前目录的版本
* head 当前目录的最新版本

*target不区分大小写*

#### repos_url 版本库的 URL

```
repos_url() -> str
```



### 目录状态

#### collect_status_info

```python
collect_status_info() -> dict
```

返回 dict 记录当前目录的状态，目前支持一下几种，除了 conflict 均为列表

* conflict
  * tree 数冲突
  * txt 文本冲突
* missing 丢失，即未被确认删除
* unversion 新增，即未被确认添加版本库
* remove 被确认删除
* add 被确认添加
* modify 自己修改的

使用这个接口，可以很简单获得每种状态的文件。例如输出所有移除的文件:

```python
info = svn.collect_status_info()
for item in info["remove"]:
	print(item)
```



### 冲突处理

在进行任何自动化操作前，都应该确保本地没有冲突。

有必要提醒，一般情况下，需要 update 后才会知道是否存在冲突，这步 update 的操作是需要用户手动执行的。

#### resolve_conflict_prefer

```python
resolve_conflict_prefer(accept=ACCEPT_THEIRS_FULL, files=None)
```

这个接口提供的功能很基础，对指定文件进行冲突处理，`accept`可以选择对于冲突的处理方式。`files`可以参考 [Update 命令](#更新)

| accept                 | 说明                                 |
| ---------------------- | ------------------------------------ |
| ACCEPT_BASE            | 对冲突部分使用当前工作区版本库的内容 |
| ACCEPT_WORKING         | 对冲突部分当前工作区版本库的内容     |
| ACCEPT_MINE_CONFLICT   | 对于**冲突部分**，使用自身的修改     |
| ACCEPT_THEIRS_CONFLICT | 对于**冲突部分**，使用他人的修改     |
| ACCEPT_MINE_FULL       | 对于冲突，完全以我为准               |
| ACCEPT_THEIRS_FULL     | 对于冲突，完全以他人为准             |

不推荐使用`resolve_conflict_prefer`，因为不同的冲突 svn 能接受的选项是不同的，例如树冲突无法使用 `ACCEPT_THEIRS_CONFLICT` 选项，而`resolve_conflict_prefer`只是单纯的传递参数给 svn。所以，除非对 svn 命令行有一定了解，或者在确保当前没有树冲突，不然不推荐使用。

以下开始介绍处理冲突的方案接口，它们会确保完成他们的功能（至少设计之初是这样要求的）。执行完毕后会重新检测本地冲突，仅有在**冲突完全解决**的情况下，你的后续代码才会被执行，否则会立刻退出程序。如果出现，请进入工作区手动处理冲突，**或将本工具未覆盖的用例情况完善，salute**。

#### resolve_conflict_auto

```python
resolve_conflict_auto()
```

解决本地所有冲突，对于所有冲突情况，采用都他人的修改。

适用于打包机，Unity 打包机需要对资源的 Assetbundle Name 进行修改。如果每次重新设置，打包耗时会非常高。所以打包机需要尽可能的保留本地修改，但是对于有冲突的文件，完全使用他人的修改，部分重新设置可以接受的。



### 提交

svn 提交必须带上提交记录的。

#### commit

```python
commit(msg=None, once_cwd=None, files=None)
```

对目录下**已确认**的文件提交，如果`files`包含了非确定的文件，这部分文件会提交失败，但不影响流程。

确定的状态有：

* [A] Add 添加
* [D] Remove 移除
* [M] Modify 修改

不确定的状态有：

* [!] Missing 丢失
* [?] Unversion 非版本库文件

`files`包含的如果不是绝对路径，则必须是工作目录下的相对路径。

#### commit_files

```python
commit_files(msg=None, once_cwd=None, files=None)
```

强制提交文件，保证这些文件会被提交，且完全是本地的内容，[参数说明同上](#commit)

#### commit_replace

```python
commit_replace(msg=None, once_cwd=None)
```

强制提交文件夹，保证文件夹会被提交，且完全是本地的内容。

`commit_files`和`commit_replace`非常适用于自动化构建的产出提交，这些文件都是需要的，且必须以本地的为准。



### 还原 / 清空

#### revert

```python
revert()
```

清理清理工作区，还原工作区所有修改，递归

#### clean_unversioned

```python
clean_unversioned()
```

清理清理工作区，移除所有版本外内容



### 对比

#### diff

```python
diff(r_from="base", r_to="head", once_cwd=None) -> dict
```

可以获取两个版本间的差异文件，返回的是差异数组字典

dict

* modify 修改
* add 添加
* remove 移除

`r_from`和`r_to`除了支持字符串 base（当前工作区） 和 head（最新版本库），还支持数字。所以一下写法都是支持的。

```python
result = svn.diff("base", 123, once_cwd=os.path.join(source_path, "LuaScript"))
result = svn.diff(100, "102", once_cwd=os.path.join(source_path, "LuaScript"))
print(result)
```



### 账号密码

#### identify

```python
identify(user_name: str, password: str)
```

默认情况下，PythonSVN 账号密码使用的是当前系统缓存的数据，如果需要修改，可以使用以上接口。



### Advanced

#### run_svn_cmd

```python
run_svn_cmd(svn_command: str) -> (outStr, stderr, returnCode)
```

以上的所有命令内部都是由`run_svn_cmd`处理。如果有 PythonSVN 未包含的内容，可以使用该接口直接调用 svn 命令，就像在终端一样，会返回的是包含标准输出，标准错误和调用svn命令状态码元组。使用时需要提前设置`set_cwd`。



## 常见问题

### Window 乱码问题

控制面板 -> 时钟和区域 -> 区域 -> 管理 -> 修改系统区域设置，**不要勾选**使用 Unicode UTF-8

![image-20220228215237465](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220228215237465.png)



## Todo

- [ ] 信息功能补充
- [ ] checkout
- [ ] commit 目录非版本库
- [ ] 指定 bash 程序路径

