// const http = require('http');
const fs = require('fs');
const express = require('express');
const path = require('path');
const ejs = require('ejs');
var bodyParser = require('body-parser') 
const cookieParser = require("cookie-parser");
var session = require('express-session');
const redis = require("redis");
const connectRedis = require("connect-redis");
// var expressLayouts = require("express-ejs-layouts")

const {authorize, encode, writeJSON, getJSON} = require('./modules/util');


const app = express()
app.set('port', (process.env.PORT || 8000));
app.set('views', __dirname + '/views');
// app.use(expressLayouts)
// app.set('layout',  __dirname + '/layouts/base')
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

const r = express.Router();

//GATHER FORM DATA
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
  }));



app.use(cookieParser());

app.listen(app.get("port"), () => {
	console.log("App is running on http://localhost:" + app.get("port"))
})

// http://localhost:8080/ 

/* =================== SESSION MANAGEMENT  =================== */
const RedisStore = connectRedis(session);

const redisClient = redis.createClient({
	host: "localhost", 
	port: 6379
});

redisClient.on("error", (error) => {
	console.log("Cannot connect to Redis client:\n " + error)
})

redisClient.on("connect", (error) => {
	console.log("Connect to Redis Client Successfully.")
})

  //STORER SESSION DATA
app.use(session({
	store: new RedisStore({ client: redisClient}),
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:false,
    cookie: { 
		maxAge: 1000 * 60 * 60 * 24, 
		secure: false, 
		httpOnly: false
	 },
    resave: false
}));


/* =================== ROUTES =================== */
app.get(["/", "/signin"], 
(req, res) => {

	if (!req.session.eid) {

		console.log(session.signInError)
		// GET WORKERS
		workers = getJSON('data/workers.json')
		.map((item) => { return {
			"firstname": item.firstname, 
			"lastname": item.lastname
		}});
		
		res.render("signin", 
		{
			data: 'test', 
			workers: JSON.stringify(workers, null, 2), 
			error:session.signInError
		});
	}
	else {
		workers = getJSON("data/workers.json")
		role = workers.find((worker) => worker.eid == session.userEID)["role"]
		res.redirect("/" + role + "/landing")
	}
});

/* =================== FUNCTIONS  =================== */

app.post('/validate', 
(req, res) => {
	var {eid, name} = req.body;
	// console.log("FORM:", req.body)

	//name-value: First Last
	var user = authorize({eid, name});
	if(user) {
		req.session.loggedIn = true;
		req.session.userEID = user.eid;

		// console.log ("Session: \n", req.session)
		encodedUser = encode(user)
		res.redirect("/" + user.role + "/landing")
		session = req.session;
		session.signInError = ""

	}
	else {
		req.session.loggedIn = false;
		session.signInError = "Access Denied: Incorrent EID"
 
		res.redirect("signin")	
	}
})

/* =================== MIDDLE WARE  =================== */


function requireLogin(req, res, next) {
	console.log("Require Login: ", session.loggedIn);
	if(session.loggedIn){
		// console.log("in")
		next()
	}
	else {
		// console.log("out")
		res.redirect("/")
	}
}

// //middle ware - require login for all routes starting with /user/
app.all(["/worker/*", "/admin/*"], 
requireLogin)

app.get("/worker/Log", 
(req, res) => {
	// console.log (session)
	res.render("log")
})
app.get(["/worker/landing","/worker/","/admin/", "/admin/landing"],  
(req, res) => {
	res.render("landing")
})

app.get(["/worker/event?", "/admin/event"],
// app.get("/event", 
(req, res) => {
	console.log("Opening event " + req.query.eventID + "...");
	res.render("eventdetails", {eventID: req.query.eventID});
})


app.get(["/admin/Events", "/worker/Events"],
(req, res) => {
// app.get("/events", (req, res) => {
	res.render("viewevents")
})

app.get("/admin/newevent", 
(req, res) => {
	res.render("newevent")
})

// /admin/workers
app.get("/workers", 
(req, res) => {
	res.render("workers")
})

// /admin/worker
app.get("/ViewWorker", 
(req, res) => {
	res.render("viewprofile")
})

/* =================== FUNCTIONS  =================== */

app.get("/f/*",  
(req, res) => {
	path_list = req. _parsedOriginalUrl.pathname.split("/")
	file_name = path_list.pop()
	folder_name = path_list.pop()
	// console.log(file_name, folder_name);
	res.sendFile(path.join(__dirname, folder_name, file_name))
})

//GET JSON 
app.get("/r/getJSON?", 
(req, res) => {
	path_list = req. _parsedOriginalUrl.pathname.split("/")
	data = req.query.data
	res.send(getJSON(data))
});

app.post("/w", 
(req, res) => {
	const {fileName, fileContents, errorMessage} = req.body;
	fs.writeFile(fileName, fileContents, (error) => {
		res.send((error) ? errorMessage : "Success! " + fileName + " updated.");
	})
})

app.post("/currentUser", 
(req, res) => {
	console.log("Get Currently logged in user: ", session.userEID)
	res.send(session.userEID);
})

app.get("/logout", 
(req, res) => {
	session.userEID = null;
	session.loggedIn = false;
	res.redirect("/")

})

app.post("/makeNewEvent", 
(req, res) => {
	var { newEvent, errors } = req.body
	console.log("Make New Event: \n", newEvent)

	events = getJSON("data/events.json")

	errors.find((error) => error.title == "title").error  = Boolean(events.find(event => event.title.toUpperCase() == newEvent.title.toUpperCase()));
	errors.find((error) => error.title == "id").error  = Boolean(events.find(event => event.id == newEvent.id));

	if(errors.map(error => error.error).some(error => error == true)){
		console.log("Errors Found!")
		res.send(errors)
	}
	else {
		console.log("Creating new Event!")
		newEvent.workersAvailable = []
		events.push(newEvent)
		writeJSON("data/events.json", events)
		res.send("Success")
	}	
})

app.post("/remove", (req, res) => {}) //remove event, remove worker





