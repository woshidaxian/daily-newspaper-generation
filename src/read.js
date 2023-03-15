const Git = require('nodegit')
const moment = require('moment')
const CONFIG = require('./../config/config')

async function readProject(project, callback){
  let selfCommits = []
  const repo = await Git.Repository.open(project)
  const walker = await Git.Revwalk.create(repo)
  walker.pushGlob('*')
  const commits = await walker.getCommitsUntil(c=>true)
  Promise.all(
    commits
      .filter(x=>{
        // 筛选出本人当天提交记录，在/config/config.js中配置username，支持多个
        const startTime = new Date(moment().format('YYYY-MM-DD 00:00:00')).getTime()
        const endTime = new Date(moment().format('YYYY-MM-DD 23:59:59')).getTime()
        let n = x.date()
        let own = CONFIG.username.indexOf(x.author().name())==-1?false:true
        return n >= startTime && n <= endTime && own
      })
      .map(async x => {
        // 构建日报信息集
        selfCommits.push({
          msg: x.message(),
          author: x.author().name(),
          time: moment(x.date()).format('YYYY-MM-DD HH:mm:ss'),
          ref: await getBranchByCommit(repo, x)
        })
      })
  ).then(() => {
    callback(selfCommits)
    selfCommits = []
  })
}

async function getBranchByCommit(repo, commit) {
  const branchRefs = await repo.getReferences();
  const branchHeads = branchRefs.filter(ref => ref.isBranch());
  const branchNames = [];
  for (let i = 0; i < branchHeads.length; i++) {
    const branchHead = branchHeads[i];
    const branchCommit = await repo.getBranchCommit(branchHead.name());
    if (commit.id().equal(branchCommit.id())) {
      branchNames.push(branchHead.name());
    }
  }
  return branchNames[0];
}

module.exports = readProject