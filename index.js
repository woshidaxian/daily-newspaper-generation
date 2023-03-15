const CONFIG = require('./config/config')
const chalk = require('chalk')
const fs = require('fs')
const readProject = require('./src/read')
const write = require('./src/write')
let timer = null
global.singleLine = require('single-line-log').stdout
if(CONFIG.projectList.length == 0){
  console.log(chalk.red('No project'))
}else{
  main()
}

async function main() {
  let promises = []
  let data = []
  let i = 0
  timer = setInterval(() => {
    let s = ['·', '··', '···', '····', '·····', '······']
    singleLine(`[${Math.floor(i / 2)}秒]` + '正在获取中' + s[(++i) % s.length])
  }, 500);
  CONFIG.projectList.forEach((item)=>{
    promises.push(
      new Promise((resolve, reject) => {
        fs.access(item, err=>{
          if(err){
            console.log(chalk.yellow('未发现项目：'+item))
            resolve(true)
          }
          readProject(item, r=>{
            data = data.concat(r)
            setTimeout(() => {
              resolve(true)
            }, 500);
          })
        })
      })
    )
  })
  Promise.all(promises).then(res=>{
    console.log(chalk.green('\n读取完成'))
    clearInterval(timer)
    write(data)
  })
}