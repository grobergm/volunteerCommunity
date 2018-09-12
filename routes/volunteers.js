const express=require("express"),
	router= express.Router(),
	mongoose=require("mongoose"),
	passport=require("passport"),
	LocalStrategy= require("passport-local"),
	Volunteer=require("../models/volunteer"),
	Organization=require("../models/organization"),
	Event=require("../models/event");

// NEW
router.get("/register",(req,res)=>{
	res.render("volunteers/register")
});


//Create 
router.post("/register",(req,res)=>{
	let username=req.body.username,
	first=req.body.first,
	last=req.body.last,
	bio=req.body.bio,
	userType="volunteers",
	zip=req.body.zip,
	goal=req.body.goal,
	photo=req.body.photo,	 
	gender= req.body.gender,
	birthday= req.body.birthday,
	email=req.body.email,
	phone=req.body.phone; 
	let newVolunteer= new Volunteer({email:email, phone:phone, zip:zip, birthday:birthday, gender:gender, first:first,last:last,username:username,bio:bio,userType:userType,goal:goal,photo:photo}); 
	Volunteer.register(newVolunteer,req.body.password,(err,volunteer)=>{
		if(err){
			console.log(err);
			return res.redirect('/register');
		} 
		passport.authenticate("volunteers")(req,res,function(){
			res.redirect(`${volunteer._id}`);
		});
	});
});

// Find all volunteers
router.get('/', (req,res)=>{
	Volunteer.find({},(err,volunteers)=>{
		if(err){
			console.log(err)
		}
		else {
			res.render('volunteers/index',{volunteers:volunteers})
		}
	});
});

// Read
router.get('/:VolId',(req,res)=>{
	Volunteer.findById(req.params.VolId).exec(function(err,volunteer){
		if(err){
			res.redirect("back")
		} else {
			if(volunteer==null){
				res.redirect('/volunteers')
			}
			else{
			Event.aggregate([
				{$match: {'volunteerIdStrings':`${volunteer._id.toString()}`}},
				// need to match to string, aggregate does not convert objectid to string.
				{$facet:{
					

					'timeSummary':[
					{$group:
						{ 
						_id: {month:{$month:'$date'}, year:{$year:"$date"}},
						totalHours:{$sum:"$hours"}
						}
					}
					],

						'eventsSummary':[
						{$group:
							{ 
							_id: {month:{$month:'$date'}, year:{$year:"$date"},day:{$dayOfMonth:"$date"},host:'$hostName'},
							info: {$addToSet:{name:'$name',id:'$_id'}}
							}
						}
						],


						'skillSummary':[
							{$unwind:'$skills'},
							// need to group unique volunteer names so they can be have one total each
							{$group:
								{
								_id: {skills:'$skills', hostName:'$hostName',hostId:'$hostIdString'},
								totalHours:{$sum:"$hours"}
								}
							}
							// maybe group twice to get total unique volunteer hours?
							
						]
					}}
				],(err,summary)=>{
					console.log(summary[0].skillSummary)
					if(err){console.log(err)}
					else{
					
					let summaryObj= {};
					let skillSummaryObj={};
						summary[0].timeSummary.forEach(entry=>{
						let thisYear=entry._id.year,
							thisMonth=entry._id.month-1,
							thisTotal=entry.totalHours;

							if (!summaryObj[thisYear]){
								summaryObj[thisYear]=[
								{month:'January', total:0,organizations:{}},
								{month:'February',total:0,organizations:{}},
								{month:'March',total:0,organizations:{}},
								{month:'April',total:0,organizations:{}},
								{month:'May',total:0,organizations:{}},
								{month:'June',total:0,organizations:{}},
								{month:'July',total:0,organizations:{}},
								{month:'August',total:0,organizations:{}} ,
								{month:'September',total:0,organizations:{} },
								{month:'October',total:0,organizations:{}},
								{month:'November',total:0,organizations:{}},
								{month:'December',total:0,organizations:{}}]
							};
							summaryObj[thisYear][thisMonth].total=thisTotal;
						});

						summary[0].eventsSummary.forEach(entry=>{
						let thisYear=entry._id.year,
							thisMonth=entry._id.month-1,
							thisDay=entry._id.day,
							thisOrg=entry._id.host;

						if (!summaryObj[thisYear][thisMonth].organizations[thisOrg]){
						summaryObj[thisYear][thisMonth].organizations[thisOrg]=[]
					};
							// }
						entry.info.forEach(info=>{	
							summaryObj[thisYear][thisMonth].organizations[thisOrg].push({date:thisDay,id:info.id,name:info.name});
							});
						});
						
						summary[0].skillSummary.forEach(entry=>{
						
						let thisSkill=entry._id.skills,
							thisOrg=entry._id.hostName,
							thisTotal=entry.totalHours,
							thisHostId=entry.hostId;
						if(!skillSummaryObj[thisOrg]){
							skillSummaryObj[thisOrg]={skills:[],id:entry._id.hostId};
							}
						skillSummaryObj[thisOrg].skills.push(`${thisSkill+': '+thisTotal}`+' hours');
							
						});
						console.log(skillSummaryObj)

						res.render("volunteers/show",{volunteer:volunteer,summaryObj:summaryObj,skillSummaryObj:skillSummaryObj});	
					}
						}
				);
			}
		}
	});
});

// Edit form
router.get("/:VolId/edit",(req,res)=>{
	Volunteer.findById(req.params.VolId,(err,volunteer)=>{
		if(err){console.log(err)}
		else{
		res.render("volunteers/edit",{volunteer:volunteer})}
	})
});


// Update Body
router.put("/:VolId",(req,res)=>{
	Volunteer.findById(req.params.VolId,(err,volunteer)=>{
		if(err){console.log(err);
			res.redirect("back")}
		else{
	volunteer.username=req.body.username,
	volunteer.first=req.body.first,
	volunteer.last=req.body.last,
	volunteer.bio=req.body.bio,
	volunteer.userType="volunteers",
	volunteer.zip=req.body.zip,
	volunteer.goal=req.body.goal,
	volunteer.photo=req.body.photo,	 
	volunteer.gender= req.body.gender,
	volunteer.birthday= req.body.birthday,
	volunteer.email=req.body.email,
	volunteer.phone=req.body.phone; 
	volunteer.save()
	res.redirect(`/volunteers/${volunteer._id}`);
		}
	})
});
router.get("/:VolId/delete",(req,res)=>{
	Volunteer.findById(req.params.VolId,(err,volunteer)=>{
		if(err){console.log(err)}
		else {res.render('volunteers/delete',{volunteer:volunteer})}
	})
});
// Delete Route
router.delete("/:VolId",function(req,res){
	Volunteer.findByIdAndRemove(req.params.VolId,function(err){
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/volunteers");
		}
	})
});

module.exports=router;