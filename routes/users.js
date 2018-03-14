var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/check').checkLogin;
/* GET users listing. */
router.get('/', function(req, res, next) {
    var tname = "";
    if(req.cookies.user == null){
        return res.redirect("/login");
    }
    else{
        tname = req.cookies.user.name;
        var password = req.cookies.user.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    res.render('users', { title: 'Express'});
});
router.post('/',function(req,res,next){
    var title = req.body.title;
    var file = req.body.file.path.split(path.sep).pop();
    var content = req.body.content;
    var author = req.cookies.user.name;
    var passage = global.dbHandel.getModel('passage');
    passage.findOne({title: title},function(err,doc){
        // 同理 /login 路径的处理方式
        if(err){
            console.log("网络异常错误！");
            console.log(err);
            res.send(500);
            //req.session.error =  '网络异常错误！';
        }else if(doc){
            //req.session.error = '用户名已存在！';
            console.log("文章已存在！");
            res.send(404);
        }else{
            passage.create({
                // 创建一组user对象置入model
                title: title,
                content: content,
                coverImg:file,
                author:author
            },function(err,doc){
                if (err){
                    console.log("发布文章失败！");
                    console.log(err);
                    res.send(404);
                } else {
                    console.log("发布文章成功！");
                    res.send(req.session.passage);
                    passage = doc.ops[0];
                    res.redirect('/posts/${passage._id}');
                    res.end();
                }
            });
        }
    });
});
router.get('/posts', function (req, res, next) {
    res.send('主页');
});
// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
    res.send('发表文章页');
});
router.post('/create', checkLogin, function (req, res, next) {
    res.send('发表文章');
});
router.get('/:postId', function (req, res, next) {
    res.send('文章详情页');
});
// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
    res.send('更新文章页');
});
// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
    res.send('删除文章');
});
module.exports = router;
