<p align="center">
<img src="https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/psd/logo/logo.svg">
</p>

<p align="center">
<img alt="npm" src="https://img.shields.io/npm/v/http-plug?color=eeb930&logo=npm&style=flat-square">
<a href="https://www.npmjs.com/package/http-plug">
<img alt="npm" src="https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/psd/tab/size.svg">
<img alt="npm bundle size" src="https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/psd/tab/ver.svg">

</a>

<a href="#03.桌面客户端">

<img alt="node-current" src="https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/psd/tab/platform.svg">
</a>
</p>


<p align="center">
<img src="https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/psd/http-plug-newui.png">
</p>



<h1>http-plug</h1>

<h3 >基于node实现的无依赖http静态服务器。</h3>

- [x] 文件改动时html页面会实时刷新
- [x] 非常迷你, 无依赖, 30KB不到
- [x] 全局命令, 哪里需要点哪里
- [ ] 可设置账户登录
- [ ] 搜索文件

---
### 介绍

&emsp; &emsp; 一开始我使用[xammp](https://www.apachefriends.org/)里的web server做静态服务器，需求很简单，就是偶尔调试下html。首先我得先把文件拷贝到web server指定的目录下才能访问，虽然可以设置路径，但还是觉得麻烦。

        

&emsp; &emsp; 难道就没有一个可以非常便捷的在任意目录下创建静态服务器的工具吗？

&emsp; &emsp; 就像一个插头🔌, 插上马上就能用。
> 有啊，[light-server](https://www.npmjs.com/package/light-server) 😒2020-08-08

&emsp; &emsp; 接着我本着尽可能简单的原则，只使用node自带模块来开发这个工具


 

# 安装

[01.模块安装](#01.模块安装)

[02.单文件运行](#02.单文件运行)

[03.桌面客户端](#03.桌面客户端)

## 01.模块安装

### 全局安装(🚀推荐)

全局环境下安装 `plug` 命令，安装完成之后，我们就可以在任何地方执行 `plug` 命令了
``` 
npm i http-plug -g
```

> 我的实际输入(macOS)：sudo [cnpm](https://developer.aliyun.com/mirror/NPM?from=tnpm) i http-plug -g

进入任意文件夹下输入

``` 
cd <任意文件夹>
plug
```

即可在这个文件夹下创建http-plug

使用 `-h`  `-H`  `-help` 获取更多使用帮助

```shell
plug -h
```

可用的命令 
```javascript
plug                    打开http-plug(默认端口9527)
plug 8888               使用8888端口打开（失败后则重新随机分配可用端口）
plug -l | -L            打印日志 
plug 8888 -l | -L       指定端口并打印日志 
plug -v | -V            查看版本
plug -h | -H            帮助
```

<img width="600" src="https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/psd/http-plug-demo.gif">


### 局部安装

进入项目文件夹输入

``` 
npm i http-plug --save-dev
```

接着使用node自带的 `npx` 启动，获取帮助信息可输入 `npx http-plug -v` 

``` 
npx http-plug
```

## 02.单文件运行

得益于只使用node原生模块，提供了更多的灵活性

下载[主文件http-plug. js](https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/http-plug.js)文件，放置项目根目录，接着cd这个项目输入下面即可

``` 
node http-plug.js
```

## 03.桌面客户端
使用[pkg](https://github.com/vercel/pkg)生成。
软件所在的根目录即为服务器的根目录。

> pkg把整个node都打包了，虽然是用了8.0版本的node，但还是很大😒。
> 试试用[sciter-js-sdk](https://github.com/c-smile/sciter-js-sdk)打包 -2020-10-27

[下载 windows7/10(21.8 MB)](https://github.com/renzhezhilu/http-plug/releases/download/0.2.9/http-plug-win.exe)

[下载 macOS(33.7 MB)](https://github.com/renzhezhilu/http-plug/releases/download/0.2.9/http-plug-macos)

[下载 linux(32.7 MB)](https://github.com/renzhezhilu/http-plug/releases/download/0.2.9/http-plug-linux))

<!-- # 文件说明
```
|_ doc/         文档记录
|_ html/        html模版
|_ npm/         npm模块
|_ pkg/         桌面客户端
|_ psd/         相关设计
|_ test/        乱七八糟的测试
|_ .gitignore   
|_ http-plug.js 主文件
|_ readme.md

``` -->

# 使用
### 界面说明
<p align="center">
<img src="https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/psd/http-plug-UI-what.png">
</p>

### 命令行

<p align="center">
<img src="https://cdn.jsdelivr.net/gh/renzhezhilu/http-plug/psd/shell.png">
</p>

# 安全性
http-plug本意是用来开发时调试使用，避免用在生产环境。

# end
