# 系统参数

https://code.visualstudio.com/docs/editor/variables-reference
https://jeasonstudio.gitbooks.io/vscode-cn-doc/content/md/编辑器/任务.htm


## 配置

相对行号 File -> Preference -> Setting -> Search : editor.lineNumbers

显示空白符号 File -> Preference -> Setting -> Search : editor.Render Whitespace

Tab 转空格 File -> Preference -> Setting -> Search : editor.Tab Size

## 报错解决

### C++

生成文件突然出现 .dll 缺失，很可能是系统 path 被覆盖或者修改了，重新加上 ``mingw64/bin`` 即可。

如果出现上诉情况，很可能连 GDB 的调试也会出问题，问题原因是一致的，找不到相应的 dll，但这个提示没法像直接运行 exe 那种有弹框提示，并且即使改了path 也不一定有用。需要在 launch.json 中追加
``` json
"environment": [
    {
        "name": "PATH",
        "value": "%PATH%;C:\\mingw64\\bin"
    }
],
```



vscode 插件开发

https://www.cnblogs.com/liuxianan/p/vscode-plugin-overview.html