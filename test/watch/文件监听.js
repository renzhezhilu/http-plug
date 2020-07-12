const fs = require('fs')

// 通用-截流
let everyTime = {
    f: function(time = 1000, cd) {
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


let everyTime2 = {
    f: function(time = 1000, cd) {
        let now = new Date()
        if (now - this.t > time) {
            cd()
            this.t = now
        }
    },
    t: null
}



fs.watch('./change', {
    recursive: true
}, (event, filename) => {
    // everyTime.f(600,()=>{
    //     console.log(1233);
    //     console.log(`${event}--${filename}文件发生更新`)
    // })
    everyTime2.f(2000, () => {
        console.log(1233);
        console.log(`${event}--${new Date()}文件发生更新`)
    })
})