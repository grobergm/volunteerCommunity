var express=require("express"),
	router= express.Router(),
	mongoose=require("mongoose"),
	passport=require("passport"),
	LocalStrategy= require("passport-local"),
	Volunteer=require("../models/volunteer"),
	Organization=require("../models/organization"),
	Event=require("../models/event");

router.get("/", function(req,res){
	res.render("landing")
});

router.get("/help", (req,res)=>{
	res.render("help");
});

router.get("/volunteers/login", function(req,res){
	res.render("volunteers/login")
});
// t'would be great if this redirected to profile, but currentUser not defined yet.... find?
router.post("/volunteers/login", 
	passport.authenticate("volunteers",
		{successRedirect:`/volunteers`,
		failureRedirect:"/volunteers"
		}), function(req,res){
});

router.get("/organizations/login", function(req,res){
	res.render("organizations/login")
});
// t'would be great if this redirected to profile, but currentUser not defined yet.... find?
router.post("/organizations/login", 
	passport.authenticate("organizations",
		{successRedirect:'/organizations',
		failureRedirect:"/organizations"
		}), function(req,res){
});

router.get("/logout", function(req,res){
	req.logout();
	res.redirect("/");
});

module.exports=router;