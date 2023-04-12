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
    }
  }
});

router.get('/', function (req, res, next) {
  if(!req.session.login) {
    res.render('lockin', {
      title: '就讀意願調查系統',
    });
  } else {
    res.render('main', {
      title: '就讀意願調查系統',
      login: req.session.login,
      admin: req.session.admin,
    });
  }
});

router.get('/logout',(req, res, next) => {
  req.session.destroy(() => {
    res.send('您已成功登出系統！<a href="/">回到首頁</a>')
  })
});

router.post('/', upload.any(),function (req, res, next) {
  let account = req.body.account.split('/');

  if(account.length >= 2 && !(['fa249','fz083','ot088'].includes(account[1]))) {
    res.set({
      'Content-Type': 'application/json',
    }).send(JSON.stringify({
      errMsg: '登入失敗，沒有系統權限。',
      result: 0
    }))
    return ;
  }

  soap.createClient(process.env.SOAP_ADURL, function (err, client) {
    client.GetAeustAuthenticationConnect({
      Account: account.length >= 2 ? account[1] : account[0] ,
      Password: req.body.password
    }, function (err, result) {
      if (result.GetAeustAuthenticationConnectResult === 'True 登入成功') {
        let paramter = { replacements: {account: account[0]} }
        sequelize.query("SELECT * FROM [ARCHIVES].[dbo].[v_ref_assetAndMasrt] WHERE as_Sys_Account LIKE :account ORDER BY odr DESC;", paramter)
          .then(function (DataList) {                 
            if(DataList[0].length > 0) {
              req.session.account =  DataList[0][0].as_Sys_Account
              req.session.username =  DataList[0][0].as_CName
              req.session.dept = DataList[0][0].as_OitCode
              req.session.admin = DataList[0][0].as_OitCode === 'AL' ? true : false;      
              req.session.login = true
              res.set({
                'Content-Type': 'application/json',
              }).send(JSON.stringify({
                errMsg: '登入成功。',
                result: 1
              }))
            } else {
              res.set({
                'Content-Type': 'application/json',
              }).send(JSON.stringify({
                errMsg: '登入失敗，沒有系統權限。',
                result: 0
              }))
            }
          })
          .catch(err => {
            console.dir(err);
            res.set({
              'Content-Type': 'application/json'
            }).send(JSON.stringify({
              errMsg: 'API發生錯誤。',
              result: 0
            }))
          });
      } else {
        res.set({
          'Content-Type': 'application/json',
        }).send(JSON.stringify({
          errMsg: '帳號密碼錯誤。',
          result: 0
        }));
      }
    });
  });
});

module.exports = router;