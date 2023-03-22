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
        const startTime = new Date(moment().format('YYYY-MM-DD 00:00:00')).getTime() - (CONFIG.day-1)*24*60*60*1000
        const endTime = new Date(moment().format('YYYY-MM-DD 23:59:59')).getTime()
        let n = x.date()
        let own = CONFIG.username.indexOf(x.author().name())==-1?false:true
        return n >= startTime && n <= endTime && own
      })
      .map(async x => {
        await getBranchByCommit(repo, x, res => {
          // 构建日报信息集
          if(res){
            selfCommits.push({
              msg: x.message(),
              author: x.author().name(),
              time: moment(x.date()).format('YYYY-MM-DD HH:mm:ss'),
              ref: res,
              id: x.id().toString()
            })
          }else{
            return
          }
        })
      })
  ).then(() => {
    callback(selfCommits)
    selfCommits = []
  })
}

// async function getBranchByCommit(repo, commit) {
//   const branchRefs = await repo.getReferences();
//   const branchHeads = branchRefs.filter(ref => ref.isBranch());
//   const branchNames = [];
//   for (let i = 0; i < branchHeads.length; i++) {
//     const branchHead = branchHeads[i];
//     const branchCommit = await repo.getBranchCommit(branchHead.name());
//     if (commit.id().equal(branchCommit.id())) {
//       branchNames.push(branchHead.name());
//     }
//   }
//   return branchNames[0];
// }

async function getBranchByCommit(repo, commit, callback) {
  const branchRefs = await repo.getReferences();
  const branchHeads = branchRefs.filter(ref => ref.isBranch());
  const branchNames = [];
  for (let i = 0; i < branchHeads.length; i++) {
    const branchHead = branchHeads[i];
    const branch = await repo.getBranch(branchHead.name());
    const revwalk = repo.createRevWalk();
    revwalk.push(branch.target());
    const commits = await revwalk.getCommitsUntil(c => true)
    Promise.all(
      commits.map(cd=>{
        if(cd.id().equal(commit.id())){
          branchNames.push(branchHead.name())
        }
      })
    ).then(()=>{
      callback(branchNames[0])
    })
    
  }
}


module.exports = readProject