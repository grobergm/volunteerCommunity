const 	mongoose= require("mongoose"),
		passportLocalMongoose= require("passport-local-mongoose");

const OrganizationSchema= new mongoose.Schema({
	username: String,
	password: String,
	photo: String,
	mission: String,
	bio: String,
	userType: String,
	email: String,
	phone: String,
	address: String,
	city: String,
	state: String,
	zip: String,
	skills:[]
	});
OrganizationSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Organization",OrganizationSchema);