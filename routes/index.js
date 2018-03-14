var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var mutipart= require('connect-multiparty');
var mutipartMiddeware = mutipart();
var formidable = require('formidable');

function hashPW(pwd){
    var textChunk = JSON.stringify(pwd);
    var password = crypto.createHash('sha1').update(textChunk+"");
    return password.digest('hex');
}

function upload(res,req,next) {
    var tmp_path = ""+req.files.file.path;
    var target_path = './public/uploads/' + "123" + req.files.file.name;
    var pic_name = "123" + req.files.file.name;
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // 删除临时文件夹文件,
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            // res.send('File uploaded to: ' + target_path + ' - ' + req.files.file                               .size + ' bytes');
        });
    });
    return pic_name;
}
var iname = "";
var tname = "";
var title = "";
var search = "";
var arr = {};

function getClassList(res,req,next){
    var className = global.dbHandel.getModel('className');
    className.find({}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("暂无分类");
            res.send(404);
        }
        else {
            console.log("doc:" + doc);
            console.log("分类查询成功");
            arr = doc;
        }
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.cookies.user) {
        iname = req.cookies.user.name;
        res.locals.name = iname;
    }
    getClassList();
    title='首页';
    var passage = global.dbHandel.getModel('passage');
    passage.find({}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("该文章不存在");
            res.send(404);
        }
        else {
            // console.log("doc:"+doc);
            console.log("查询文章成功");
            res.render('index', {title:title, post: doc, name: iname,arr:arr,search:search});
        }
    });
});
router.get('/passageList/:classId', function(req, res, next) {
    if (req.cookies.user) {
        iname = req.cookies.user.name;
        res.locals.name = iname;
    }
    var classId = req.params.classId;
    var passage = global.dbHandel.getModel('passage');
    getClassList();
    for(r=0;r<arr.length;r++){
        if(classId == arr[r].classId){
            title = arr[r].className;
        }
        else{
            title = '首页';
        }
    }
    if(classId == "*"){
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
                for ( i = 0; i< doc.length;i++){
                    for(r=0;r<arr.length;r++){
                        if(doc[i].className == arr[r].classId){
                            doc[i].className = arr[r].className;
                        }
                    }
                }
                //console.log("doc:" + doc);
                console.log("文章查询成功");
                res.render('passageList', {title: title,name: tname, post: doc,arr:arr,search:search});
            }
        });
    }
    else{
        passage.find({className:classId}, function (err, doc) {
            if (err) {
                console.log("服务器连接失败");
                res.send(500);
            }
            else if (!doc) {
                console.log("暂无文章");
                res.send(404);
            }
            else {
                for ( i = 0; i< doc.length;i++){
                    for(r=0;r<arr.length;r++){
                        if(doc[i].className == arr[r].classId){
                            doc[i].className = arr[r].className;
                        }
                    }
                }
                //console.log("doc:" + doc);
                console.log("文章查询成功");
                res.render('passageList', {title: title,name: iname, post: doc,arr:arr,search:search});
            }
            //res.render('backdor/passageList', {title: '文章列表',post:doc,arr:arr});
        });
    }
});

router.get('/search/:search',function (req,res,next) {
    if (req.cookies.user) {
        iname = req.cookies.user.name;
        res.locals.name = iname;
    }
    var search = req.params.search;
    getClassList();
    var passage = global.dbHandel.getModel('passage');
    passage.find({$or:[{className:{$regex:search}},{title:{$regex:search}},{content:{$regex:search}},{author:{$regex:search}}]}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("查询无相关文章");
            res.send(404);
        }
        else {
            for ( i = 0; i< doc.length;i++){
                for(r=0;r<arr.length;r++){
                    if(doc[i].className == arr[r].classId){
                        doc[i].className = arr[r].className;
                    }
                }
            }
            title = "查询"+search;
            //console.log("文章查询成功");
            res.render('passageList', {title: title,name: iname, post: doc,arr:arr,search:search});
        }
    });
});

router.get('/login',function(req, res) {
    title = '用户登录';
    res.render('login', {title: title,message:""});
});
router.post('/login',function(req, res) {
    var uname = req.body.uname;
    var upassword = req.body.upwd;
    var upass= hashPW(upassword);
    var user = global.dbHandel.getModel('user');
    user.findOne({name:uname},function(err,doc){
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            //查询不到用户名匹配信息，则用户名不存在
            //    状态码返回404
            console.log("用户不存在");
            console.log("doc:"+doc);
            return res.redirect('/login');
            res.send(404);
        }
        else if(upass != doc.password){
                console.log(doc);
                //查询到匹配用户名的信息，但相应的password属性不匹配
                console.log("密码错误");
                //res.send(404);
        }
        else{
                console.log("登录成功");
                //req.flash('message', '登录成功');
                console.log("doc:"+doc);
                res.cookie('user', doc, {maxAge:  60000});
                //获取错误信息
        }
        return res.redirect('home');
    });
});
router.get('/register', function(req, res) {
  res.render('register', { title: 'User register' });
});
router.post('/register', function(req, res){
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    var upaswd  = hashPW(upwd);
    var user = global.dbHandel.getModel('user');
    console.log("网络异常错误1！");
    user.findOne({name: uname},function(err,doc){
        // 同理 /login 路径的处理方式
        if(err){
            console.log("网络异常错误！");
            console.log(err);
            res.send(500);
            //req.session.error =  '网络异常错误！';
        }else if(doc){ 
            //req.session.error = '用户名已存在！';
            console.log("用户名已存在！");
            res.send(404);
        }else{
            user.create({
                // 创建一组user对象置入model
                name: uname,
                password: upaswd
            },function(err,doc){ 
                 if (err){
                     console.log("注册失败！");
                     console.log(err);
                     res.send(404);
                    } else {
                        console.log("注册成功！");
                        //req.flash('message', '注册成功');
                        //req.session.error = "用户名创建成功！";
                        res.send(req.session.user);
                        res.end();
                    }
                  });
        }
    });
});

router.get('/home',function(req, res) {
    getClassList();
    if(req.cookies.user){
        iname = req.cookies.user.name;
        res.locals.name = iname;
    }
    else{
        return res.redirect('/login');
    }
    title='用户中心';
	res.render('home', {title: title,name: iname,arr:arr,search:search});
});

router.get('/layout',function(req, res) {
    var passage = global.dbHandel.getModel('passage');
    if(req.cookies.user == null){
        return res.redirect("/login");
    }
    else{
        iname = req.cookies.user.name;
        var password = req.cookies.user.password;
        res.locals.name = iname;
        res.locals.password = password;
        title = '个人中心' + iname;
    }
    title='我的发布';
    getClassList();
    passage.find({author:iname}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("暂无分类");
            res.send(404);
        }
        else {
            console.log("doc:" + doc);
            console.log("分类查询成功");
        }
        res.render('layout', {title:title ,post:doc,name: iname,arr:arr,search:search});
    });
});

router.get('/logout', function(req, res) {
    res.clearCookie("user");
    // res.redirect('/login');
});
router.get('/about',function(req, res) {
    getClassList();
    if (req.cookies.user) {
        iname = req.cookies.user.name;
        res.locals.name = iname;
    }
    title = '关于E-blog';
    res.render('About', {title: title,name: iname,arr:arr,search:search});
});
router.get('/change',function(req, res) {
    getClassList();
    if(req.cookies.user == null){
        return res.redirect("/login");
    }
    else{
        iname = req.cookies.user.name;
        var password = req.cookies.user.password;
        res.locals.name = iname;
        res.locals.password = password;
    }
    title = '修改密码';
    res.render('change', {title: title,name: iname,arr:arr,search:search});
});

router.post('/change',function(req, res) {
    var oldpassword = req.body.oldpassword;
    var upassword = req.body.upwd;
    var upass1= hashPW(oldpassword);
    var upass = hashPW(upassword);

    var uname = req.cookies.user.name;
    var user = global.dbHandel.getModel('user');
    user.findOne({name:uname},function(err,doc){
        if(err){
            console.log("服务器连接失败");
            console.log(err);
            res.send(500);
        }else if(upass1 != doc.password){
            console.log("密码错误");
            req.flash.message="用户不存在";
            return res.redirect('/login');
        }else{
            user.findOne({name:uname},function(err,doc){
                console.log(upass);
                doc.password=upass;
                doc.save();
                console.log("保存成功");
                // res.cookie('user', doc, {maxAge:  60000});
            });
            return res.redirect('/change');
        }
    });
});
/*添加文章*/
router.get('/passage', function(req, res, next) {
    if(req.cookies.user == null){
        return res.redirect("/login");
    }
    else{
        iname = req.cookies.user.name;
        var password = req.cookies.user.password;
        res.locals.name = iname;
        res.locals.password = password;
    }
    getClassList();
    title = '添加文章';
    res.render('passage', {title: title,name: iname,arr:arr,search:search});
});
router.post('/passage',function(req,res,next){
    var id = "";
    if(req.cookies.user == null){
        return res.redirect("/login");
    }
    else{
        id = req.cookies.user._id;
    }
    var title = req.body.title;
    var tmp_path = ""+req.files.file.path;
    var content = req.body.content;
    var author = req.cookies.user.name;
    var time = req.body.time;
    var className = req.body.className;
    var target_path = './public/uploads/' + id + req.files.file.name;
    var pic_name = id + req.files.file.name;
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // 删除临时文件夹文件,
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            // res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
        });
    });
    console.log(req.files.file);
    var passage = global.dbHandel.getModel('passage');
    passage.findOne({title: title},function(err,doc){
        // 同理 /login 路径的处理方式
        if(err){
            console.log("网络异常错误！");
            console.log(err);
            res.send(500);
            //req.session.error =  '网络异常错误！';
        }
        else if(doc){
            //req.session.error = '用户名已存在！';
            console.log("文章已存在！");
            res.send(404);
        }
        else{
            passage.create({
                // 创建一组user对象置入model
                time:time,
                className:className,
                title: title,
                content: content,
                coverImg:pic_name,
                author:author
            },function(err,doc){
                if (err){
                    console.log("发布文章失败！");
                    console.log(err);
                    res.send(404);
                } else {
                    console.log("发布文章成功！");
                    res.send(req.session.passage);
                    res.redirect('/show/'+doc.title);
                    res.end();
                }
            });
        }
    });
});
//
// router.post('/file-upload', function(req, res) {
//     var id = "";
//     if(req.cookies.user == null){
//         return res.redirect("/login");
//     }
//     else{
//         id = req.cookies.user._id;
//     }
//     // 获得文件的临时路径
//     console.log(req.files);
//     var tmp_path = ""+req.files.file.path;
//     // 指定文件上传后的目录 - 示例为"images"目录。
//     var target_path = './uploads/' + id + req.files.file.name;
//     // 移动文件
//     fs.rename(tmp_path, target_path, function(err) {
//         if (err) throw err;
//         // 删除临时文件夹文件,
//         fs.unlink(tmp_path, function() {
//             if (err) throw err;
//             // res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
//         });
//     });
// });
router.get('/show', function (req, res, next) {
    if (req.cookies.user) {
        iname = req.cookies.user.name;
        res.locals.name = iname;
    }
    getClassList();
    var passage = global.dbHandel.getModel('passage');
    passage.find({}, function (err, doc) {
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            console.log("该文章不存在");
            res.send(404);
        }
        else{
            console.log("doc:"+doc);
            console.log("查询文章成功");
        }
        title = '文章列表';
        res.render('show_list',{title: title,name: iname,arr:arr,search:search,post:doc});
    });
});
router.get('/show/:id', function (req, res, next) {
    if (req.cookies.user) {
        iname = req.cookies.user.name;
        res.locals.name = iname;
    }
    var id = req.params.id;
    getClassList();
    var passage = global.dbHandel.getModel('passage');
    passage.findOne({_id: id}, function (err, doc) {
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            console.log("该文章不存在");
            res.send(404);
        }
        else {
            title = doc.title;
            res.render('show', {doc: doc,title: title,name: iname,arr:arr,search:search});
        }
    });
});
router.get('/backdor', function (req, res, next) {
    console.log(req.cookies.admin);
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var passage = global.dbHandel.getModel('passage');
    var user = global.dbHandel.getModel('user');
    var userCounts = 0;
    var passageCounts = 0;
    var classCounts = 0;
    getClassList();
    user.find({},function (err,doc) {
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            console.log("暂无用户");
            userCounts = 0;
        }
        else{
            userCounts = doc.length;
            console.log(userCounts);
        }
    });
    passage.find({},function (err,doc) {
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            console.log("暂无用户");
            passageCounts = 0;
        }
        else{
            passageCounts = doc.length;
            console.log(passageCounts);
        }
    });
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
            for ( i = 0; i< doc.length;i++){
                for(r=0;r<arr.length;r++){
                    if(doc[i].className == arr[r].classId){
                        doc[i].className = arr[r].className;
                    }
                }
            }
            classCounts = arr.length;
            title = '后台管理首页';
            res.render('backdor/', {title: title,post:doc,arr:arr,passageCount:passageCounts,userCount:userCounts,classCount:classCounts,search:search});
        }
    }).limit(10);
});
router.get('/backdor/login', function (req, res, next) {
    res.render('backdor/login', {title: '后台用户登录'});
});
router.post('/backdor/login',function(req, res) {
    var uname = req.body.uname;
    var upassword = req.body.upwd;
    var upass= hashPW(upassword);
    var admin = global.dbHandel.getModel('admin');
    admin.findOne({name:uname},function(err,doc){
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            //查询不到用户名匹配信息，则用户名不存在
            //    状态码返回404
            console.log("用户不存在");
            return res.redirect('/backdor/login');
            res.send(404);
        }
        else if(upass != doc.password){
            console.log(doc);
            //查询到匹配用户名的信息，但相应的password属性不匹配
            console.log("密码错误");
            //res.send(404);
        }
        else{
            console.log("登录成功");
            //req.flash('message', '登录成功');
            console.log("doc:"+doc);
            res.cookie('admin', doc, {maxAge:  60000});
            //获取错误信息
        }
        return res.redirect('/backdor');
    });
});
router.get('/backdor/register', function(req, res) {
    res.render('backdor/register', { title: '后台用户注册' });
});
router.post('/backdor/register', function(req, res){
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    var upaswd  = hashPW(upwd);
    var admin = global.dbHandel.getModel('admin');
    console.log("网络异常错误1！");
    admin.findOne({name: uname},function(err,doc){
        // 同理 /login 路径的处理方式
        if(err){
            console.log("网络异常错误！");
            console.log(err);
            res.send(500);
            //req.session.error =  '网络异常错误！';
        }else if(doc){
            //req.session.error = '用户名已存在！';
            console.log("用户名已存在！");
            res.send(404);
        }else{
            admin.create({
                // 创建一组user对象置入model
                name: uname,
                password: upaswd
            },function(err,doc){
                if (err){
                    console.log("注册失败！");
                    console.log(err);
                    res.send(404);
                } else {
                    console.log("注册成功！");
                    //req.flash('message', '注册成功');
                    //req.session.error = "用户名创建成功！";
                    res.send(req.session.user);
                    res.end();
                }
            });
        }
    });
});

router.get('/backdor/Search/:search',function (req,res,next) {
    console.log(req.cookies.admin);
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var search = req.params.search;
    var passage = global.dbHandel.getModel('passage');
    getClassList();
    //{$or:[{className:search},{title: search},{content:search},{author:search}]}
    //{title:{$regex:search}}
    passage.find({$or:[{className:{$regex:search}},{title:{$regex:search}},{content:{$regex:search}},{author:{$regex:search}}]}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("查询无相关文章");
            res.send(404);
        }
        else {
            for ( i = 0; i< doc.length;i++){
                for(r=0;r<arr.length;r++){
                    if(doc[i].className == arr[r].classId){
                        doc[i].className = arr[r].className;
                    }
                }
            }
            console.log("doc:" + doc);
            console.log("文章查询成功");
            title = '文章列表';
            res.render('backdor/passageList', {title:title,name:tname,post:doc,arr:arr,search:search});
        }
    });
});
router.get('/backdor/userList', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    getClassList();
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
        title = '用户列表';
        res.render('backdor/userList', {title: title,name:tname,arr:arr,post:doc,search:search});
    });
});
router.get('/backdor/adminList', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    getClassList();
    var admin = global.dbHandel.getModel('admin');
    admin.find({}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("暂无用户列表");
            res.send(404);
        }
        else {
            console.log("doc:" + doc);
            console.log("用户列表查询成功");
        }
        title = '管理员用户列表';
        res.render('backdor/adminList', {title:title,arr:arr,name:tname,post:doc,search:search});
    });
});
router.get('/backdor/adminEdit/:id', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var id = req.params.id;
    getClassList();
    var admin = global.dbHandel.getModel('admin');
    admin.findOne({_id: id}, function (err, doc) {
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            console.log("该管理员不存在或已删除");
            res.send(404);
        }
        else{
            //var title = doc.className;
            console.log("查询分类成功");
            title = '管理员编辑';
            res.render('backdor/adminEdit', {title:title,name:tname,arr:arr,doc:doc,search:search});
        }
    });
});
router.post('/backdor/adminEdit/:id', function (req, res, next) {
    var id = req.params.id;
    var name = req.body.name;
    var password = req.body.password;
    var isAdmin = req.body.isAdmin;
    var whereStr = {"_id":id};  // 查询条件
    var updateStr;
    var updateArr={};
    if(req.body.isAdmin){
        updateArr.isAdmin = isAdmin;
    }
    if(req.body.name){
        updateArr.name = name;
    }
    if(req.body.password){
        updateArr.password = password;
    }
    updateStr = {$set: updateArr};
    var admin = global.dbHandel.getModel('admin');
    admin.updateOne(whereStr, updateStr, function(err, doc) {
        if (err){
            throw err;
        }
        else{
            //console.log(doc);
            console.log("文档更新成功");
            res.redirect('/backdor/adminList');
        }
    });
});
router.get('/backdor/adminDelete/:id', function (req, res, next) {
    var id = req.params.id;
    var admin = global.dbHandel.getModel('admin');
    admin.deleteOne({_id : id}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("文章已删除");
            res.send(404);
        }
        else {
            //console.log("doc:" + doc);
            console.log("文章删除成功");
        }
        res.redirect('/backdor/userList');
    });
});
router.get('/backdor/adminAdd', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    getClassList();
    title='添加管理员';
    res.render('backdor/adminAdd', { title: title,name:tname,arr:arr,search:search});
});
router.post('/backdor/adminAdd', function (req, res, next) {
    var uname = req.body.name;
    var upwd = req.body.password;
    var upaswd = hashPW(upwd);
    var admin = global.dbHandel.getModel('admin');
    admin.findOne({name: uname}, function (err, doc) {
        // 同理 /login 路径的处理方式
        if (err) {
            console.log("网络异常错误！");
            console.log(err);
            res.send(500);
            //req.session.error =  '网络异常错误！';
        } else if (doc) {
            //req.session.error = '用户名已存在！';
            console.log("用户名已存在！");
            res.send(404);
        } else {
            admin.create({
                // 创建一组user对象置入model
                name: uname,
                password: upaswd
            }, function (err, doc) {
                if (err) {
                    console.log("注册失败！");
                    console.log(err);
                    res.send(404);
                } else {
                    console.log("注册成功！");
                    //req.flash('message', '注册成功');
                    //req.session.error = "用户名创建成功！";
                    res.send(req.session.admin);
                    res.redirect('/backdor/adminList');
                }
            });
        }
    });
});
router.get('/backdor/userAdd', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    getClassList();
    title='添加用户';
    res.render('backdor/userAdd', { title:title,name:tname,arr:arr,search:search});
});
router.post('/backdor/userAdd', function (req, res, next) {
    var uname = req.body.name;
    var upwd = req.body.password;
    var upaswd = hashPW(upwd);
    var user = global.dbHandel.getModel('user');
    user.findOne({name: uname}, function (err, doc) {
        // 同理 /login 路径的处理方式
        if (err) {
            console.log("网络异常错误！");
            console.log(err);
            res.send(500);
            //req.session.error =  '网络异常错误！';
        } else if (doc) {
            //req.session.error = '用户名已存在！';
            console.log("用户名已存在！");
            res.send(404);
        } else {
            user.create({
                // 创建一组user对象置入model
                name: uname,
                password: upaswd
            }, function (err, doc) {
                if (err) {
                    console.log("注册失败！");
                    console.log(err);
                    res.send(404);
                } else {
                    console.log("注册成功！");
                    //req.flash('message', '注册成功');
                    //req.session.error = "用户名创建成功！";
                    res.send(req.session.user);
                    res.redirect('/backdor/userList');
                }
            });
        }
    });
});
router.get('/backdor/userDelete/:id', function (req, res, next) {
    var id = req.params.id;
    var user = global.dbHandel.getModel('user');
    user.deleteOne({_id : id}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("文章已删除");
            res.send(404);
        }
        else {
            //console.log("doc:" + doc);
            console.log("文章删除成功");
        }
        res.redirect('/backdor/userList');
    });
});
router.get('/backdor/passageList', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    getClassList();
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
            for ( i = 0; i< doc.length;i++){
                for(r=0;r<arr.length;r++){
                    if(doc[i].className == arr[r].classId){
                        doc[i].className = arr[r].className;
                    }
                }
            }
            //console.log("doc:" + doc);
            console.log("文章查询成功");
            title = '文章列表';
            res.render('backdor/passageList', {title: title,name: tname,post:doc,arr:arr,search:search});
        }
    });
});
router.get('/backdor/passageList/:classId', function (req, res, next) {
    var tname = "";
    console.log(req.cookies.admin);
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var classId = req.params.classId;
    var passage = global.dbHandel.getModel('passage');
    var arr = {};
    var className = global.dbHandel.getModel('className');
    className.find({}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("暂无分类");
            res.send(404);
        }
        else {
            console.log("doc:" + doc);
            console.log("分类查询成功");
            arr = doc;
        }
    });
    if(classId == "*"){
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
                for ( i = 0; i< doc.length;i++){
                    for(r=0;r<arr.length;r++){
                        if(doc[i].className == arr[r].classId){
                            doc[i].className = arr[r].className;
                        }
                    }
                }
                //console.log("doc:" + doc);
                console.log("文章查询成功");
                res.json(doc);
            }
            //res.render('backdor/passageList', {title: '文章列表',post:doc,arr:arr});
        });
    }
    else{
        passage.find({className:classId}, function (err, doc) {
            if (err) {
                console.log("服务器连接失败");
                res.send(500);
            }
            else if (!doc) {
                console.log("暂无文章");
                res.send(404);
            }
            else {
                for ( i = 0; i< doc.length;i++){
                    for(r=0;r<arr.length;r++){
                        if(doc[i].className == arr[r].classId){
                            doc[i].className = arr[r].className;
                        }
                    }
                }
                //console.log("doc:" + doc);
                console.log("文章查询成功");
                res.json(doc);
            }
            //res.render('backdor/passageList', {title: '文章列表',post:doc,arr:arr});
        });
    }
});
router.get('/backdor/classList', function (req, res, next) {
    var tname = "";
    console.log(req.cookies.admin);
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var className = global.dbHandel.getModel('className');
    className.find({}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("暂无分类");
            res.send(404);
        }
        else {
            console.log("doc:" + doc);
            console.log("分类查询成功");
        }
        res.render('backdor/classList', {title: '文章分类列表',post:doc});
    });
});
router.get('/backdor/classAdd', function (req, res, next) {
    var tname = "";
    console.log(req.cookies.admin);
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    title='添加分类';
    res.render('backdor/classAdd', { title: title,name: tname,arr:arr,search:search});
});
router.post('/backdor/classAdd', function (req, res, next) {
    var classId = req.body.classId;
    var classN = req.body.className;
    var className = global.dbHandel.getModel('className');
    className.findOne({classId: classId},function(err,doc){
        // 同理 /login 路径的处理方式
        if(err){
            console.log("网络异常错误！");
            console.log(err);
            res.send(500);
            //req.session.error =  '网络异常错误！';
        }
        else if(doc){
            //req.session.error = '用户名已存在！';
            console.log("分类已存在！");
            //res.send(404);
            res.redirect('/backdor/classAdd');
        }
        else{
            className.create({
                // 创建一组user对象置入model
                classId: classId,
                className:classN
            },function(err,doc){
                if (err){
                    console.log("发布文章失败！");
                    console.log(err);
                    res.send(404);
                } else {
                    console.log("发布文章成功！");
                    res.send(req.session.className);
                    res.redirect('/backdor/classList');
                    res.end();
                }
            });
        }
    });
});
router.get('/backdor/classEdit/:id', function (req, res, next) {
    var tname = "";
    console.log(req.cookies.admin);
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var id = req.params.id;
    var className = global.dbHandel.getModel('className');
    className.findOne({_id: id}, function (err, doc) {
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            console.log("该分类不存在或已删除");
            res.send(404);
        }
        else{
            console.log("查询分类成功");
            title=doc.className;
            res.render('backdor/classEdit', {title:title,doc:doc,name: tname,arr:arr,search:search});
        }
    });
});
router.post('/backdor/classEdit/:id', function (req, res, next) {
    var id = req.params.id;
    var classId = req.body.classId;
    var classN = req.body.className;
    var whereStr = {"_id":id};  // 查询条件
    var updateStr;
    var updateArr={};
    if(req.body.classId){
        updateArr.classId = classId;
    }
    if(req.body.className){
        updateArr.className = classN;
    }
    updateStr = {$set: updateArr};
    var className = global.dbHandel.getModel('className');
    className.updateOne(whereStr, updateStr, function(err, doc) {
        if (err){
            throw err;
        }
        else{
            //console.log(doc);
            console.log("文档更新成功");
            res.redirect('/backdor/classList');
        }
    });
});
router.get('/backdor/classDelete/:id', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var id = req.params.id;
    var className = global.dbHandel.getModel('className');
    className.deleteOne({_id : id}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("文章已删除");
            res.send(404);
        }
        else {
            //console.log("doc:" + doc);
            console.log("文章删除成功");
        }
        res.redirect('/backdor/classList');
    });
});
router.get('/backdor/delete/:id', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var id = req.params.id;
    var passage = global.dbHandel.getModel('passage');
    passage.deleteOne({_id : id}, function (err, doc) {
        if (err) {
            console.log("服务器连接失败");
            res.send(500);
        }
        else if (!doc) {
            console.log("文章已删除");
            res.send(404);
        }
        else {
            console.log("doc:" + doc);
            console.log("文章删除成功");
        }
        res.redirect('/backdor/passageList');
    });
});
router.get('/backdor/passageAdd', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var className = global.dbHandel.getModel('className');
    var arr = {};
    className.find({}, function (err, doc) {
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            console.log("该分类不存在或已删除");
            res.send(404);
        }
        else{
            console.log("查询分类成功");
            arr = doc;
            title='添加文章';
            res.render('backdor/passageAdd', { title: title,arr:doc,search:search,name:tname});
        }
    });
});
router.post('/backdor/passageAdd', function (req, res, next) {
    var title = req.body.title;
    var tmp_path = ""+req.files.file.path;
    var content = req.body.content;
    var author = req.body.author;
    var className = req.body.className;
    var time = req.body.time;
    var target_path = './public/uploads/' + "123" + req.files.file.name;
    var pic_name = "123" + req.files.file.name;
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // 删除临时文件夹文件,
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            // res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
        });
    });
    console.log(req.files.file);
    var passage = global.dbHandel.getModel('passage');
    passage.findOne({title: title},function(err,doc){
        // 同理 /login 路径的处理方式
        if(err){
            console.log("网络异常错误！");
            console.log(err);
            res.send(500);
            //req.session.error =  '网络异常错误！';
        }
        else if(doc){
            //req.session.error = '用户名已存在！';
            console.log("文章已存在！");
            res.send(404);
        }
        else{
            passage.create({
                // 创建一组user对象置入model
                title: title,
                content: content,
                coverImg:pic_name,
                author:author,
                time:time,
                className:className
            },function(err,doc){
                if (err){
                    console.log("发布文章失败！");
                    console.log(err);
                    res.send(404);
                } else {
                    console.log("发布文章成功！");
                    res.send(req.session.passage);
                    res.redirect('/backdor/view/'+doc.id);
                    res.end();
                }
            });
        }
    });
});
router.get('/backdor/json/:id', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var id = req.params.id;
    var content = "";
    var img = "";
    var title = "";
    var passage = global.dbHandel.getModel('passage');
    passage.findOne({_id: id}, function (err, doc) {
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            console.log("该文章不存在");
            res.send(404);
        }
        else{
            //res.locals.title = doc.title;
            content = doc.content;
            img = doc.coverImg;
            title = doc.title;
            // console.log(doc.coverImg);
            console.log("doc:"+doc);
            console.log("查询文章成功");
            res.json(doc);
        }
});
});
router.get('/backdor/view/:id', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var id = req.params.id;
    var content = "";
    var img = "";
    var title = "";
    var passage = global.dbHandel.getModel('passage');
    passage.findOne({_id: id}, function (err, doc) {
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            console.log("该文章不存在");
            res.send(404);
        }
        else{
            //res.locals.title = doc.title;
            content = doc.content;
            img = doc.coverImg;
            title = doc.title;
            // console.log(doc.coverImg);
            console.log("doc:"+doc);
            console.log("查询文章成功");
        }
        res.render('backdor/passageShow', {title:title,doc:doc,search:search,name:tname});
    });
});
router.get('/backdor/passageEdit/:id', function (req, res, next) {
    if(req.cookies.admin == null){
        return res.redirect("/backdor/login");
    }
    else{
        tname = req.cookies.admin.name;
        var password = req.cookies.admin.password;
        res.locals.name = tname;
        res.locals.password = password;
    }
    var id = req.params.id;
    var content = "";
    var img = "";
    var passage = global.dbHandel.getModel('passage');
    getClassList();
    passage.findOne({_id: id}, function (err, doc) {
        if(err){
            console.log("服务器连接失败");
            res.send(500);
        }
        else if(!doc){
            console.log("该文章不存在");
            res.send(404);
        }
        else{
            //res.locals.title = doc.title;
            className = doc.className;
            content = doc.content;
            img = doc.coverImg;
            title = doc.title;
            // console.log(doc.coverImg);
            //console.log("doc:"+doc);
            console.log("查询文章成功");
        }
        res.render('backdor/passageEdit', {title:title,doc:doc,arr:arr,search:search,name:tname});
    });
});
router.post('/backdor/passageEdit/:id', function (req, res, next) {
    var passage = global.dbHandel.getModel('passage');
    var id = req.params.id;
    var title = req.body.title;
    var content = req.body.content;
    var className = req.body.className;
    var author = req.body.author;
    var time = req.body.time;
    var pic_name;
    var whereStr = {"_id":id};  // 查询条件
    var updateStr;
    var updateArr = {"content":content};
    if(req.body.time){
        updateArr.time = time;
    }
    if(req.body.className){
        updateArr.className = className;
    }
    if(req.files.file.name){
        var tmp_path = ""+req.files.file.path;
        var target_path = './public/uploads/' + "123" + req.files.file.name;
        fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
            // 删除临时文件夹文件,
            fs.unlink(tmp_path, function() {
                if (err) throw err;
                // res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
            });
        });
        pic_name = "123" + req.files.file.name;
        updateArr.coverImg = pic_name;
    }
    if(req.body.author){
        updateArr.author = author;
    }
    if(req.body.title){
        updateArr.title = title;
    }
    updateStr = {$set: updateArr};
    passage.updateOne(whereStr, updateStr, function(err, doc) {
        if (err){
            throw err;
        }
        else{
            //console.log(doc);
            console.log("文档更新成功");
            res.redirect('/backdor/passageList');
        }
    });
});

module.exports = router;
