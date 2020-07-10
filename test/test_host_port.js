const http = require("http");



var net = require('net')
var Socket = net.Socket





// 分配端口
let assignProt = function() {
    return new Promise((resolve, reject) => {
        let testProt = net.createServer()
        testProt.listen(() => {
            let p = testProt.address().port
            console.log(`分配端口：${p}`);
            testProt.close()
            resolve(p)
        });
    })
}
// 检测端口65535
let testProt = function(intPort) {
    return new Promise((resolve, reject) => {
        if (!intPort || isNaN(intPort)) {
            console.log(`⚠️  请输入数字类型！`);
            resolve(false)
        } else if (intPort < 2000 || intPort > 65535) {
            console.log(`🚫 端口 ${intPort} 不可用！`);
            resolve(false)
        } else {
            let socket = new Socket()
            socket.setTimeout(1500)
            socket.on('connect', () => {
                console.log(`🚫 端口 ${intPort} 已被占用！`);
                socket.end()
                resolve(false)
            })

            socket.on('timeout', () => {
                console.log('timeout!!!');
                socket.destroy()
                resolve(false)
            })

            socket.on('error', (err) => {
                console.log(`自动分配端口：${intPort}`);
                resolve(true)
            })
            socket.on('close', (err) => {})
            socket.connect(intPort, '127.0.0.1')
        }
    })
}
// testProt(9527).then(d=>{
//     console.log(d);
// })
var scan = function(port) {
    const server = net.createServer((socket) => {
        console.log('再见');
        
        socket.end('再见\n');
      }).on('error', (err) => {
        // 处理错误
        throw err;
      });
      
      server.on('listening',()=>{
console.log('listening');

      })
      server.listen(port,'localhost',() => {
        console.log('打开服务器', server.address());
        // server.close()
      });
}
scan(9900)






// 返回可用端口
// canUseProt('dsad').then(d => {
//     console.log(d);
// })
// kk()
async function kk() {
    await canUseProt(2222)
    await canUseProt(2222)
    console.log('after');
}

function canUseProt(intPort) {


    return new Promise((resolve, reject) => {
        let testProt = http.createServer()
        // 检测端口是否可用
        if (intPort) {
            if ((intPort < 0 && intPort > 65536) || isNaN(intPort)) {
                console.warn('🚫 端口错误！请输入数字0-65536');
                testProt.close();
                resolve(false)
            }
            testProt.listen(intPort, () => {
                console.warn(`☑️ 端口 ${intPort} 可用`);
                testProt.close()
                resolve(true)
            });
            testProt.on('error', (e) => {
                console.log(`⚠️ 端口 ${intPort} 已被占用！`);
                // testProt.close();
                resolve(false)
                // 聊胜于无
            });
        }
        // 返回可用端口
        else {
            testProt.listen(() => {
                let p = testProt.address().port
                console.log(`可用端口：${p}`);
                resolve(p)
                testProt.close()
            });
        }
    })
}