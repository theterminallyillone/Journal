#!/usr/bin/env nodejs
var fs = require("fs");
var date = new Date();
var datestring = date.getFullYear()+"/";
if ((date.getMonth()+1) < 10) {
	datestring += "0";
}
datestring += (date.getMonth()+1)+"/"; 
if(date.getDay() < 10) {
	datestring += "0"
}
datestring += date.getDay();
var timestamp = "~"+date.getHours()+":";
if (date.getMinutes() < 10) {
	timestamp += "0";
}
timestamp += date.getMinutes()+":";
if (date.getSeconds() < 10) {
	timestamp += "0";
}
timestamp += date.getSeconds();
fs.readFile('journal.json', function(err, data) {
	var journal = JSON.parse(data);
	var arguments = process.argv.slice(2);
	console.log(arguments);
	if (arguments[0] != undefined) {
		switch (arguments[0].replace(/\-/g, "")) {
			case "erase":
				break;
			case "edit":
				break;
			case "task":
				break;
			case "record":
				break;
			case "log":
				break;
			case "read": //accepts nothing,day,tlr
				if (arguments[1] != undefined) {
					switch (arguments[1]) {
						case "task":
							break;
						case "record":
							break;
						case "log":
							break;
						case String(arguments[1].match(/^\d{4}\D\d\d\D\d\d/g)):
							console.log("DATE");
							break;
						case String(arguments[1].match(/^#.*/g)):
							console.log("TAG");
							break;
						default:
							console.log("I don't quite understand.");
							break;
					}
				} else {
					console.log("TODAY");
				}
				break;
			default:
				console.log("Do you need help?");
				break;
		}
	} else {
			console.log(journal.entries[journal.entries.indexOf(datestring)+1].tasks);
	}
	fs.writeFile("journal.json", JSON.stringify(journal));
});
/*

------------
|2019/07/07|
------------

------------
|Tasks     |
------------

Walk dog @ 8

#Work @ 16

------------
|Logs      |
------------

#Caffiene 1 Cup
~10:00:00

#Completed Walked Dog
~13:00:00

------------
|Records   |
------------

some
poem that goes
here
~11:00:00

*/