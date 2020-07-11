<p align="center">
<img src=". /psd/logo. png">
<img src=". /psd/http-plug-UI02. png">
</p>

<p align="center">
<a href="https://www.npmjs.com/package/http-plug" target="_blank"><img src="https://img.shields.io/bundlephobia/min/http-plug?style=for-the-badge"></a>
<a href="https://www.npmjs.com/package/http-plug" target="_blank"><img src="https://img.shields.io/npm/v/http-plug?style=for-the-badge"></a>
<img src="https://img.shields.io/npm/l/http-plug?style=for-the-badge">
</p>

<h1 align="center">http-plug</h1>

<h3 align="center">基于node实现的无依赖http静态服务器。</h3>

### 介绍

&emsp; &emsp; 一开始我使用[xammp](https://www.apachefriends.org/)里的web server做静态服务器，需求很简单，就是偶尔调试下html。首先我得先把文件拷贝到web server指定的目录下才能访问，虽然可以设置路径，但还是觉得麻烦。

        

&emsp; &emsp; 难道就没有一个可以非常便捷的在任意目录下创建静态服务器的工具吗？

&emsp; &emsp; 就像一个插头🔌, 插上马上就能用。

&emsp; &emsp; 接着我本着尽可能简单的原则，只使用node自带模块来开发这个工具

### http-plug有以下几点优势。

* [x] 非常迷你, 无依赖, 30KB不到
* [x] 全局命令, 哪里需要点哪里
* [ ] html页面改动实时刷新

 

# 安装

[01. 模块安装](#01. 模块安装)

[02. 单文件运行](#02. 单文件运行)

[03. 桌面客户端](#03. 桌面客户端)

## 01. 模块安装

#### 全局安装(推荐)


<img src="./psd/http-plug-demo. gif">

``` 
npm i http-plug -g
```

> 我的实际输入：sudo [cnpm](https://developer.aliyun.com/mirror/NPM?from=tnpm) i http-plug -g

进入任意文件夹下输入

``` 
plug
```

即可在这个文件夹下创建http-plug

使用 `-h`  `-H`  `-help` 获取更多使用帮助

``` 
plug -h
```

#### 局部安装

进入项目文件夹输入

``` 
npm i http-plug --save-dev
```

接着使用node自带的 `npx` 启动，获取帮助信息可输入 `npx http-plug -v` 

``` 
npx http-plug
```

## 02. 单文件运行

得益于只使用node原生模块，提供了更多的灵活性

下载主文件[http-plug. js](https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/http-plug.js)文件，放置项目根目录，接着cd这个项目输入下面即可

``` 
node http-plug.js
```

## 03. 桌面客户端
使用[pkg](https://github.com/vercel/pkg)-node8生成。
软件所在的根目录即为服务器的根目录。

> 把整个node都打包了，虽然是用了8.0版本的node，但还是很大。

[下载 windows7/10(23.8MB)](https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/pkg/dist/http-plug-win.exe)

[下载 macOS(35.8MB)](https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/pkg/dist/http-plug-macos)

[下载 linux(34.8MB)](https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/pkg/dist/http-plug-linux)
