// importing Libraries
const 
	express 	= require("express"),
	app 		= express(),
	bodyParser 	= require("body-parser"),
	mongoose 	= require("mongoose"),
	flash 		= require("connect-flash"),
	passport 	= require("passport"),
	LocalStrategy= require("passport-local"),
	methodOverride= require("method-override"),
	// Models
	Volunteer 	=require("./models/volunteer"),
	Organization=require("./models/organization"),
	Event		=require("./models/event"),
	// Routes
	indexRoutes			=require("./routes/index"),
	volunteerRoutes		= require("./routes/volunteers"),
	organizationRoutes	= require("./routes/organizations"),
	eventRoutes			=require("./routes/events");
	
	// Connect to Mongo Database
	const db=mongoose.connect("mongodb://localhost/volunteer_community");

	// Config
	app.use(bodyParser.urlencoded({extended:true}));
	app.use(express.static(__dirname+"/public"));
	app.use(methodOverride("_method"));
	app.use(flash());
	// Choosing framework for views
	app.set("view engine","ejs");
	// Passport config(for authentication)
	app.use(require("express-session")({
		secret:"Matt is soooo cool",
		resave:false,
		saveUninitialized:false
	}));
	app.use(passport.initialize());
	app.use(passport.session());

passport.use('volunteers', new LocalStrategy(Volunteer.authenticate()));
passport.use('organizations', new LocalStrategy(Organization.authenticate()));

passport.serializeUser(function(user, done) {
  var key = {
    id: user._id,
    type: user.userType
  }
  done(null, key);
});
passport.deserializeUser(function(key, done) {
  if(key.type==="volunteers"){
  	 Volunteer.findOne({
    _id: key.id
  	}, '-salt -password', function(err, user) {
 	    done(err, user);
	  	});
  } else if(key.type==="organizations"){
  	Organization.findOne({
    _id: key.id
  }, '-salt -password', function(err, user) {
    done(err, user);
  });
  } 
});
		
// adding flash
app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error= req.flash("error");
	res.locals.success= req.flash("success");
	next();
});





app.use(indexRoutes);
app.use("/volunteers", volunteerRoutes);
app.use("/events", eventRoutes);
app.use("/organizations", organizationRoutes);




app.listen(500,function(){
	console.log("Server Started")
});


