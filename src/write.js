const moment = require('moment');
const fs = require('fs');
const CONFIG = require('./../config/config');
const chalk = require('chalk');
const OUT = './output/' + moment().format('YYYY-MM-DD') + '_' + CONFIG.day + '天.txt'


async function write(data){
  // 去重
  let id = []
  let d = []
  for(let i = 0; i < data.length; i++){
    if(id.indexOf(data[i].id)==-1){
      id.push(data[i].id)
      d.push(data[i])
    }
  }
  
  let log = {}
  d.forEach(item=>{
    if (log[item.ref]){
      log[item.ref].push(item)
    }else{
      log[item.ref] = []
      log[item.ref].push(item)
    }
  })

  const str = await Object.keys(log).map((it, i)=>{
    return `${i+1}、${it.split('/')[2]}\n\t${log[it].map(log=>log.msg).join('\t')}`
  }).join('\n')
  writeFile(str)
}

function writeFile(data){
  fs.access('./output', fs.constants.F_OK, err=>{
    if(err){
      fs.mkdirSync('./output')
    }
    fs.writeFile(OUT, moment().format('YYYY-MM-DD HH:mm:ss') + '\n'+ data, err => {
      if (err) {
        console.log(chalk.red(err))
      } else {
        console.log('日报已生成于' + OUT)
      }
    })
  })
}

module.exports = write