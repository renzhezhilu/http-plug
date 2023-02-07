
### 用[pkg](https://github.com/vercel/pkg)打包成macOS、linux、windows的可执行文件
#### 01.全局安装[pkg](https://github.com/vercel/pkg)
```
npm install -g pkg
```
macOS下我这样
```
sudo cnpm install -g pkg
```
#### 02.打包
终端进入..../http-plug/pkg，输入如下执行
```
pkg -t node8-mac,node8-win,node8-linux --out-path=./dist/ ../http-plug.js
//
pkg -t node8-mac --out-path=./dist/ ../http-plug.js

pkg -t node14-win-x64-emulation --out-path=./dist/ ../http-plug.js

pkg -t node12-linux,node14-linux,node14-win --out-path=./dist/ ../http-plug.js
```
#### 03.dist新增三个可执行文件
    http-plug-linux
    http-plug-macos
    http-plug-win.exe

#### end！