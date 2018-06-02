var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('devlog', ['users']);
var fileupload = require('fileupload').createFileUpload('public/img').middleware;
var fs = require('fs');
var path = require('path');
var formidable=require('formidable');
const uuidV1=require('uuid/v1');


//Login Page - Get
router.get('/login', function(req, res) {
   
    res.render('login');
});

//Register Page - Get
router.get('/register', function(req, res) {
    res.render('register');
});

//Register - POST
router.post('/register', function(req, res) {
    //Get form values
    var email = req.body.email;
    var password1 = req.body.password1;
    var password2 = req.body.password2;

    //Validation
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Please use a valid email').isEmail();
    req.checkBody('password1', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password2);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            email: email,
            password1: password1,
            password2: password2
        });
    } else {
        var newUser = {
            email: email,
            password: password1,
            bio:"",
            profile_pic:""
        }

        db.users.insert(newUser, function(err, doc) {
            if (err) {
                res.send(err);
            } else {
                console.log('user added...');

                //Success message
                req.flash('success', 'You are successfully registered, login to continue..');

                //Redirect after register
                res.location('/');
                res.redirect('/');
            }
             
        })
    }
});


//Login - POST
router.post('/login',
    function(req, res) {
        console.log(req.body.email);
        console.log(req.body.password);

        db.users.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                res.redirect('/users/login');
                return;    
            }
            if (!user) {
                res.redirect('/users/login');
                return;
            
            }
            
            if(user.password == req.body.password){
                console.log("Authenication successfully");
                res.render('index',{user:user});    //looks for actual js page and renders it
                return
            }else {
                    res.redirect('/users/login');   //function call that displays message
                    return;
            }
        });
        
    });



router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'You have logged out');
    res.redirect('/users/login');
});


router.post('/upload', fileupload, function(req, res) {
    var filePath = null;
    // create an incoming form object
    var form = new formidable.IncomingForm();
    
            
    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '../public/img');


    form.on('field', function(field, value) {
        fileParser(value);
    });

    function fileParser(value) {

        form.on("file", function(field, file) {
            filePath = path.join(form.uploadDir, file.name);

            var randFilename = uuidV1() + "." + file.name.split(".")[1];
            fs.rename(file.path, path.join(form.uploadDir, randFilename));
            
            var finalPath = form.uploadDir + "\\" + randFilename;

            
            db.users.update(
            {
                email:value
            },
            {
                $set:{
                    "profile_pic":randFilename
                }
            },
            {
                upsert: true
            });
            

        });
    }

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });


    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        res.redirect('/');
    });

    // parse the incoming request containing the form data
    form.parse(req);

});

router.post('/bio', fileupload, function(req, res) {
        console.log(req.body.bio)

         db.users.update(
            {
                email:req.body.email
            },
            {
                $set:{
                    "bio":req.body.bio
                }
            },
            {
                upsert: true
            });
         res.redirect("/");
    });

module.exports = router;