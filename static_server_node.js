/******************************************
系统模块
*******************************************/
const http = require("http");
const path = require("path");
const fs = require("fs");

var c = require('child_process');

/******************************************
配置
*******************************************/
const port = 8964 //端口
let updateShowType = true //更新时间是否显示‘前’
//解析文件类型
const fileTyle = {
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
//过滤不必要文件
const filterFiles = [
    '.DS_Store',
    '.git'
]

/******************************************
方法
*******************************************/
//获取url信息
const getFileInfo = (url) => {
    let filePath = `${__dirname}${url}`
    let [base, name, ext] = [
        path.parse(filePath).base,
        path.parse(filePath).name,
        path.parse(filePath).ext.substr(1),
    ]
    let isExist = fs.existsSync(filePath)

    if (isExist && fs.statSync(filePath).isDirectory()) ext = ''

    let con = {
        url,
        filePath,
        base,
        name,
        ext,
        isExist
    }
    console.log('url信息：',con);
    
    return con
}

//两个时间的间隔 form https://github.com/renzhezhilu/Blog/blob/master/javaScript/jsBasic/%E5%BC%95%E7%94%A8%E7%B1%BB%E5%9E%8B-Object-Date.js
function twoTimeInterval(beforeTime, afterTime) {
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


/******************************************
文件列表html模版
*******************************************/
// html模版(title 页面标题,back 返回的链接,path 当前路径,content 列表内容)
let listPageHtml = function(title, back, folderPath, content) {
    let html = `
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
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
                padding: 2%;
                background-color: #fff;
            }

            h1 {
                font-size: 22px;
                line-height: 26px;
            }
            h1 a {
                color: #2f353d;
            }
            h1 a:hover {
                color: #275085;
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
            }
            tr:nth-child(even){
                /* background-color: #f4f4f4; */
            }
        
            tr:hover {
                background-color: #f4f4f4;
            }
            th{
                opacity: .5;
                height: 22px;
            } 

            td,th {
                padding: 4px;
                margin: 0;
            }

            td a {
                font-size: 16px;
                box-lines: 22px;
                display: flex;
                align-items: center;
                color: #2f353d;
                font-weight: 900;
            }


            .icon {
                display: inline-block;
                width: 18px;
                height: 18px;
                margin-right: 7px;
                flex-shrink: 0;

            }

            tr td:nth-child(1) {
                min-width: 200px;
                word-break: break-all
            }

            .folder {
                background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTM2QUUwM0NCNzlCMTFFQUI3NURGNjY4MERBRjY4MzIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTM2QUUwM0RCNzlCMTFFQUI3NURGNjY4MERBRjY4MzIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2NEY3RDk3RkI3OUIxMUVBQjc1REY2NjgwREFGNjgzMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2NEY3RDk4MEI3OUIxMUVBQjc1REY2NjgwREFGNjgzMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtFJd1YAAAAYUExURd3d3mx8j42aqfj5+rW6wGV2il1vhP///x7OQvkAAAAIdFJOU/////////8A3oO9WQAAAGlJREFUeNrs1jEOgDAMQ1Enbdz73xgJJkQTySOQvz91c4olh98TuMW9WZMx+aw0ACkaOFUDY2LGrpNEQhibzFGR9HWZEDpxnZhOokmTJk1eT0xfS9c3Gfryrynel/0RT7uu2If+MIcAAwAjSzu4D8MtOQAAAABJRU5ErkJggg==') no-repeat 0 0;
                background-size: 100% 100%;
            }

            .file {
                background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjRGN0Q5N0RCNzlCMTFFQUI3NURGNjY4MERBRjY4MzIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NjRGN0Q5N0VCNzlCMTFFQUI3NURGNjY4MERBRjY4MzIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2NEY3RDk3QkI3OUIxMUVBQjc1REY2NjgwREFGNjgzMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2NEY3RDk3Q0I3OUIxMUVBQjc1REY2NjgwREFGNjgzMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pvz31UUAAAAYUExURenr7mR3jIuZqXeIm7/H0JqmtFpuhf///7mCQO0AAAAIdFJOU/////////8A3oO9WQAAAKVJREFUeNrs1tEKwCAIBVBLq///441RZkvD3r2PtRMSI4XGoZy2FGhbeAmwaklgEqhWyCCQviNxjW46Kd/erwjIqulfJa0CrpY08q5jM8lqJikHshgnkcZLhHGTafyEzQUZ/84FqdlD8mocpAGNoJeI4D0pQYIECRLEaK/HB1Zv4iI0Dz2NCrID1Fn6cSDhJKWLdXMMOIcrDsI2j+kj3EgWd/MIMADRrD7NdGLHkQAAAABJRU5ErkJggg==') no-repeat 0 0;
                background-size: 100% 100%;
            }

            .html_file {
                background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTM2QUUwNDBCNzlCMTFFQUI3NURGNjY4MERBRjY4MzIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTM2QUUwNDFCNzlCMTFFQUI3NURGNjY4MERBRjY4MzIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMzZBRTAzRUI3OUIxMUVBQjc1REY2NjgwREFGNjgzMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFMzZBRTAzRkI3OUIxMUVBQjc1REY2NjgwREFGNjgzMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoriNEEAAAAYUExURW/X/fX8/6vo/ovf/tv1/2LT/VfQ/f///yRGgKwAAAAIdFJOU/////////8A3oO9WQAAALxJREFUeNrs1skOxSAIBVAEh///4ya1L1HBcmn6dr2bbjwhdUCp9WQpVrjpUP9w3YR3JNeKm06kBkwnxR7MprklV3WOENM4xDIeMYxLkjIu0XUAshqELAYis8HINAcY+dUJkfN4FJcIj4GIykfeJyJhwonCpC0GIYuxydrDJ2OSksac7Zpcorr2UAclw7XwXpXwvzyYMbUuJbqUmf6/xx7s5K9d7IlgRLBnz5gMPa6M+4bun3BDJF9DDwEGANP9OsC2Qk6FAAAAAElFTkSuQmCC') no-repeat 0 0;
                background-size: 100% 100%;
            }



            /* tr td:nth-child(3){
                min-width: 60px;
            }
            tr td:nth-child(4){
                min-width: 50px;
            } */
        </style>

        <div class="main">
            <h1>
                <a href="${back}">↵</a> 
                PATH: 
                <span>${folderPath}</span>
            </h1>

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
// let isFirstOen = false
// if(!isFirstOen){
//     console.log(`用浏览器打开：localhost:${port}`);
// }  
let server = http.createServer(function(req, res) {
    // 第一次打开时
    // isFirstOen = true
    // 响应请求
    let {
        url,
        filePath,
        base,
        name,
        ext,
        isExist
    } = getFileInfo(decodeURI(req.url))
    // 目录
    if (url.endsWith('/') && isExist) {
        let files = fs.readdirSync(filePath)
        files = files.filter(f => !filterFiles.includes(f))
        res.writeHead(200, {
            "Content-Type": "text/html;charset=utf-8"
        });
        let title = base
        let back = url.split('/')
        back = back.slice(0, back.length - 2).join('/') + '/'

        let folderPath = url
        let content = ``
        console.log('目录文件：',files);
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
            let thisClassName = ''
            switch (ext) {
                case 'html':
                    thisClassName = 'html_file'
                    break;
                case '':
                    thisClassName = 'folder'
                    break
                default:
                    thisClassName = 'file'
                    break;
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
            // 




            // 大小
            let thisSize = stats.size / 1000
            if (thisSize > 999) {
                thisSize = (thisSize / 1000).toFixed(1) + ' MB'
            } else {
                thisSize = thisSize.toFixed(2) + ' KB'
            }
            // 文件数量
            let thisCount = '-'
            if (stats.isDirectory()) {
                let files = fs.readdirSync(thisFile + '/')
                files = files.filter(f => !filterFiles.includes(f))
                thisCount = files.length

                thisSize = '-'

                thisLink += '/'

            }

            content +=
                `
                <tr>
                    <td>
                        <a href="${thisLink}">
                            <sapn class="icon ${thisClassName}"></sapn>
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
        if (fileTyle[ext]) {
            res.setHeader('Content-Type', fileTyle[ext]);
            fs.createReadStream(filePath).pipe(res);
        } else {
            // res.writeHead(200, {
            //     "Content-Type": "text/html;charset=utf-8"
            // });
            // res.end(`不支持文件格式:${name}，可在fileTyle常量添加文件解析类型。<a href="/">返回首页</a></br>${JSON.stringify(fileTyle)}`);
            res.setHeader('Content-Type','text/plain;charset=utf-8');
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
server.listen(port,'localhost');

  
