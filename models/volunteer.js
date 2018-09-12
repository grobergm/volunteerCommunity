const mongoose= require("mongoose"),
	passportLocalMongoose= require("passport-local-mongoose");

const VolunteerSchema= new mongoose.Schema({
	username: String,
	first: String,
	last: String,
	password: String,
	bio: String,
	userType: String,
	photo: String,
	goal: String,
	email: String,
	phone: String,
	zip: String,
	gender:String,
	birthday:Date,
});

VolunteerSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Volunteer",VolunteerSchema);