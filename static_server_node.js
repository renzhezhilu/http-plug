var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');



let pageStyle = `
    <style>
    *{margin:0;padding:0;text-decoration:none;list-style:none;}
    li{
        width:90%;
        margin:3px;
    }
    </style>
`
http.createServer(function(req, res) {

    console.log(req.url);
    fs.readdir(process.cwd(), function(err, files) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(files);

    });
    // 目录
    if (req.url.endsWith('/')) {
        let files = fs.readdirSync(__dirname)
        res.writeHead(200, {
            "Content-Type": "text/html;charset=utf-8"
        });
        let h = showList(files)
        res.end(`
           ${pageStyle}
            ${h}
        `);
    }

    // 文件
    else if (req.url.startsWith('/')) {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.end('文件');
    }

    // 404错误
    else {
        res.writeHead(404, {
            "Content-Type": "text/plain"
        });
        res.end("404 error! File not found.");
    }

}).listen(8080, "localhost");


function showList(filesList) {
    let listHtml = '<table>'
    filesList.map(m => {
        listHtml += `
            <tr>
                <td><td>
            </tr>
        `
    })
    listHtml += '</table>'
    return listHtml
}