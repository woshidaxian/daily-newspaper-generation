const CONFIG = require('./config/config')
const chalk = require('chalk')
const fs = require('fs')
const readProject = require('./src/read')
const write = require('./src/write')

if(CONFIG.projectList.length == 0){
  console.log(chalk.red('No project'))
}else{
  main()
}

async function main() {
  let promises = []
  let data = []
  let i = 0
  CONFIG.projectList.forEach((item)=>{
    promises.push(
      new Promise((resolve, reject) => {
        fs.access(item, err=>{
          if(err){
            console.log(chalk.yellow('未发现项目：'+item))
            resolve(true)
          }
          console.log(`读取项目【${item}】`)
          readProject(item).then(res=>{
            data = data.concat(res)
            resolve(true)
          }).catch(err=>{
            resolve(true)
          })
        })
      })
    )
  })
  Promise.all(promises).then(res=>{
    console.log(chalk.green('读取完成'))
    write(data)
  })
}