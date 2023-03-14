const moment = require('moment');
const fs = require('fs');
const chalk = require('chalk');
const OUT = './output/' + moment().format('YYYY-MM-DD') + '.txt'


async function write(data){
  console.log(OUT)
  fs.access('./output', fs.constants.F_OK, err=>{
    if(err){
      fs.mkdirSync('./output')
    }
    fs.writeFile(OUT, moment().format('YYYY-MM-DD') + '\n'+ JSON.stringify(data), err => {
      if (err) {
        console.log(chalk.red(err))
      } else {
        console.log('日志已生成与' + OUT)
      }
    })
  })
}


module.exports = write