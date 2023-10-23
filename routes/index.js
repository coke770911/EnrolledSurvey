var express = require('express');
var router = express.Router();
var multer  = require('multer')
var upload = multer()
const csv = require('csvtojson');
const Null = require('tedious/lib/data-types/null');

const {
  Sequelize
} = require('sequelize');
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: false
    }
  }
});

/**
 * 維修頁面 換path
 */
/*
router.all('/', function (req, res, next) {
  res.render('pause',{title: '亞東科技大學 就讀意願調查'});
});
*/

//英文網頁
router.get('/en', function (req, res, next) {
  /*
  res.render('indexall', {
    title: '亞東科技大學 就讀意願調查',
  });
  */
  res.render('index', {
    title: '亞東科技大學 就讀意願調查',
  });
});

//主要資料填寫畫面
router.get('/', function (req, res, next) {
  let enterdeptlist = [
  {
    val: '1MT',
    name: '日間部四技材料織品服裝系'
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

  const converter = csv() 
    .fromFile('./public/cache/high.csv')
    .then((json) => {
      res.render('index', {
        title: '亞東科技大學 就讀意願調查',
        list: json,
        deptlist: enterdeptlist
      });
    });
});

//先確認重複填的部分
router.post('/getCheckUser', upload.any(),function (req, res, next) {
  let birthdayStr = '';
  birthdayStr += (Number(req.body.birthYear) - 1911) >= 100 ? (Number(req.body.birthYear) - 1911).toString() : '0' + (Number(req.body.birthYear) - 1911).toString() 
  birthdayStr += (Number(req.body.birthMonth) >= 10) ? req.body.birthMonth.toString() : '0' + req.body.birthMonth.toString() 
  birthdayStr += (Number(req.body.birthday) >= 10) ? req.body.birthday.toString() : '0' + req.body.birthday.toString() 
  
  let paramter = {
    replacements: {
      es_stdname: req.body.stdname,
      es_birthday: birthdayStr,
    }
  }

  sequelize.query("SELECT COUNT([es_stdname]) AS row_count FROM [ARCHIVES].[dbo].[tb_EnrolledSurvey] WHERE es_stdname LIKE :es_stdname AND es_birthday = :es_birthday AND [es_is_del] = 0", paramter)
    .then(function (DataList) {
      console.dir(DataList)
      res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: DataList,result: 1}))
    })
    .catch(err => {
      res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: [],errMsg: 'API error。',result: 0}))
    });
  
});


// 送出資料
router.post('/', upload.any(), async (req, res, next) => {
  let birthdayStr = '';
  birthdayStr += (Number(req.body.birthYear) - 1911) >= 100 ? (Number(req.body.birthYear) - 1911).toString() : '0' + (Number(req.body.birthYear) - 1911).toString() 
  birthdayStr += (Number(req.body.birthMonth) >= 10) ? req.body.birthMonth.toString() : '0' + req.body.birthMonth.toString() 
  birthdayStr += (Number(req.body.birthday) >= 10) ? req.body.birthday.toString() : '0' + req.body.birthday.toString() 

  if(birthdayStr.length != 7) {
    res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: [],errMsg: '生日未填寫,Birthday input error',result: 0}));
    return;
  }
  
  let StrChkArr = Object.values(req.body)
  for(i = 0; i < StrChkArr.length ; i++) {
    if(StrChkArr[i].includes('=') || StrChkArr[i].includes('--')) {
      res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: [],errMsg: '輸入資料請勿輸入含有(= --)相關符號。',result: 0}))
      return
    }
  }

  let paramter = {
    replacements: {
      es_school: req.body.school,
      es_dept: req.body.dept,
      es_stdtype: req.body.stdtype,
      es_stdname: req.body.stdname,
      es_phone: req.body.phone,
      es_birthday: birthdayStr,
      es_email: req.body.email,
      es_lineid: req.body.lineid,
      es_enterdept1: req.body.entertype1,
      es_enterdept2: req.body.entertype2,
      es_reason: Array.isArray(req.body.reason) ? req.body.reason.join() : req.body.reason,
      es_ext_reason: req.body.ext_reason,
      es_memo: req.body.es_memo,
      es_ip_address: req.socket.remoteAddress
    }
  }

  sequelize.query("[ARCHIVES].[dbo].[sp_insertEnrolledSurvey] :es_school ,:es_dept ,:es_stdtype,:es_stdname ,:es_phone, :es_birthday,:es_email ,:es_lineid ,:es_enterdept1 ,:es_enterdept2 ,:es_reason ,:es_ext_reason ,:es_memo ,:es_ip_address;", paramter)
    .then(function (DataList) {
      console.dir(DataList)
      res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: DataList,result: 1}))
    })
    .catch(err => {
      console.dir(err)
      res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: [],errMsg: 'API發生錯誤。',result: 0}))
    });
});

module.exports = router;
