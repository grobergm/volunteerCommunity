var express=require("express"),
	router= express.Router(),
	mongoose=require("mongoose"),
	passport=require("passport"),
	LocalStrategy= require("passport-local"),
	Volunteer=require("../models/volunteer"),
	Organization=require("../models/organization"),
	Event=require("../models/event");


// list all Organizations
router.get("/", function(req,res){
	Organization.find({},function(err,allOrganizations){
		if(err){
			console.log(err)
		} else{
			res.render("organizations/index",{
				organizations:allOrganizations
			});
		}
	});
});



// show registration form
router.get("/register", function(req,res){
	res.render("organizations/register");
});


// posting new profile
// can't i just do req.body.org? nesting in the form names:
router.post("/register", function(req,res){
	let username=req.body.username,
	email=req.body.email,  
	phone=req.body.phone,
	address=req.body.address,
	city=req.body.city,
	state=req.body.state,
	zip=req.body.zip,
	bio=req.body.bio,
	userType="organizations",
	mission=req.body.mission,
	photo=req.body.photo,
	newOrganization= new Organization({email:email, phone:phone, address:address, city:city, state:state, zip:zip, username:username,bio:bio,userType:userType,photo:photo,mission:mission}); 
	// below is not running.
	Organization.register(newOrganization,req.body.password,function(err,organization){
		if(err){
			console.log(err);
			return res.redirect('/register');
		} 
			passport.authenticate("organizations")(req,res,function(){
			res.redirect(`${organization._id}`);
		});
	});
});

// show route 
router.get("/:OrId", function(req,res){
	Organization.findById(req.params.OrId,(err,organization)=>{
		if(err){
			console.log(err)
			res.redirect("/")

		} else {
			if(organization==null){
				res.redirect('/organizations')
			}
			else{

			Event.aggregate([
				{$match:{'hostIdString':`${organization._id}`}},
				// need to match to string, aggregate does not convert objectid to string.
				{$facet:{

					'timeSummary':[
					{$group:
						{ 
						_id: {month:{$month:'$date'}, year:{$year:"$date"}},
						
						totalHours:{$sum:{$multiply:["$hours",{$size:'$participants'}]}}
						}
					}
					],

						'eventsSummary':[
						{$group:
							{ 
							_id: {month:{$month:'$date'}, year:{$year:"$date"},day:{$dayOfMonth:"$date"}},
							info: {$addToSet:{name:'$name',id:'$_id'}}
							}
						}
						],


						'volunteerSummary':[
							{$unwind:'$names'},
							// need to group unique volunteer names so they can be have one total each
							{$group:
								{
								_id: {names:'$names', month:{$month:'$date'}, year:{$year:"$date"}},
								totalHours:{$sum:"$hours"}
								}
							}
							// maybe group twice to get total unique volunteer hours?
							
						]
					}}
				],(err,summary)=>{

					if(err){console.log(err)}
					else{
					let summaryObj= {};
						summary[0].timeSummary.forEach(entry=>{
						let thisYear=entry._id.year,
							thisMonth=entry._id.month-1,
							thisTotal=entry.totalHours;

							if (!summaryObj[thisYear]){
								summaryObj[thisYear]=[{month:'January', total:0, volunteers:[], activities:[], skills:[]},
								{month:'February',total:0, volunteers:[], activities:[], skills:[]},
								{month:'March',total:0, volunteers:[], activities:[], skills:[]},
								{month:'April',total:0, volunteers:[], activities:[], skills:[]},
								{month:'May',total:0, volunteers:[], activities:[], skills:[]},
								{month:'June',total:0, volunteers:[], activities:[], skills:[]},
								{month:'July',total:0, volunteers:[], activities:[], skills:[]},
								{month:'August',total:0, volunteers:[], activities:[], skills:[]},
								{month:'September',total:0, volunteers:[], activities:[], skills:[]},
								{month:'October',total:0, volunteers:[], activities:[], skills:[]},
								{month:'November',total:0, volunteers:[], activities:[], skills:[]},
								{month:'December',total:0, volunteers:[], activities:[], skills:[]}]
							};
							summaryObj[thisYear][thisMonth].total=thisTotal;
						});

						summary[0].eventsSummary.forEach(entry=>{
						let thisYear=entry._id.year,
							thisMonth=entry._id.month-1,
							thisDay=entry._id.day;

							entry.info.forEach(info=>{
								summaryObj[thisYear][thisMonth].activities.push({date:thisDay,id:info.id,name:info.name});
							
							});
						});

						summary[0].volunteerSummary.forEach(entry=>{
						
						let thisYear=entry._id.year,
							thisMonth=entry._id.month-1,
							thisVol=entry._id.names,
							thisTotal=entry.totalHours;
						
							summaryObj[thisYear][thisMonth].volunteers.push({vol:thisVol,hours:thisTotal});
		
						});

						res.render("organizations/show",{organization:organization,summaryObj:summaryObj});	
					}
						}
					);
			}
		}
	});
});

// add skill
router.post("/:OrId/skills", function(req,res){
	Organization.findById(req.params.OrId).exec(function(err,organization){
		if(err){
			res.redirect("back")
		} else {
			let newSkill=req.body.skill;
			if(!organization.skills.includes(newSkill)){
				organization.skills.push(newSkill);
				organization.save();	
			}
			res.redirect("back");
		}
	});
});	

// remove skill
router.put("/:OrId/remove_skill",(req,res)=>{
	Organization.findById(req.params.OrId,function(err,organization){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			var pos=organization.skills.indexOf(req.params.skill);
			organization.skills.splice(pos,1);
			organization.save();
			res.redirect("back");
			}
	});
});


// Edit form
router.get("/:OrId/edit",(req,res)=>{
	Organization.findById(req.params.OrId,(err,organization)=>{
		if(err){console.log(err)}
		else{
		res.render("organizations/edit",{organization:organization})}
	})
});


// Update Body
router.put("/:OrId",(req,res)=>{
	Organization.findById(req.params.OrId,(err,organization)=>{
		if(err){console.log(err);
			res.redirect("back")}
		else{
	organization.username=req.body.username,
	organization.email=req.body.email,  
	organization.phone=req.body.phone,
	organization.address=req.body.address,
	organization.city=req.body.city,
	organization.state=req.body.state,
	organization.zip=req.body.zip,
	organization.bio=req.body.bio,
	organization.mission=req.body.mission,
	organization.photo=req.body.photo
	organization.save();
	res.redirect(`/organizations/${organization._id}`);
		}
	})
});


// Delete Route
router.get("/:OrId/delete",(req,res)=>{
	Organization.findById(req.params.OrId,(err,organization)=>{
		if(err){console.log(err)}
		else {res.render('organizations/delete',{organization:organization})}
	})
});
router.delete("/:OrId",function(req,res){
	Organization.findByIdAndRemove(req.params.OrId,function(err){
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/organizations");
		}
	})
});


module.exports=router;