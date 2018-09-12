const mongoose =require("mongoose");

const ActivitySchema = new mongoose.Schema({
	impactArea:String,
	skills:[]
	});
	
module.exports=mongoose.model("Activity",ActivitySchema);