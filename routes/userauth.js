var express = require('express');
var router = express.Router();

const soap = require('soap');
var multer = require('multer')
var upload = multer()

const {
  Sequelize
} = require('sequelize');
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: false
    },
  }
});


router.all('/*',function (req, res, next) {
  if(!(req.session.login == 1)) {
    res.render('lockin', {
      title: '就讀意願調查系統',
      login: req.session.login
    });
  } else {
    next()
  }
});

router.get('/view', (req, res, next) => {
  let paramter = {
    replacements: {
      dept: req.session.dept
    }
  }
  const pormisefn = new Promise((resolve, reject) => {
    sequelize.query('[ARCHIVES].[dbo].[getEnrolledSurveyDeptList] :dept;',paramter)
      .then(function (DataList) {
      resolve({data: DataList,result: 1});
    })
    .catch(err => {
      resolve({data: [],errMsg: 'API發生錯誤。',result: 0});
    });
  })


  pormisefn.then((value) => {
    res.render('userauth', {
      title: '就讀意願調查系統',
      login: req.session.login,
      admin: req.session.admin,
      deptlist: value.data[0],
      is_deptlist: value.result ? true : false
    });
  });
  
});

router.get('/user',(req, res, next) => {
  let paramter = {
    replacements: {
      account: req.query.authacc
    }
  }
  sequelize.query("SELECT sb_SysAccount,sb_CName,sb_lvUnitCName FROM [OIT_Reference].[dbo].[tb_ref_staffBasic] WHERE sb_state = 1 AND sb_SysAccount = :account",paramter)
  .then(function (DataList) {
    res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: DataList[0],result: 1}))
  })
  .catch(err => {
    res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: [],errMsg: 'API發生錯誤。',result: 0}))
  });
})

router.post('/',upload.any(), (req, res, next) => {
  let paramter = {
    replacements: {
      account: req.body.authacc,
      deptset: req.body.deptset
    }
  }

  sequelize.query("INSERT INTO [ARCHIVES].[dbo].[tb_EnrolledSurveyAuth] ([esa_OitCode],[esa_Unitname],[esa_CName],[esa_Sys_Account]) SELECT :deptset,sb_lvUnitCName,sb_CName,sb_SysAccount FROM [OIT_Reference].[dbo].[tb_ref_staffBasic] WHERE sb_state = 1 AND sb_SysAccount = :account SELECT @@ROWCOUNT AS 'rowCount' ;",paramter)
  .then(function (DataList) {
    res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: DataList[0],result: 1}))
  })
  .catch(err => {
    res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: [],errMsg: 'API發生錯誤。',result: 0}))
  });
})


router.get('/',(req, res, next) => {
  let paramter = {
    replacements: {
      dept: req.session.dept
    }
  }
  sequelize.query("[ARCHIVES].[dbo].[getEnrolledSurveyAuthList] :dept;",paramter)
  .then(function (DataList) {
    res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: DataList[0],result: 1}))
  })
  .catch(err => {
    res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: [],errMsg: 'API發生錯誤。',result: 0}))
  });
})


router.delete('/',(req, res, next) => {
  let paramter = {
    replacements: {
      account: req.query.authacc
    }
  }
  sequelize.query("DELETE [ARCHIVES].[dbo].[tb_EnrolledSurveyAuth] WHERE [esa_Sys_Account] = :account SELECT @@ROWCOUNT AS 'rowCount' ;",paramter)
  .then(function (DataList) {
    res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: DataList[0],result: 1}))
  })
  .catch(err => {
    res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: [],errMsg: 'API發生錯誤。',result: 0}))
  });
})

module.exports = router;
