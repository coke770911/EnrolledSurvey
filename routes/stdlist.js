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

//檢查登入
router.all('/*',function (req, res, next) {
  if(!req.session.login) {
    res.render('lockin', {
      title: '就讀意願調查系統',
      login: req.session.login
    });
  } else {
    next()
  }
});

let enterdeptlist = [
  {
    val: '1MT',
    name: '日間部四技材料與纖維系'
  },
  {
    val: '1DN',
    name: '日間部四技工商業設計系'
  },
  {
    val: '1ME',
    name: '日間部四技機械工程系'
  },
  {
    val: '1CE',
    name: '日間部四技通訊工程系'
  },
  {
    val: '1ET',
    name: '日間部四技電子工程系'
  },
  {
    val: '1EE',
    name: '日間部四技電機工程系'
  },
  {
    val: '1IM',
    name: '日間部四技工業管理系'
  },
  {
    val: '1HA',
    name: '日間部四技醫務管理系'
  },
  {
    val: '1MI',
    name: '日間部四技資訊管理系'
  },
  {
    val: '1MD',
    name: '日間部四技行銷與流通管理系'
  },
  {
    val: '1NS',
    name: '日間部四技護理系'
  },
  {
    val: '2NS',
    name: '日間部二技護理系'
  },
  {
    val: 'RNS',
    name: '進修部二技護理系'
  }
  ]

router.get('/view', function (req, res, next) {
    res.render('stdlist', {
      title: '就讀意願調查系統',
      login: req.session.login,
      admin: req.session.admin,
      deptlist: enterdeptlist ,
    });
});

router.post('/', upload.any(),function (req, res, next) {
  let paramter = {
    replacements: {
      es_no: 0,
      es_enterdept: req.session.dept,
      sdate: req.body.sdate ? req.body.sdate.replace('T', ' ').replace('Z', '') + ' 00:00:00': '' ,
      edate: req.body.edate ? req.body.edate.replace('T', ' ').replace('Z', '') + ' 23:59:59': '' ,
    }
  }

  sequelize.query("[ARCHIVES].[dbo].[getEnrolledSurveyData] :es_no,:es_enterdept,:sdate,:edate;", paramter)
  .then(function (DataList) {                 
    if(DataList[0].length > 0) {
      res.set({'Content-Type': 'application/json',}).send(JSON.stringify({data:DataList[0],errMsg: '搜尋成功。',result: 1}))
    } else {
      res.set({'Content-Type': 'application/json',}).send(JSON.stringify({data: [],errMsg: '查無資料。', result: 1}))
    }
  })
  .catch(err => {
    res.set({'Content-Type': 'application/json'}).send(JSON.stringify({errMsg: 'API發生錯誤。',result: 0}))
  }); 
});


router.put('/', upload.any(),function (req, res, next) {
  let paramter = {
    replacements: {
      es_no: req.body.es_no,
      es_remark: req.body.es_remark,
      retagdept: req.body.retagdept,
      es_is_none: req.body.es_is_none || 1,
    }
  }
 
  sequelize.query("[dbo].[sp_updateEnrolledSurvey] :es_no ,:es_remark ,:retagdept ,:es_is_none", paramter)
    .then(function (DataList) {          
      if(DataList[0].length > 0) {
        res.set({'Content-Type': 'application/json',}).send(JSON.stringify({data:DataList[0],errMsg: '更新成功。',result: 1}))
      } else {
        res.set({'Content-Type': 'application/json',}).send(JSON.stringify({data: [],errMsg: '查無此紀錄。', result: 1}))
      }
    })
    .catch(err => {
      res.set({'Content-Type': 'application/json'}).send(JSON.stringify({errMsg: 'API發生錯誤。',result: 0}))
    });
});

       
router.delete('/', upload.any(),function (req, res, next) {
  let paramter = {
    replacements: {
      es_no: req.body.es_no
    }
  }
  sequelize.query("UPDATE [ARCHIVES].[dbo].[tb_EnrolledSurvey] SET [es_is_del] = 1 , [es_modify_datetime] = GETDATE() WHERE [es_no] = :es_no SELECT @@ROWCOUNT AS 'rowCount'", paramter)
    .then(function (DataList) {          
      if(DataList[0].length > 0) {
        res.set({'Content-Type': 'application/json',}).send(JSON.stringify({data:DataList[0],errMsg: '刪除成功。',result: 1}))
      } else {
        res.set({'Content-Type': 'application/json',}).send(JSON.stringify({data: [],errMsg: '查無此紀錄。', result: 1}))
      }
    })
    .catch(err => {
      res.set({'Content-Type': 'application/json'}).send(JSON.stringify({errMsg: 'API發生錯誤。',result: 0}))
    });
});

module.exports = router;
