const UPX = require('upx')({best : true }) // see options below

UPX('./package/static_server_node-win.exe')
    .output('./static_server_node-win111111.exe')
    .start().then(function(stats) {
        console.log(stats);

        /* stats:
        { cmd: 'compress',
          name: 'Compressed.exe',
          fileSize: { before: '1859072', after: '408064' },
          ratio: '21.95%',
          format: 'win32/pe',
          affected: 1 }
        */
    }).catch(function(err) {
        // ...
    })