var app 	= require('express')(),
	server 	= require('http').createServer(app),
	util 	= require('util'),
	fs 		= require('fs'),
	temp 	= require("temp"), // Dev Only
    exec 	= require('child_process').exec,
    child;

server.listen(8080);

// Settings
var repoPath = "/tmp/Hanashi", 
	repo = "https://github.com/PMaynard/Hanashi.git",
	logfile = "log.json";

// Web Interface
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/html/index.html');
});

app.get('/dashboard.css', function (req, res) {
  res.sendfile(__dirname + '/html/dashboard.css');
});

// Activity Log
app.get('/activity_log.json', function (req, res) {
  res.sendfile(__dirname + '/log.json');
});

// git clone
app.get('/clone', function (req, res) {
	var rtn = [];
	child = exec('git clone ' + repo + ' ' + repoPath,
	  function (error, stdout, stderr) {
	    // console.log('stdout: ' + stdout);
	    // console.log('stderr: ' + stderr);
	    // if (error !== null) {
	    //   console.log('exec error: ' + error);
	    // }

		rtn.push({
	        id: 1,
	        request: "clone",
	        timestamp: +new Date,
	        stdout: stdout, 
	        stderr: stderr, 
	        error: error
	    });
	    writeLog(rtn);
	    res.send(rtn);
	});
});

// git pull 
app.get('/pull', function (req, res) {
	var rtn = [], cmd = 'cd '+repoPath+' && git pull'
	if(req.query.branch)
		cmd = 'cd '+repoPath+' && git pull origin ' + req.query.branch

	child = exec(cmd,
	  function (error, stdout, stderr) {
	    // console.log('stdout: ' + stdout);
	    // console.log('stderr: ' + stderr);
	    // if (error !== null) {
	    //   console.log('exec error: ' + error);
	    // }

		rtn.push({
	        id: 2,
	        request: "pull",
			timestamp: +new Date,
	        stdout: stdout, 
	        stderr: stderr, 
	        error: error
	    });
	    writeLog(rtn);
	    res.send(rtn);
	});
});

function writeLog(log_data){
	var obj = [];
	// Read Log file
	fs.readFile(logfile, function(err, data) {
		if(err){
			// Create file if it's not there.
			fs.writeFile(logfile, JSON.stringify(log_data, null, '\t'), function(err) {if(err)console.log(err)}); 
		}else{
			// Convert the data into an object, add the new record and save the output.
			obj = JSON.parse(data);
			obj.push(log_data[0]);
			fs.writeFile(logfile, JSON.stringify(obj, null, '\t'), function(err) {if(err)console.log(err)}); 
		}
	});
}
