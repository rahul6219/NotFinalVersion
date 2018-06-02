var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');

router.get('/',function(req,res){
		var returnValue;
		var output= '';
		for (var property in req.user){
			output+= property+ ':' + req[property]+ ';';

		}

		console.log("user "+ output);
		if(req.isAuthenticated())
		{	
			res.render('index');
		} else{
			  res.redirect('/users/login');
		}
});


module.exports = router;