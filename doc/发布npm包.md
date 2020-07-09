
模块地址：
https://www.npmjs.com/package/http-plug


## 01. 准备

#### 清空/npm/下的文件

``` 
rm npm/*
```

### 复制package. json和http-plug. js到npm里

``` 
cp package.json http-plug.js npm
```

### 进入npm

``` 
cd npm
```

## 02. 检查npm源

#### 查看当前源

``` 
npm config get registry
```
> https://registry.npm.taobao.org/

或

``` 
open ~/.npmrc
```

#### 发布前临时修改源, 不影响cnpm的使用

``` 
npm config set registry http://registry.npmjs.org/
```
> 缺点：每次更新都要npm login重新登录

#### 可能发生的错误，搞错源

``` 
npm ERR! publish Failed PUT 403
npm ERR! code E403
npm ERR! no_perms Private mode enable, only admin can publish this module:
```

出现原因：使用的是淘宝源cnpm, 登陆到的是cnpm

解决方法：切换到npmjs的网址，代码如下

``` 
npm config set registry http://registry.npmjs.org/
```

## 03. 登陆发布更新

#### 第一次登陆时

``` 
npm adduser
```

#### 正常登陆

``` 
npm login
```
> Logged in as username on http://registry.npmjs.org/.
#### 进入项目文件夹上传发布

``` 
npm publish
```

### 更新

修改package. json版本字段version

``` 
npm publish
```

### 检查是否npm源是否更新

https://r.cnpmjs.org/http-plug
http://registry.npmjs.org/http-plug

## 04. 测试

#### 全局安装

``` 
sudo npm i http-plug -g
```

安装完后可全局命令 `plug` 

#### 运行

随意进入某个文件夹下，输入 `plug 8833` 8833为端口号，选填，默认9527

``` 
plug 8964
```

```
输入后自动打开浏览器
``` 

## end！
