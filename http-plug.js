#!/usr/bin/env node
// ⬆️ 指定文件由node执行，全局命令用
/******************************************
系统模块
*******************************************/
const http = require("http");
const path = require("path");
const fs = require("fs");
const net = require('net')
const os = require('os');
const cp_command = require('child_process')

/******************************************
配置
*******************************************/
// 用户自定义
let version = 'v0.3.1'
let host = '0.0.0.0' //localhost
let port = 9527 // 端口
let updateShowType = true // 更新时间是否显示‘前’
let isLog = false // 是否打印访问日志
let isPkg = false // 当前模式是否pkg打包,解决pkg打包windows时process.cwd()输出不一致

// 全局变量
let setHeader = (req, res) => {
    const headers = {
        'Access-Control-Allow-Origin': '*', /* @dev First, read about security */
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000, // 30 days
        /** add other headers as per requirement */
    };

    res.writeHead(200, headers);
    res.end('Hello World setHeader');
}

// 命令行
processReturn()

//过滤不必要文件
const filterFiles = function (files) {
    let noNeed = [
        '.DS_Store',
        '.git',
        // '.gitignore'
    ]
    return files.filter(f => !noNeed.includes(f))
}
//解析文件类型
const fileTyle = function () {
    return {
        // 文本
        // ;charset=utf-8
        html: 'text/html',
        htm: 'text/html',
        js: "application/javascript",
        json: "application/json",
        css: "text/css",
        md: "text/markdown",
        txt: "text/plain",
        xml: "text/xml",
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
        wasm: "application/wasm"
    }
}
// 欢迎
const welcome = function () {
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
    // console.log('execPath-----',execPath);
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
            filePath = `${process.cwd()}${url.split('?')[0]}`
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
    console.log(con);
    return con
}

// 端口检测
const canUseProt = function (intPort) {
    let testProt = net.createServer(setHeader)
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
const twoTimeInterval = function (beforeTime, afterTime) {
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
///////////////////// 新的openUrlV2
function openUrlV2(url) {
    var command;
    switch (process.platform) {
        case 'darwin':
            command = 'open';
            break;
        case 'win32':
            command = 'start';
            break;
        case 'linux':
            command = 'x-www-browser';
            break;
        default:
            throw new Error('Unsupported platform: ' + process.platform);
    }
    cp_command.exec(`${command} ${url}`)
}


// 打开链接 
//form https://github.com/rauschma/openurl
///////////////////// 在windows下发生中断错误，弃用
const openUrl = function (url, callback) {
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
        child.stderr.on('data', function (data) {
            errorText += data;
        });
        child.stderr.on('end', function () {
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

// 固定时间最多只执行一次
let everyTime = {
    f: function (time = 1000, cd) {
        if (this.b) {
            this.b = false
            setTimeout(() => {
                cd()
                this.b = true
            }, time);
        }
    },
    b: true
}

let watchDirTime = null //文件夹监听会改变这个时间戳
let sseClients = []     // 存放所有保持连接的浏览器客户端（SSE）

// 监听文件夹变化
const watchDir = function () {
    let execPath = process.execPath
    switch (isPkg) {
        // pkg 打包时
        case true:
            execPath = execPath.split(path.sep)
            execPath.pop()
            execPath = execPath.join(path.sep)
            break;
        // 单文件和npm模块
        case false:
            execPath = `${process.cwd()}`
            break;
    }

    console.log(execPath);


    fs.watch(execPath, {
        recursive: true
    }, (event, filename) => {
        everyTime.f(600, () => {

            isLog ? console.log(`有文件更新：${filename}`) : null

            watchDirTime = new Date().getTime()
            
            // 遍历所有客户端，推送 "reload" 指令
            sseClients.forEach(client => {
                client.write(`data: reload\n\n`)
            })
        })
    })
}

// 浏览器热更新脚本 (SSE 模式)
const watchInBrowser = `
    <script>
    if ('EventSource' in window) {
        // 建立到服务器的单向长连接
        const source = new EventSource('/hot-reload-stream');
        
        // 监听服务器下发的消息
        source.onmessage = function(event) {
            if (event.data === 'reload') {
                console.log('检测到文件更新，准备刷新页面！');
                location.reload();
            }
        };
        
        source.onerror = function() {
            console.error('热更新服务连接断开，尝试重连...');
        };
    } else {
        console.warn('当前浏览器不支持 Server-Sent Events 热更新');
    }
    </script>
`


// 终端命令
function processReturn() {
    let argv = process.argv
    argv = argv.slice(2)
    let helpLog = () => {
        return console.log(
            `
plug                    打开http-plug(默认端口9527)
plug 8888               使用8888端口打开（失败后则重新随机分配可用端口）
plug -l | -L            打印日志 
plug 8888 -l | -L       指定端口并打印日志 
plug -v | -V            查看版本
plug -h | -H            帮助
            `
        );
    }
    if (argv.length === 1) {
        //版本
        if (['-v', '-V', '-version'].includes(argv[0])) {
            console.log(version);
            process.exit()
        } else if (['-l', '-L', '-log'].includes(argv[0])) {
            isLog = true
        }
        // 帮助
        else if (['-h', '-H', '-help'].includes(argv[0])) {
            helpLog()
            process.exit()
        }
        // 端口
        else {
            port = argv[0]
        }
    } else if (argv.length === 2) {
        port = argv[0]
        isLog = true
    } else if (argv.length >= 3) {
        console.log('命令错误');
        helpLog()
    }
}


/******************************************
文件列表html模版
*******************************************/
// html模版(title 页面标题,back 返回的链接,path 当前路径,content 列表内容)
const listPageHtml = function (title, back, folderPath, content) {
    let html = `
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="shortcut icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAEm0lEQVR4AWLQNjAHNGsOTLYkURBeI7z6Fc+2bdu2bdu2bdu2bdtj51YubzSrem7X9BeRDzOtLNc5ZaefhOoJrRS6IxQtBM2KFrojtFKontBPQl9ZyeqH3wi1EXothIDptVBboW/cjPwqtF8IulS7fhNMmDwdK9esx9r1mzBj9jx06tYbuQsUd7rvAL/Vzgh/cUWXgaYt2+H2nbuwIzY2Fus3bUHJspXtnsFv/c1o5FudNTFl+iykpKRAhujoGAwcOtLuWfv57aFG2ugyMXHKDHhh2co1yJg1j9Uz2/5r5Gd2Ij3Nqb2pJiKjotiE0G/QMNRp0BSt23fBoqUrWBMwsnP3PmTOkd9qAPiZRuroMMEPePzkKUI5fPQ4ChQpZXl90VIVcPXaDRg5d+EiipYsb7y+Co2s0mFk2KhxCOXIsRPmpmJQ1pwFaBZGIiIjMWvuQlSv3QC58xdDsdIVF9PIHb9NpM+SG48ePwltTqwJ6Zo8ePgoXLj7lY4Zu2HTVsaOq3R/puz5sGPXHsfBjUbgt7r06Ivde/f/p5p1G3t6zvDR4xEVFQ0rfDWybcdunDx91lE0qfJMzvhjJ0zGgUNHcOnKVRw+cgyz5y3yz0j2PIWRnJwMN3r2HRiO9/lnpG7D5pCB/SfQRoaNHAsZipeuFGwjXMm6kZSUhIzZ8gbbCGdlN16+esVrg2uEM3ZsXBzcuHDxcrCNVKxaGzJs37k72EZ69BkIGeYtXBJMI9lyFcTEKdMREREBGbi95TosMEY48gwePhpv372DKpyh8xUqmbZGWJrdevXjPsN5mHWZ4V+/eYvGzdukjZGWbTvhxs3bcIPLlGvXb0hdN2f+ItauPiNs27Js3LwNb95KNzkuBDnb6zFy/8FDyBATE4M2HbpClY5de/lvhFWfmJgIGabPmoepM+ZAlTIVqvlvpHzlmpCBHThb7kLg7E0IIyi3bt/BkuWruO+2rcUM3Mv7baR95x6Qoe/AochbqAQ+fPwEhnH4/0LFyoLPmDV3AWzgGk1DZ5cMsHE0Y6lmyZnfFCmp06CZ03DMGJceI5u3bocbTVq0td01Pnn6DE6MGjtRj5ErV687D5+Xr4IjFTv5vgOH8PDRYy5dZPcoDG7rMcKYlArHTpzifTQnFbhmvMt3I0VKlIMqI8dMQP7CpfDu/Xu4wWt8W6Jw3mjWqj2o0eMnQ5XS5auCTUwGbsY4wg0cMiL8RgoXLwevsH9w2FWFK4ewG6lRpxG8snf/QeU+RXbs3ht+I1zleoXpMy9wrlI34hLEZtPQTat2nVWNxLimFbh11YwhkSOlu66JnkHDRjHYrEvc+noZfhfTSF2HFDKHXe1iOEnRSBXbZGiufEWRGtRHK/X1ljEZSrU1XsD8nFdevXqNT58/wysVqtRSMdLO8cAAEzCpmD9SVQgKJg4YDwxQv/NYRDhGq/kLl0Id5f0Iv/UPp0M1B+1u/vz5C4xcvHRF6sWcrQ1wNcztsJdR6iC/VeaYE9vdG2PuzgputGRefv3mLct9vaKBN/w2+2NO7gfP7tWq1yQGZnhARuojrOLBZ89fdJ2x+W6Zg2d/Al2Skd0lfMAeAAAAAElFTkSuQmCC">
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
                width:666px;
                border-radius: 8px;
                padding: 2vh 3vw;
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
                    path: 
                    <span>${folderPath}</span>
                    </a> 
                </h1>
                <a href="https://github.com/renzhezhilu/http-plug" target="_black"><div class="logo">
                <img width="36" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAGFBMVEX///8rMDebnqHb3N1wdHlKTlS9v8H///8gM2lwAAAACHRSTlP/////////AN6DvVkAAAUOSURBVHja3Z3bct0gDEV15///uO20HdokBiQcS2Y9h5muA+wNPpdCmwPptDlQXKKzIwLFCIpAQQIiUBSnCBTGIQLFWRWB8qyJwAtYEIEc2Ix+YcYxFSjgYaL4LypkbhPI9iDBLxFilwmkejDhADGHCWR6CE5QWjaBPA9TnKO2aAJZHiy4hvCSCSR5mOIyBNdkixB6EHaIVPTo2NQESnt0aGYCtT06AlekiRCGkBUReBDDIHq15XNEGMMoz0TgQRQH6E8CJl0k/3ilQsZ/ryZyacNDkfQNosSj4p8XyuMiPDsXzlXoWgSeQzzHW3KYPCxiK+3QYV0plC6SmVgUiQblL0UyK92CIUefTSBzQjh8nlFLFKHBfLhNUCxNROf7Y2AyaZ/EyBLPTI7OAz8xyjtk6b3nfk6bEIJbTSyr1PXmOwxlnbIM7jWRpOzVu++VmrTVCW420aSVdf9dP2dlCQRgLSAit2SM5IvcVF+ULWLyPxCF1SFSG3KIFIf0cRHDFSIr9eFmJ1xAIYKRqONt+U0EFxCIw8zwBOoQKQ2uQFAewxUMykOniAiuwFAexRVO2esK5eFTRAwPqRE6pUbkFBE8pEYYD6kRw0NqhE4RkVNqRE+pETxExPA9NTKETqkROUVET+lDPKRGGA+pETtFhE6pETmlRvAQEcZDasTwkBqhU2pEzhDhVQ99t0ZHDtConlqEPqSqhhvl+u/kv7TdTTGIFNOIo1YsquJQMY04ysU04tgrEldxjtTXQCm+vEhXUwnXoOKJS4KLSGUNVHD8rRXuP+OylULoQIDKVoqiAwYpWynOI2HZEwv7JsTKipjv3yToxertdR3sqPznduJ6bRndQDkRDV3ktV76WmhlSbn0lR5x705f7hFXMbTMtUQE3XC19B2sQ6EXhRZdrEMlA5D3hJb26fv8+4v2otCyT9ZKBr9hfU9o6f9/rGLQkReFFv+zsoTYERfwEORpZ0EV882plvxaCLE7LQQGPB5aFJ9SqhRauhEWVim0aGNGuVBoqWNhlQ4tc7wOlUNLdqJCComwY3ReaKlvQphEybPBrE768sevarMn8bhM+lJ3+I26DgVQJn3/OHTEE3ha+OMmNpjMzNByM4iJ1NDyIjW/FY5uyHWxLPy7w+yZSq37Q9Dq2ltSN7TI9QJQ3dAyV0ZY3dAa+Ofec52Id2cpGXwX3AltkT4qV4ZxA46dBjQzcvffROxINREKTigldMdsZSkGsGoi0dE1SrAjwXWp1UQMtNCnzBXDRF8EKiaiVurTzBiGFGNwsWJXDAKlROJojUvhPnKKCNW43e5jp4jUuKbvo6eISM7zhjhX0CkiBt8CPg6fUuwQodUT0ZDGXESfhoIiB3CWSDvCYyzCedwropgFBUQGJpgGOz3GIowb6F6ThETad1wN5cHjb5uIUJqIBUXaN4hsDXZ6zEQE48jOYA2LtNvTl+Sx8G1TEdyAdWdwXKTdnL4Kj22R+X/9bxhH+KnwbR9F2q0iZg9tkbYgQhhnazDvibQb01e3Brs8ukjnvvSlHRFxeXSRS5OtxaFPnE/alUi7S2RrsNuji3TG90PBLzH+yFeDL7Y/hS+HbSTSYITspAwNBkdoY5EWeAq89VA/7DET8d/hdetZ+K5GF3GYbMXlne/ptDWR5rvD086zcNn26CLLKuYQ8Q6Oa3SRZRXyF9h8cFBjLtKpmL6tOUQ61dK3DYA2pk76tjHQ5uSnb5vzA8XkaynbehbtAAAAAElFTkSuQmCC" >
                </div></a>
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

        ${watchInBrowser}
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
    openUrlV2(`http://127.0.0.1:${port}`)
    console.log(`如未自动打开，请访问：http://127.0.0.1:${port}`);
    console.log(`局域网内可访问：http://${getLocalWlanHost()}:${port}`);
}
function getLocalWlanHost() {
    let host = 'localhost';
    try {
        const ifaces = os.networkInterfaces();
        for (let dev in ifaces) {
            ifaces[dev].forEach((details, alias) => {
                // 寻找IPv4协议族，并且地址不是本地地址或者回环地址的地址即可。
                if (details.family === 'IPv4' && details.address !== '127.0.0.1' && !details.internal) {
                    host = details.address;
                }
            });
        }
    } catch (e) {
        // console.log(e);
        host = 'localhost';
    }
    //   console.log(host);
    return host
}
// 启动服务
function startServer() {
    // 启动监听
    watchDir()
    // 启动http
    let server = new http.Server();
    server.listen(port, host);
    server.on('request', function (req, res) {
        // 响应请求
        let {
            url,
            filePath,
            base,
            name,
            ext,
            isExist
        } = splitFileInfo(decodeURI(req.url))
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
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
                    if (files.some(s => path.parse(s).ext.substr(1) === 'html')) thisClassName = 'folder_html'
                    thisCount = files.length
                    thisSize = '-'
                    thisLink += '/'
                }
                let iconSvg = ''
                if (thisClassName === 'folder') {
                    iconSvg = `
                    <svg t="1594365202577" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="21498" width="200" height="200">
                        <path d="M800 512H32V160c0-70.4 57.6-128 128-128h416l224 480z" fill="#5d6f83" p-id="21499"></path>
                        <path d="M896 992H160c-70.4 0-128-57.6-128-128V320c0-70.4 57.6-128 128-128h736c70.4 0 128 57.6 128 128v544c0 70.4-57.6 128-128 128z" fill="#7b899c" p-id="21500"></path>
                    </svg>
                    `
                } else if (thisClassName === 'folder_html') {
                    iconSvg = `
                    <svg t="1594365202577" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="21498" width="200" height="200">
                        <path d="M800 512H32V160c0-70.4 57.6-128 128-128h416l224 480z" fill="#ffd76d" p-id="21499"></path>
                        <path d="M896 992H160c-70.4 0-128-57.6-128-128V320c0-70.4 57.6-128 128-128h736c70.4 0 128 57.6 128 128v544c0 70.4-57.6 128-128 128z" fill="#eeb92b" p-id="21500"></path>
                    </svg>
                    `
                } else if (thisClassName === 'file') {
                    iconSvg = `
                    <svg t="1594365294707" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="24070" width="16" height="16">
                        <path d="M725.333 0H196.267c-84.48 0-153.6 69.12-153.6 153.6v716.8c0 84.48 69.12 153.6 153.6 153.6h631.466c84.48 0 153.6-69.12 153.6-153.6V256l-256-256zM896 870.4c0 37.547-30.72 68.267-68.267 68.267H196.267c-37.547 0-68.267-30.72-68.267-68.267V153.6c0-37.547 30.72-68.267 68.267-68.267h409.6V307.2c0 37.547 30.72 68.267 68.266 68.267H896V870.4zM708.267 290.133c-9.387 0-17.067-7.68-17.067-17.066V85.333l204.8 204.8H708.267z" fill="#5d6f83" p-id="24071"></path>
                        <path d="M588.8 716.8H298.667c-23.894 0-42.667 18.773-42.667 42.667s18.773 42.666 42.667 42.666H588.8c23.893 0 42.667-18.773 42.667-42.666S612.693 716.8 588.8 716.8zM256 571.733c0 23.894 18.773 42.667 42.667 42.667h426.666c23.894 0 42.667-18.773 42.667-42.667s-18.773-42.666-42.667-42.666H298.667c-23.894 0-42.667 18.773-42.667 42.666z" fill="#7b899c" p-id="24072"></path>
                    </svg>
                    `
                } else if (thisClassName === 'file_html') {
                    iconSvg = `
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
            isLog ? console.log('url信息：', { url, filePath, base, name, ext, isExist }) : null

        }
        // 文件
        else if (isExist) {
            // 新增读取文件夹下默认index.html 适用于 /about 实际访问 /about/index.html 2024-06-20
            // 返回 Content-Length  2024-06-20
            // https://nodejs.org/api/http.html#requestgetheadername
            if (ext === '') {
                let html = fs.readFileSync(`${filePath}/index.html`, 'utf8')
                html = html + watchInBrowser
                res.setHeader('Content-Type', fileTyle()['html']);
                res.setHeader('Content-Length', Buffer.byteLength(html));
                res.end(html)
            }
            // html
            else if (ext === 'html') {
                let html = fs.readFileSync(filePath, 'utf8')
                html = html + watchInBrowser
                res.setHeader('Content-Type', fileTyle()[ext]);
                res.setHeader('Content-Length', Buffer.byteLength(html));

                res.end(html)
            }
            // 支持的格式
            else if (fileTyle()[ext]) {
                res.setHeader('Content-Type', fileTyle()[ext]);
                res.setHeader('Content-Length', Buffer.byteLength(fs.readFileSync(filePath)));
                fs.createReadStream(filePath).pipe(res);
            }
            // 不支持的格式都当流处理 
            else {
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Length', Buffer.byteLength(fs.readFileSync(filePath)));

                // res.setHeader('Content-Type', 'application/javascript');
                fs.createReadStream(filePath).pipe(res);
            }
            isLog ? console.log('url信息：', { url, filePath, base, name, ext, isExist }) : null
        }
        // SSE 热更新流通道
        else if (!isExist && url === '/hot-reload-stream') {
            // 设置 SSE 必需的响应头
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });
            
            // 发送一条注释数据，防止某些浏览器在没有任何数据时挂起连接
            res.write(': connected\n\n');
            
            // 将当前连接加入到客户端池中
            sseClients.push(res);
            
            // 当浏览器关闭页面或断开连接时，将其从池中移除，避免内存泄漏
            req.on('close', () => {
                sseClients = sseClients.filter(client => client !== res);
            });
        }
        // 不存在
        else {
            res.writeHead(404, {
                "Content-Type": fileTyle().html
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