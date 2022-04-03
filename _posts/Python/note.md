在 python 脚本头，备注

对于 mac 和 win 是一致的

```python
#! /usr/bin/env python3
```

修改权限

```shell
$ chmod +x hello.py
```

就可以将此脚本当作程序运行

文件头添加，指明用 python3 运行

```python
#!/usr/bin/python3 
```



``c = a // b``含义为 a 除以 b，并去除小数精度。但结果不一定是整数，以分母分子的类型决定。

```python
c = 11 // 2
# c = 5
c = 11.0 // 2
# c = 5.0
```





问题：

pycharm 内的 venv 在发布后如何使用

venv 的 #! 不能使用相对路径

指定 python 的版本还有什么方法



优化 shell 中的输出显示，而不是一行行输出 https://blog.csdn.net/shida_csdn/article/details/106804077

优化stdout 输出流处理，目前只会一次性读取处理，后期可能会卡



复制文件方法对比

![image-20220217114204487](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220217114204487.png)

```
# 不包括元数据
shutil.copy(os.path.join(root, file), new_file_path)
# 包括元素据
shutil.copy2(os.path.join(root, file), new_file_path)
```



md5 是计算文件内容的校验码，对于**内容**一致的文件，例如复制粘贴，md5 会保持一致。但是 zip 特殊，它的内容就是文件的集合，也就会包含文件的 metedate 元数据。

元数据有



在计算 zip 文件 md5 的时候，可能会因为 **zip 内** 文件的元数据变动，导致文件 zip md5 不一致，所以有必要在复制文件的时候，保证元数据一致，即用 `copy2`。

但是有一点问题，在项目中版本控制软件，如 svn 中是不会同步元数据的，也就是说在同一台 pc 中，重新 checkout，压缩后文件的 zip md5 还是会不一致。但目前项目中的任务不会跨 pc 处理，暂不考虑。



shutil.copytree 复制目录

如果目标目录相当于新名字，如果父路径不存在，会顺便创建。dirs_exist_ok = false 的话，如果目标目录已存在，会报错。

**对于已存在目录的文件，不会移除**



可视化图标使用准则

https://next.startdt.com/charts/column.html
