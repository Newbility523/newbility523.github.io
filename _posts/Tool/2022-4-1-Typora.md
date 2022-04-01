[快捷键](https://support.typora.io/Shortcut-Keys/)

图床设置

使用 PicGo-Core (command line)

先安装 npm

https://nodejs.org/en/download/

```
# 
npm install picgo -g
# 确认安装
picgo -v
# picgo 安装插件
picgo install github-plus
```

配置

```json
{
  "picBed": {
    "uploader": "githubPlus",
    "current": "githubPlus",
    "githubPlus": {
      "branch": "main",
      "customUrl": "https://cdn.jsdelivr.net/gh/Newbility523/PicBed",
      "origin": "github",
      "repo": "Newbility523/PicBed",
      "path": "imgs",
      "token": "存在云端"
    }
  },
  "picgoPlugins": {
    "picgo-plugin-github-plus": true
  },
  "picgo-plugin-github-plus": {
    "lastSync": ""
  }
}
```

