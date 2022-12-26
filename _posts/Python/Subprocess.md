再window下尝试使用 gitbash 运行指令，如下，会失败

```python
pipe = subprocess.Popen(
	"ls",
	#"",即使传递空的命令
    shell=True,
    executable="C:/Program Files/Git/bin/bash.exe",
    stdout=subprocess.PIPE,
)
```

输出

![image-20220210173132779](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220210173132779.png)

如果修改为

```python
pipe = subprocess.Popen(
	"\"C:/Program Files/Git/bin/bash.exe\" -c \"svn\"",
    shell=False,
    stdout=subprocess.PIPE,
)
```

可以运行，但是很别扭。

如果不加`-c`

```python
pipe = subprocess.Popen(
    "\"C:/Program Files/Git/bin/bash.exe\" \"grep\"",
    shell = False,
    stdout = subprocess.PIPE,
)
```

会报错，即使指定完整的路径

![image-20220210173611886](https://cdn.jsdelivr.net/gh/Newbility523/PicBed/imgs/image-20220210173611886.png)



shell = True 还是 False

官方推荐使用 False，但是使用 shell 是最接近平时终端处理体验的，就我而言是偏向 shell = True，但是会有几个问题

####  shell = True

##### 优势

和终端界面一致的体验

支持命令多

全局变量替换方便

可指定 shell，让 window 获得 linux 一致的命令行工具和规则

##### 缺点

完整的子进程控制需要额外的处理

window 不支持指定shell？

会有漏洞风险

不支持 | 

####  shell = False

z



处理方式：



进程交互、控制

returncode 用于获取指令的完成状态，None 表明仍在运行，communicate 可以刷新 returncode 的状态。



更完善的处理，communicate 可以对子进程进行限时处理，超时将抛出异常（并不终止），在异常处理中可以对子进程进行继续等待，或者杀掉。再次调用 communicate 并不会丢失 stdout，stderr 的内容。

```python
c1, c2 = None, None
try:
    c1, c2 = pipe.communicate(timeout=5)
except subprocess.TimeoutExpired:
    pipe.kill()
finally:
    c1, c2 = pipe.communicate()
    win = platform.system() == "Windows"
    # print(c1.decode(encoding=("gbk" if win else "utf8")))
```

注意：当 shell = true，在对子进程进行控制时，直接 kill 或 terminate 等操作都是无效的，因为Popen一般都是带指令的，Popen 的流程是先开 shell，再用 shell 执行指令。所以 kill 会作用 shell，而不是实际的指令。



最终整合

```python
def run_cmd(cmd_str, timeout=None, cwd=None, reallog=True):
   	print(f"running cmd:{cmd_str}")
    pipe = subprocess.Popen(
        # shlex.split 可以统一平台正确识别路径
        shlex.split(cmd_str),
        shell=False,
        stdout=subprocess.PIPE,
        cwd=cwd,
        # ironPython 只支持 Py3.4，对于 text = True 的情况 3.4 会报错
        # 使用该选项可以省掉后面的解码
        # text=True,
    )

    is_win = platform.system() == "Windows"
    encoding = "gbk" if is_win else "utf8"
    # real log 执行会导致 stdout 在下方无法获取数据
    # if reallog:
    #     for info in iter(pipe.stdout.readline, b''):
    #         print(str(info, encoding=encoding).strip())

    out_str, std_err, return_code = None, None, 0
    stdout, stderr = pipe.communicate(timeout=timeout)
    return_code = pipe.returncode
    if stdout is not None:
        out_str = stdout.decode(encoding=encoding)
    if stderr is not None:
        std_err = stderr.decode(encoding=encoding)

    print("cmd result:", return_code)
    return out_str, std_err, return_code
```





