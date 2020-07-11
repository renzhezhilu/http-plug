#!/usr/bin/env node
 // ⬆️ 指定文件由node执行，全局命令用
/******************************************
系统模块
*******************************************/
const http = require("http");
const path = require("path");
const fs = require("fs");
const net = require('net')
var os = require('os');


/******************************************
配置
*******************************************/
//用户自定义端口
let version = 'v0.2.4'
let host = '0.0.0.0' //localhost
let port = 6222 // 端口
let updateShowType = true // 更新时间是否显示‘前’
let isLog = true // 是否打印访问日志
let isPkg = false // 当前模式是否pkg打包

// 命令行
processReturn()

//过滤不必要文件
const filterFiles = function(files) {
    let noNeed = [
        '.DS_Store',
        '.git',
        // '.gitignore'
    ]
    return files.filter(f => !noNeed.includes(f))
}
//解析文件类型
const fileTyle = function() {
    return {
        // 文本
        html: 'text/html;charset=utf-8',
        htm: 'text/html;charset=utf-8',
        js: "application/javascript;charset=utf-8",
        json: "application/json;charset=utf-8",
        css: "text/css;charset=utf-8",
        md: "text/markdown;charset=utf-8",
        txt: "text/plain;charset=utf-8",
        xml: "text/xml;charset=utf-8",
        // 图片
        png: "image/png",
        webp: "image/webp",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        ico: "image/x-icon",
        svg: "image/svg+xml",
        // 媒体
        mp3: "audio/mpeg",
        mp4: "video/mp4",
        // 文件
        zip: "application/zip",
        tif: "image/tiff",
        ttf: "font/ttf",
        woff: "font/woff",
        woff2: "font/woff2",
    }
}
// 欢迎
const welcome = function() {
    return `
 _______________________________________________
|           __  __  ______  ______  ______      |
|          / /_/ / /_  __/ /_  __/ / __  /      |
|         / __  /   / /     / /   / /_/_/       |
|        /_/ /_/   /_/     /_/   /_/            |
|          ______  __      __  __  ______       |
|         / __  / / /     / / / / / ____/       |
|        / /_/_/ / /___  / /_/ / / /__/ /       |
|       /_/     /_____/ /_____/ /______/        |
|                                               |
|                   ${version}                      |
|   https://github.com/renzhezhilu/http-plug    |
|_______________________________________________|

`
}

/******************************************
方法
// console.log('__filename:', __filename);
// console.log('__dirname:', __dirname);
// console.log('process.cwd():', process.cwd());
// console.log('process.execPath:', process.execPath);
*******************************************/
//获取url信息
const splitFileInfo = (url) => {
    let filePath
    //process.execPath 在pkg和本级node输出一致，其他__dirname之类的不行
    let execPath = process.execPath
    switch (isPkg) {
        // pkg 打包时
        case true:
            execPath = execPath.split(path.sep)
            execPath.pop()
            execPath = execPath.join(path.sep)
            filePath = `${execPath}${url}`
            break;
            // 单文件和npm模块
        case false:
            filePath = `${process.cwd()}${url}`
            break;
    }

    let [base, name, ext] = [
        path.parse(filePath).base,
        path.parse(filePath).name,
        path.parse(filePath).ext.substr(1),
    ]
    let isExist = fs.existsSync(filePath)

    if (isExist && fs.statSync(filePath).isDirectory()) ext = ''

    let con = {
        url, //浏览器访问的url
        filePath, //文件的系统地址
        base, //完整文件名
        name, //文件名
        ext, //后缀名
        isExist //是否真实存在
    }
    isLog ? console.log('url信息：', con) : null

    return con
}

// 端口检测
const canUseProt = function(intPort) {
    let testProt = net.createServer()
    return new Promise((resolve, reject) => {
        // 是否可用
        if (intPort) {
            if (isNaN(intPort)) {
                console.log(`⚠️  请输入数字类型！`);
                resolve(false)
            } else if (intPort < 2000 || intPort > 65535) {
                console.log(`🚫 端口 ${intPort} 不可用！`);
                resolve(false)
            } else {
                testProt.listen(intPort, host, () => {
                    console.log(`☑️ 端口 ${intPort} 可用`);
                    testProt.close()
                    resolve(true)
                });
                testProt.on('error', (e) => {
                    if (e.code === 'EADDRINUSE') {
                        console.log(`🚫 端口 ${intPort} 不可用！`);
                        testProt.close();
                        resolve(false)
                    }
                });
            }

        }
        // 返回可用端口
        else {
            testProt.listen(() => {
                let p = testProt.address().port
                console.log(`自动分配端口：${p}`);
                testProt.close()
                resolve(p)
            });
        }
    })
}

//两个时间的间隔 
//form https://github.com/renzhezhilu/Blog/blob/master/javaScript/jsBasic/%E5%BC%95%E7%94%A8%E7%B1%BB%E5%9E%8B-Object-Date.js
const twoTimeInterval = function(beforeTime, afterTime) {
    let interval = 0
    let unit = [{
            n: 1000 * 60 * 60 * 24 * 30 * 12 * 100,
            m: '世纪'
        },
        {
            n: 1000 * 60 * 60 * 24 * 30 * 12,
            m: '年'
        },
        {
            n: 1000 * 60 * 60 * 24 * 30,
            m: '月'
        },
        {
            n: 1000 * 60 * 60 * 24,
            m: '天'
        },
        {
            n: 1000 * 60 * 60,
            m: '小时'
        },
        {
            n: 1000 * 60,
            m: '分钟'
        },
        {
            n: 1000 * 1,
            m: '秒'
        },
        {
            n: 1,
            m: '毫秒'
        }

    ]
    let lg = '前'
    let out = ''

    interval = Math.abs(new Date(afterTime) - new Date(beforeTime))

    for (const item of unit) {
        if (interval > item.n) {
            out = (interval / item.n).toFixed(0) + item.m + lg
            break
        }
    }
    return out
}
// 打开链接 
//form https://github.com/rauschma/openurl
const openUrl = function(url, callback) {
    var spawn = require('child_process').spawn;
    var command;
    switch (process.platform) {
        case 'darwin':
            command = 'open';
            break;
        case 'win32':
            command = 'explorer.exe';
            break;
        case 'linux':
            command = 'xdg-open';
            break;
        default:
            throw new Error('Unsupported platform: ' + process.platform);
    }

    function open(url, callback) {
        var child = spawn(command, [url]);
        var errorText = "";
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', function(data) {
            errorText += data;
        });
        child.stderr.on('end', function() {
            if (errorText.length > 0) {
                var error = new Error(errorText);
                if (callback) {
                    callback(error);
                    console.log('自动打开浏览器失败，请手动打开');
                } else {
                    throw error;
                }
            } else if (callback) {
                callback(error);
            } else {
                // console.log(`✅ 启动成功！`);
            }
        });
    }
    open(url, callback)
}

// 终端命令
function processReturn() {
    let argv = process.argv
    argv = argv.slice(2)
    let helpLog = ()=>{
        return  console.log(
            `
plug                    打开http-plug(默认端口9527)
plug 8888               使用8888端口打开（失败后则重新随机分配）
plug -l | -L            打印日志 
plug 8888 -l | -L       指定端口并打印日志 
plug -v | -V            查看版本
plug -h | -H            帮助
            `
        );
    }
    if (argv.length === 1) {
        //版本
        if (['-v', '-V','-version'].includes(argv[0])) {
            console.log(version);
            process.exit()
        } 
        else if (['-l', '-L','-log'].includes(argv[0])) {
            isLog = true
        }
        // 帮助
        else if (['-h', '-H','-help'].includes(argv[0])) {
            helpLog()
            process.exit()
        }
        // 端口
        else{
            port = argv[0]
        }
    }
    else if (argv.length === 2) {
        port = argv[0]
        isLog = true
    }else if(argv.length>=3){
        console.log('命令错误');
        helpLog()
    }
}


/******************************************
文件列表html模版
*******************************************/
// html模版(title 页面标题,back 返回的链接,path 当前路径,content 列表内容)
const listPageHtml = function(title, back, folderPath, content) {
    let html = `
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="shortcut icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo5MTVlMjZkMi1kMGI1LTRkOWMtOTI5YS1hODhjNTRkNzJmNDkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjRGRDFCQzlCQjg2MTFFQTgyMkZFQTM5Mzk1QzNBOEQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjRGRDFCQzhCQjg2MTFFQTgyMkZFQTM5Mzk1QzNBOEQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5MTVlMjZkMi1kMGI1LTRkOWMtOTI5YS1hODhjNTRkNzJmNDkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OTE1ZTI2ZDItZDBiNS00ZDljLTkyOWEtYTg4YzU0ZDcyZjQ5Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+yIMstwAAABhQTFRF////JCQk2dnZurq6QUFBmJiYY2Nj////P0MxsgAAAAh0Uk5T/////////wDeg71ZAAAA1klEQVR42uyXSQ7DIAwADV76/x83ENI6KhgwkXphjhET8IKE4XUCU1ySQ/3o4HNPG5xutsHrJhvc7mGvyZvN5h8wBcpgbyWyCGmCIpqmBAtKp2icIIYOApD/jg7Xklkv4xvlKwNQJXQWvmWGRENfGRP6uCJhjIFYOWrYrhQO7hso2onqlbnSUz86Frgrp7CPcuhsV3szlRlT4VyhSymzq8EaPTK2dZGpeXHtHom54Vp3Mh4ZkTtmmTebzZNP19X39tJL320vTDfwyFw1b+uJblK/nLcAAwCerAf2QdSKzAAAAABJRU5ErkJggg==">
    </head>

    <body>
        <style>
            * {
                margin: 0;
                padding: 0;
                text-decoration: none;
                list-style: none;
                transition: .3s;
            }

            body {
                font-size: 12px;
                padding: 2%;
                color: #2f353d;
                display: flex;
                justify-content: center;
                background-color: #fff;
            }

            .main {
                width: 96%;
                max-width: 1000px;
                border-radius: 8px;
                padding: 3%;
                background-color: #fff;
                box-shadow: 0 30px 60px #eaedf9;
            }

            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-height: 60px;
            }

            h1 {
                font-size: 24px;
                line-height: 26px;
                word-break: break-all
            }

            a {
                color: #2f353d;
            }

            a:hover {
                color: #eeb92b;
            }

            table {
                width: 100%;
                text-align: left;
                border-collapse: collapse;
            }

            tr {
                padding: 0;
                margin: 0;
                background-color: #fff;
                border-radius: 8px;
                border-bottom: 1px solid #eff1f3;
            }

            tr:nth-child(even) {
            }

            tr:hover {
                background-color: #f4f4f4;
            }

            th {
                opacity: .5;
                height: 22px;
            }

            td,
            th {
                padding: 4px;
                margin: 0;
                color:#9b9c9e;
            }

            td a {
                font-size: 16px;
                box-lines: 22px;
                align-items: center;
                font-weight: 900;
            }


            .icon {
                display: inline-block;
                width: 18px;
                height: 18px;
                margin-right: 7px;
                flex-shrink: 0;

            }



            .logo {
                background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAV4AAAAwCAMAAABufOK2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTM2QUUwNDRCNzlCMTFFQUI3NURGNjY4MERBRjY4MzIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTM2QUUwNDVCNzlCMTFFQUI3NURGNjY4MERBRjY4MzIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMzZBRTA0MkI3OUIxMUVBQjc1REY2NjgwREFGNjgzMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFMzZBRTA0M0I3OUIxMUVBQjc1REY2NjgwREFGNjgzMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpkSyjYAAAAMUExURdLS0nx8fCUlJf///4YL0UUAAAAEdFJOU////wBAKqn0AAADb0lEQVR42uyb0YKrIAxEZ+T///lut9dWNAMJAu228ohY8DQmQ4hIIxpALrtGEunb2pAnxiIaLrwlm/Q1LsvFN4L3xowFau524fX40QtvH7zFN70Z7+1VeDR8Ld7ObH/Uw306fo1BYyLcH7zpwltTV33x8it97wDTfbJcPhbvKgPWkIKJtvtwBDW8tP8NJvGfi+7cRMwgKkfQWB520fgQnHmIM5hJ14s3v4bn3TG8Sb09x5kOI6w7sNM/u6eC8VsCL0fiRSWy6cewlyV0OVEV3nIErPGPacxl0lqBwLu8Ed7NU9HhBJ7dqG5s5IgiXlq0aYYatMQ1utp5vIfH8DqBezcK0bWAl0G81HT3eO85mS5bWzbvKmjjpYgIFN3K1qs+EIclVPFiF9G49me5BYYiVByvkXmLCAfbumW3eH4xUzbCEg5pkXhxQIP/PrxF6LY6B6fGpS0cKKxbdme/gxrebATrwiEZww+Gh9WWlgnNuf+VuqygSa3u/HcsvHJETJdB2g/SFLARvBV56ca7u9FAIEeYkQ1Sl0njfWu8eyWQCpLf6IatZCVeVPBSChrhrUJ4m9VYb7yobBFgdlgWJkfEZK/2DRG8pw4xA3hZmd+LN7MpLIaFyRExXZbNzMwgZuLla/Ay00VSl7FZl1Hg/d1WcJpzCOoydXdUl53YVfh0WTZzK95u2V6vLlNcorpM+yc5IqbLFrE7fku8GIkX1T8S2ws+XVbE++ayl6d12fB0pMKL2/7/r+EN6zIZWuWIYDpSpeLxSK/4PUST4G3SZeKdD+uydd21GMpy8NT5sn3GanM3ogmdE8cbMbzshJfemSoXFpnHq+N9nnEOx3s2HdmUL+uOF1rGYaumD8l0jnIOPJ5VWBuNXvmyDngz08jXtf03aUcL2ifFGCTVfCU6vfJlqS4H/efH2UY525vliXhs8Qm8aR5e+tOR5/JlDolSFGwsbgL1JcwrcvCV6HTXZb3wwnn0/Sq8vhqS7rrMqwCLzw/lkQvvu8TLN8DL1+GlyDVTqyiKQI7ZBWbVIodKHdej0Mu+bYxwoMWFBZNc14t59ZE+vH+rAtK4lF3DvPrTT8DbrXz6KvwfW53eGzBzZ/r5n61U8N4/Z5t9VvFFeFfEXT5su/AWIXu+dr2+d23D62686I7Ea34iS1kF/+ntnwADAJagn1Xt09BIAAAAAElFTkSuQmCC') no-repeat 0 0;
                background-size: 100% auto;
                width: 146px;
                height: 22px;
                flex-shrink: 0;
            }

            tr td:nth-child(1){
                min-width: 200px;
                max-width: 700px;
                word-break: break-all;
                display: flex;
                align-items: center;
            }
            tr td:nth-child(2){
                width: 80px;
            }
            tr td:nth-child(3){
                width: 80px;
            }
            tr td:nth-child(4){
                width: 20px;
            }
        </style>

        <div class="main">
            <header>
                <h1>
                    <a href="${back}">↵
                    PATH: 
                    <span>${folderPath}</span>
                    </a> 
                </h1>
                <a href="https://github.com/renzhezhilu/http-plug" target="_black"><div class="logo"></div></a>
            </header>

            <table>
                <tr>
                    <th>name</th>
                    <th>update</th>
                    <th>size</th>
                    <th>files count</th>
                </tr>
                ${content}
            </table>
        </div>
    </body>
    </html>
`
    return html
}


/******************************************
搭建服务器
*******************************************/
// 启动前检测端口
GO()
async function GO() {
    console.log(welcome());
    let isOkPort = await canUseProt(port)
    if (isOkPort) {
        startServer()
    } else {
        port = await canUseProt()
        startServer()
    }
    openUrl(`http://${host}:${port}`)
    console.log(`如未自动打开，请访问：http://${host}:${port}`);
    console.log(`局域网内可访问：http://${os.networkInterfaces().en0[1].address}:${port}`);
}
// 启动服务
function startServer() {
    let server = new http.Server();
    server.listen(port, host);
    server.on('request', function(req, res) {
        // 响应请求
        let {
            url,
            filePath,
            base,
            name,
            ext,
            isExist
        } = splitFileInfo(decodeURI(req.url))
        // 目录
        if (url.endsWith('/') && isExist) {
            let files = fs.readdirSync(filePath)
            files = filterFiles(files)
            res.writeHead(200, {
                "Content-Type": "text/html;charset=utf-8"
            });
            let title = base
            let back = url.split('/')
            back = back.slice(0, back.length - 2).join('/') + '/'

            let folderPath = url
            let content = ``
            isLog ? console.log('文件夹内容：', files) : null
            // 获取文件夹内容的信息，如果还是文件夹则获取其文件数量
            files.map(file => {
                let thisFile = filePath + file
                let stats = fs.statSync(thisFile);
                let ext = ''
                let isDir = fs.statSync(thisFile).isDirectory()
                if (!isDir) {
                    ext = path.parse(thisFile).ext.substr(1)
                    // 修复识别不了类似‘.eslintrc’这样的文件名
                    if (!ext) {
                        ext = path.parse(thisFile).base
                    }
                }
              
                // 链接
                let thisLink = url + file
                // 名称
                let thisName = file
                // 更新时间
                let thisTime = ''
                if (updateShowType) {
                    thisTime = twoTimeInterval(new Date(stats.mtime), new Date());
                } else {
                    thisTime = new Date(stats.mtime).toJSON().substr(0, 10) + ' ' + new Date().toTimeString().substr(0, 8)
                }
                // 大小
                let thisSize = stats.size / 1000
                if (thisSize > 999) {
                    thisSize = (thisSize / 1000).toFixed(1) + ' MB'
                } else {
                    thisSize = thisSize.toFixed(2) + ' KB'
                }
                // 文件数量
                let thisCount = '-'
                let thisClassName = ''
                switch (ext) {
                    case 'html':
                        thisClassName = 'file_html'
                        break;
                    case '':
                        thisClassName = 'folder'
                        break
                    default:
                        thisClassName = 'file'
                        break;
                }
                // 如果是文件夹
                if (stats.isDirectory()) {
                    let files = fs.readdirSync(thisFile + '/')
                    files = filterFiles(files)
                    if(files.some(s=>path.parse(s).ext.substr(1)==='html')) thisClassName = 'folder_html'
                    thisCount = files.length
                    thisSize = '-'
                    thisLink += '/'
                }
                let iconSvg = ''
                if(thisClassName==='folder'){
                    iconSvg =`
                    <svg t="1594365202577" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="21498" width="200" height="200">
                        <path d="M800 512H32V160c0-70.4 57.6-128 128-128h416l224 480z" fill="#5d6f83" p-id="21499"></path>
                        <path d="M896 992H160c-70.4 0-128-57.6-128-128V320c0-70.4 57.6-128 128-128h736c70.4 0 128 57.6 128 128v544c0 70.4-57.6 128-128 128z" fill="#7b899c" p-id="21500"></path>
                    </svg>
                    `
                }
                else if(thisClassName==='folder_html'){
                    iconSvg =`
                    <svg t="1594365202577" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="21498" width="200" height="200">
                        <path d="M800 512H32V160c0-70.4 57.6-128 128-128h416l224 480z" fill="#ffd76d" p-id="21499"></path>
                        <path d="M896 992H160c-70.4 0-128-57.6-128-128V320c0-70.4 57.6-128 128-128h736c70.4 0 128 57.6 128 128v544c0 70.4-57.6 128-128 128z" fill="#eeb92b" p-id="21500"></path>
                    </svg>
                    `
                }
                else if(thisClassName==='file'){
                    iconSvg =`
                    <svg t="1594365294707" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="24070" width="16" height="16">
                        <path d="M725.333 0H196.267c-84.48 0-153.6 69.12-153.6 153.6v716.8c0 84.48 69.12 153.6 153.6 153.6h631.466c84.48 0 153.6-69.12 153.6-153.6V256l-256-256zM896 870.4c0 37.547-30.72 68.267-68.267 68.267H196.267c-37.547 0-68.267-30.72-68.267-68.267V153.6c0-37.547 30.72-68.267 68.267-68.267h409.6V307.2c0 37.547 30.72 68.267 68.266 68.267H896V870.4zM708.267 290.133c-9.387 0-17.067-7.68-17.067-17.066V85.333l204.8 204.8H708.267z" fill="#5d6f83" p-id="24071"></path>
                        <path d="M588.8 716.8H298.667c-23.894 0-42.667 18.773-42.667 42.667s18.773 42.666 42.667 42.666H588.8c23.893 0 42.667-18.773 42.667-42.666S612.693 716.8 588.8 716.8zM256 571.733c0 23.894 18.773 42.667 42.667 42.667h426.666c23.894 0 42.667-18.773 42.667-42.667s-18.773-42.666-42.667-42.666H298.667c-23.894 0-42.667 18.773-42.667 42.666z" fill="#7b899c" p-id="24072"></path>
                    </svg>
                    `
                }
                else if(thisClassName==='file_html'){
                    iconSvg =`
                    <svg t="1594365294707" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="24070" width="16" height="16">
                        <path d="M725.333 0H196.267c-84.48 0-153.6 69.12-153.6 153.6v716.8c0 84.48 69.12 153.6 153.6 153.6h631.466c84.48 0 153.6-69.12 153.6-153.6V256l-256-256zM896 870.4c0 37.547-30.72 68.267-68.267 68.267H196.267c-37.547 0-68.267-30.72-68.267-68.267V153.6c0-37.547 30.72-68.267 68.267-68.267h409.6V307.2c0 37.547 30.72 68.267 68.266 68.267H896V870.4zM708.267 290.133c-9.387 0-17.067-7.68-17.067-17.066V85.333l204.8 204.8H708.267z" fill="#eeb92b" p-id="24071"></path>
                        <path d="M588.8 716.8H298.667c-23.894 0-42.667 18.773-42.667 42.667s18.773 42.666 42.667 42.666H588.8c23.893 0 42.667-18.773 42.667-42.666S612.693 716.8 588.8 716.8zM256 571.733c0 23.894 18.773 42.667 42.667 42.667h426.666c23.894 0 42.667-18.773 42.667-42.667s-18.773-42.666-42.667-42.666H298.667c-23.894 0-42.667 18.773-42.667 42.666z" fill="#ffd76d" p-id="24072"></path>
                    </svg>
                    `
                }

                
                content +=
                    `
                <tr>
                    <td>
                        <sapn class="icon">
                            ${iconSvg}
                        </sapn>
                        
                        <a href="${thisLink}">
                            ${thisName}
                        </a>
                    </td>
                    <td>${thisTime}</td>
                    <td>${thisSize}</td>
                    <td>${thisCount}</td>
                </tr>
            `
            })
            res.end(`
           ${listPageHtml(title, back, folderPath, content)}
        `);
        }
        // 文件
        else if (isExist) {
            // 支持的格式
            if (fileTyle()[ext]) {
                res.setHeader('Content-Type', fileTyle()[ext]);
                fs.createReadStream(filePath).pipe(res);
            }
            // 不支持的格式都当文本处理 
            else {
                res.setHeader('Content-Type', 'text/plain;charset=utf-8');
                fs.createReadStream(filePath).pipe(res);
            }
        }
        // 不存在
        else {
            res.writeHead(404, {
                "Content-Type": "text/html;charset=utf-8"
            });
            res.end(`<h1>404 Not Found!</h1>`);
        }
    })
}
/******************************************
全局事件处理
*******************************************/
// 监听错误，防止进程意外退出
// process.on('uncaughtException', function(err) {
//     // console.log(err.code);
//     //打印出错误的调用栈方便调试
//     // console.log(err.stack);
// });