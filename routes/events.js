var express=require("express"),
	router= express.Router(),
	mongoose=require("mongoose"),
	passport=require("passport"),
	LocalStrategy= require("passport-local"),
	Volunteer=require("../models/volunteer"),
	Organization=require("../models/organization"),
	Event=require("../models/event");

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

// new 
router.get("/new", function(req,res){
	// if changing req works, load org into req for first time it can be req.params
	Organization.findById(req.user._id,function(err,organization){
		if(err){
			console.log(err);
		} else {
			let today=new Date();
			let y=today.getFullYear(), m=('0'+(today.getMonth()+1)).slice(-2), d=('0'+today.getDate()).slice(-2);
			let fullDate=y+'-'+m+'-'+d;
			let time=('0'+today.getHours()).slice(-2)+":"+('0'+today.getMinutes()).slice(-2);
			res.render("events/new",{organization:organization,fullDate:fullDate,time:time});
		}
	});
});

// create
router.post("/",(req,res)=>{
	let name=req.body.name,
		hostId=req.user._id,
		hostIdString=req.user._id,
		hostName=req.user.username,
		date= new Date(req.body.date +'T'+ req.body.time),
		hours=req.body.hours,
		description=req.body.description,
		newEvent= new Event({name:name,hostId:hostId,hostIdString:hostIdString,hostName:hostName,date:date,hours:hours,description:description});
	Event.create(newEvent,(err,event)=>{
		if(err){console.log(err)}
		else{
			res.redirect(`events/${event._id}`)
		}
	});
});

// Calendar 


// Show Route
router.get("/:EvId", function(req,res){
	Event.findById(req.params.EvId)
	.populate('hostId')
	.populate('participants')
	.exec(function(err,event){
		if(err){
			console.log(err);
			res.redirect("back")
		} else {
			if(event==null){
				res.redirect('/organizations')
			}
			else{
		Event.findById(event.hostId).select('skills').exec((err,allSkills)=>{
			if(err){console.log(err)}
			else{
				let time=formatAMPM(event.date);
				res.render("events/show",
				{event:event,time:time,allSkills:allSkills});	
			}
			
		});
			
		}
	}
	});	
});	
	

// add volunteers
router.post("/:EvId", function(req,res){
	Event.findById(req.params.EvId,function(err,event){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			if(!event.volunteerIdStrings.includes(req.user._id.toString())){
			event.participants.push(req.user._id);
			event.volunteerIdStrings.push(req.user._id.toString());
			event.names.push(req.user.username);
			event.save();
			}
			// post to volunteer profile too
			res.redirect(`/volunteers/${req.user._id}`);
		}
	});
});

router.post("/:EvId/skills",(req,res)=>{
	let newSkill=req.body.skill;
	Event.findById(req.params.EvId,function(err,event){
		if(err){
			res.redirect("back")
		} 
		else if(!event.skills.includes(newSkill)) {
			event.skills.push(newSkill)
			event.save();	
		}

		res.redirect("back");
	})
});

// Edit
 
router.get("/:EvId/edit", (req,res)=>{
	// if changing req works, load org into req for first time it can be req.params
	Event.findById(req.params.EvId)
	.populate('host')
	.populate('participants')
	.exec((err,event)=>{
		if(err){
			console.log(err);
		} else {
			res.render("events/edit",{event:event});
		}
	});
});

// remove volunteer
router.get("/:EvId/:VolId/remove",(req,res)=>{
	Event.findById(req.params.EvId,function(err,event){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			Volunteer.findById(req.params.VolId,(err,vol)=>{
				if(err){console.log(err)}
				else{
					var pos=event.participants.indexOf(vol._id);
					event.participants.splice(pos,1);
					event.volunteerIdStrings.splice(pos,1);
					var pos2=event.names.indexOf(vol.username);
					event.names.splice(pos2,1);
					event.save();
					res.redirect("back");
				}
				
			})
		}
	});
});

// remove skill
router.put("/:EvId/remove_skill",(req,res)=>{
	Event.findById(req.params.EvId,function(err,event){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			var pos=event.skills.indexOf(req.params.skill);
			event.skills.splice(pos,1);
			event.save();
			res.redirect("back");
			}
	});
});

// Update Body
router.put("/:EvId",(req,res)=>{
	Event.findById(req.params.EvId,(err,event)=>{
		if(err){console.log(err);
			res.redirect("back")}
		else{
		event.name=req.body.name,
		event.date= new Date(req.body.date +'T'+ req.body.time),
		event.hours=req.body.hours,
		event.description=req.body.description,
		event.save();
		res.redirect(`/events/${event._id}`);
		}
	})
});
// Delete
router.delete("/:EvId",function(req,res){
	Event.findByIdAndRemove(req.params.EvId,function(err){
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/organizations");
		}
	})
});
module.exports=router;