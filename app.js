require('dotenv').config();

const PythonShell = require('python-shell');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const app = express();
const http = require('axios');



// Switch states held in memory
const switches = [];

// Read state from saveState.json, populate switches array
var readableStream = fs.createReadStream('saveState.json');
var data = ''

readableStream.on('data', function (chunk) {
  data += chunk;
});

readableStream.on('end', function () {
  var parsed = JSON.parse(data);

  for (i = 0; i < parsed.switches.length; i++) {
    switches.push(new Switch(parsed.switches[i]))
  }
});




// Switch Model
// Expects an object:{
// id:"sw" + number,
// state: "on" or "off",
// name: any name you want to display. Defaults to "switch"
// }

function Switch(switchValues) {
  this.id = switchValues.id || "sw"
  this.state = switchValues.state || "off"
  this.name = switchValues.name || "switch"
  this.toggle = function () {
    if (this.state === "on") {
      this.setState("off")
    }
    else {
      this.setState("on");
    }
  }
  this.setState = function (state) {
    var str = state === "on" ? onString(this.id[2]) : offString(this.id[2]);
    var actionType = state == "on" ? 1 : 2;
    var state = state == "off";
    let temperature = 0;
    let light = 0;
    PythonShell.run("./scripts/LM75A.py", function (err, temp) {
      if (err) throw err;
      // results is an array consisting of messages collected during execution
      temperature = parseFloat((temp += '').split(" ")[1]);
      PythonShell.run("./scripts/light.py", function (err, _light) {
        light = parseInt(_light);
        http.post(`https://kedahome.azurewebsites.net/api/Action/SetAction`,
			{ 
				ActionType: actionType, 
				Time: new Date(), 
				Light: light, 
				Temperature: temperature, 
				WindowOpened: state, 
				HeaterOn: false, 
				Room: 0 
			})
          .then((res) => { res = res.json(); console.log("No servera atnāca" + res.toString()) })
		  .catch((error) => { });
		  writeLog(0, actionType, new Date(), temperature, 0, state, false);
      });
    });
    PythonShell.run(str, function (err) {
      if (!process.env.DEV) {
        if (err) throw err;
      }
    });
    this.state = state
  }
  // Invokes setState on init to set the switch to its last recalled state.
  this.setState(this.state);
}

// needed due to a quirk with PythonShell
function onString(number) {
  if (number == 1) {
    return './scripts/open.py'
  }
  if (number == 2) {
    return './scripts/stepper-fwd.py'
  }
}
function offString(number) {
  if (number == 1) {
    return './scripts/close.py'
  }
  if (number == 2) {
    return './scripts/stepper-bwd.py'
  }
  return './scripts/stepper-bwd.py'
}




// Switch Lookup
function getSwitch(string) {
  return switches.filter(function (element) {
    return element.id === string;
  })[0]
}

// Updates saveState.json
function saveState() {
  var formattedState = {
    switches: switches
  }
  fs.writeFile('./saveState.json', JSON.stringify(formattedState))
}

function writeLog(room, action, time, temperature, light, windowState, radiatorState) {
	var logLine = room + "\t" + action + "	" + time + "	" + temperature + "	" + light + "	" + windowState + "	" + radiatorState + "\n";
	fs.appendFile('actions.csv', logLine, function (err) {
		if (err) throw err;
	});
}


//Server Configuration
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/scripts'));

// If you have a frontend, drop it in the Public folder with an entry point of index.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

// Switch Routes for API
app.get('/api/switches', function (req, res) {
  res.send(switches);
})

app.get('/api/switches/:id', function (req, res) {
  var found = getSwitch(req.params.id);
  res.json(found);
})

app.post('/api/switches/:id', function (req, res) {

  // For now, uses a simple password query in the url string. 
  // Example: POST to localhost:8000/API/switches/sw1?password=test
  if (req.query.password === process.env.PASS) {
    var foundSwitch = getSwitch(req.params.id);

    // Optional On / Off command. If not included, defaults to a toggle.

    if (!(req.query.command === "on" || req.query.command === "off")) {
      foundSwitch.toggle();
    }
    else {
      foundSwitch.setState(req.query.command)
    }

    saveState();
    console.log("postSwitch " + JSON.stringify(foundSwitch));
    res.json(foundSwitch);
  }
  else {
    console.log("invalid password")
    res.send("try again")
  }

})

//temperature and switches states
app.get('/api/getStatus', (req, res) => {
  PythonShell.run("/scripts/LM75A.py", function (err, temp) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    temperature = parseFloat((temp += '').split(" ")[1]);
    fs.readFile('./saveState.json','utf8', (err, data) => {
      if (err) throw err;
      var result = {"Temperature": temperature, "Switches": JSON.parse(data)};
      res.json(result);
    });
  });
});

app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + process.env.PORT);
})

