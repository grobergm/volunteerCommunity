const mongoose =require("mongoose");

const EventSchema = new mongoose.Schema({
	name: String,
	date: Date,
	description: String,
	skills:[],
	hours:Number,
	hostId:{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Organization"
	},
	hostIdString:String,
	hostName:String,
	participants:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Volunteer"
	}],
	volunteerIdStrings:[],
	names:[]
});
	

module.exports=mongoose.model("Event",EventSchema);