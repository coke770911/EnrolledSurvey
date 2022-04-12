var express = require('express');
var router = express.Router();

var multer  = require('multer')
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
    }
  }
});
const csv = require('csvtojson');
const Null = require('tedious/lib/data-types/null');

/* GET home page. */
router.get('/', function (req, res, next) {
  let enterdeptlist = [{
    val: '2NS',
    name: '日間部二技護理系'
  },
  {
    val: '1DN',
    name: '日間部四技工商業設計系'
  },
  {
    val: '1IM',
    name: '日間部四技工業管理系'
  },
  {
    val: '1MD',
    name: '日間部四技行銷與流通管理系'
  },
  {
    val: '1MT',
    name: '日間部四技材料與纖維系'
  },
  {
    val: '1CE',
    name: '日間部四技通訊工程系'
  },
  {
    val: '1MI',
    name: '日間部四技資訊管理系'
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
    val: '1ME',
    name: '日間部四技機械工程系'
  },
  {
    val: '1HA',
    name: '日間部四技醫務管理系'
  },
  {
    val: '1NS',
    name: '日間部四技護理系'
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

router.post('/', upload.any(),function (req, res, next) {
  let paramter = {
    replacements: {
      es_school: req.body.school,
      es_dept: req.body.dept,
      es_stdname: req.body.stdname,
      es_phone: req.body.phone,
      es_email: req.body.email,
      es_lineid: req.body.lineid,
      es_enterdept: req.body.entertype,
      es_reason: Array.isArray(req.body.reason) ? req.body.reason.join() : req.body.reason,
      es_ext_reason: req.body.ext_reason,
      es_memo: req.body.es_memo,
    }
  }
  sequelize.query("[ARCHIVES].[dbo].[sp_insertEnrolledSurvey] :es_school ,:es_dept ,:es_stdname ,:es_phone ,:es_email ,:es_lineid ,:es_enterdept ,:es_reason ,:es_ext_reason ,:es_memo;", paramter)
    .then(function (DataList) {
      console.dir(DataList)
      res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: DataList,result: 1}))
    })
    .catch(err => {
      res.set({'Content-Type': 'application/json'}).send(JSON.stringify({data: [],errMsg: 'API發生錯誤。',result: 0}))
    });
});

module.exports = router;
