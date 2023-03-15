const moment = require('moment');
const fs = require('fs');
const chalk = require('chalk');
const OUT = './output/' + moment().format('YYYY-MM-DD') + '.txt'


async function write(data){
  let log = {}
  await data.forEach(item=>{
    if(log[item.ref]){
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
        console.log('日志已生成于' + OUT)
      }
    })
  })
}

module.exports = write