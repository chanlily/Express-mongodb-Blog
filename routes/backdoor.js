var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var mutipart= require('connect-multiparty');
var mutipartMiddeware = mutipart();
var formidable = require('formidable');

router.get('/userList', function (req, res, next) {
    var user = global.dbHandel.getModel('user');
    user.find({}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("暂无用户");
            res.send(404);
        }
        else {
            console.log("doc:" + doc);
            console.log("用户列表查询成功");
        }
        res.render('backdor/userList', {title: '用户列表',post:doc});
    });
});
router.get('/passageList', function (req, res, next) {
    var passage = global.dbHandel.getModel('passage');
    passage.find({}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("暂无文章");
            res.send(404);
        }
        else {
            console.log("doc:" + doc);
            console.log("文章查询成功");
        }
        res.render('backdor/passageList', {title: '文章列表',post:doc});
    });
});