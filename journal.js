#!/usr/bin/env nodejs
var fs = require("fs");
var colors = ["red","\x1b[41m","blue","\x1b[44m","magenta","\x1b[45m","yellow","\x1b[43m","cyan","\x1b[46m","green","\x1b[42m"];
var week = ["Sunday    ", "Monday    ", "Tuesday   ", "Wednesday ", "Thursday  ", "Friday    ", "Saturday  "];
var rlt = ["Records   ", "Logs      ", "Tasks     "];
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
rl.pause();
var date = new Date();
var datestring = date.getFullYear()+"/";
if ((date.getMonth()+1) < 10) {
	datestring += "0";
}
datestring += (date.getMonth()+1)+"/"; 
if(date.getDate() < 10) {
	datestring += "0"
}
datestring += date.getDate();
var timestamp = "~";
if (date.getHours() < 10) {
	timestamp += "0";
}
timestamp+=date.getHours()+":";
if (date.getMinutes() < 10) {
	timestamp += "0";
}
timestamp += date.getMinutes()+":";
if (date.getSeconds() < 10) {
	timestamp += "0";
}
timestamp += date.getSeconds();
fs.readFile('journal.json',function(err, data) {
	if (!err) {
		var journal = JSON.parse(data);
		if (journal.entries.indexOf(datestring) == -1) {
			journal.entries.push(datestring);
			var entry = {
				touched : datestring+timestamp,
				day : date.getDay(),
				records : [],
				logs : [],
				tasks : []
			};
			journal.entries.push(entry);
			fs.writeFile("journal.json", JSON.stringify(journal),function(){});
			console.log("Good morning!");
		} else {
			init();
		}
	} else {
		var entry = {entries:[],redacted:[],hilited:["default","yellow"]};
		fs.writeFile("journal.json", JSON.stringify(entry),function(){} );
		console.log("Here's that journal.json you requested.")
	}
});
function init() {
	fs.readFile('journal.json',function(err, data) {
		var journal = JSON.parse(data);
		var arguments = process.argv.slice(2);
		function hilite(str, color) {
			var colors = ["red","\x1b[41m","blue","\x1b[44m","magenta","\x1b[45m","yellow","\x1b[43m","cyan","\x1b[46m","green","\x1b[42m"];
			if (color == "default") {
				color = colors[colors.indexOf(journal.hilited[journal.hilited.indexOf("default")+1])];
			}
			if (colors.indexOf(color) != -1) {
				str = colors[colors.indexOf(color)+1] + str;
			} else {
				return str;
			}
			str += "\x1b[0m";
			return str;
		}
		function processentry(str) {
			var pstr = str.replace(/\n/g, " * ").split(" ");
			var rstr = "";
			var redacted = false;
			for (var i = 0; i < journal.redacted.length; i++) {
				if (pstr.indexOf(journal.redacted[i]) > -1) {
					redacted = true;
				}
			}
			if (!redacted) {
				for (var i = 0; i < pstr.length; i++) {
					if (journal.hilited.indexOf(pstr[i]) > -1) {
						pstr[i]=hilite(pstr[i], journal.hilited[journal.hilited.indexOf(pstr[i])+1]);
					} else if (/^#.*/g.test(pstr[i]) == true) {
						pstr[i]=hilite(pstr[i], "default");
					} else if (/~\d\d:\d\d:\d\d/g.test(pstr[i]) == true) {
						pstr[i] = "\x1b[31m"+pstr[i]+"\x1b[0m";
					}
					rstr += pstr[i]+" ";
				}
			}
			if (redacted == true) {
				return "\x1b[47m\x1b[37m"+str+"\x1b[0m";
			} else {
				return rstr.replace(/\* /g, "\n");
			}
		}
		function touch(day) {
			journal.entries[journal.entries.indexOf(day)+1].touched = datestring+timestamp;
		}
		function logday(day) {
			var h = "\x1b[47m\x1b[30m";
			var r = "\x1b[0m";
			console.log(h+"\x1b[4m"+day+r+"\n"+h+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(day)+1].day]+r);
			console.log(h+rlt[0]+r+"\n");
			for (var i = 0; i < journal.entries[journal.entries.indexOf(day)+1].records.length; i++) {
				console.log(processentry(journal.entries[journal.entries.indexOf(day)+1].records[i])+"\n");
			}
			console.log(h+rlt[1]+r+"\n");
			for (var i = 0; i < journal.entries[journal.entries.indexOf(day)+1].logs.length; i++) {
				console.log(processentry(journal.entries[journal.entries.indexOf(day)+1].logs[i])+"\n");
			}
			console.log(h+rlt[2]+r+"\n");
			for (var i = 0; i < journal.entries[journal.entries.indexOf(day)+1].tasks.length; i++) {
				console.log(processentry(journal.entries[journal.entries.indexOf(day)+1].tasks[i])+"\n");
			}
			console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(day)+1].touched.replace("~", "-")+r);
		}
		if (arguments[0] != undefined) {
			switch (arguments[0]) {
				case "erase":
					break;
				case "edit":
					break;
				case "redact":
					if (arguments[1] != undefined && /^#.*/g.test(arguments[1]) == true) {
						journal.redacted.push(arguments[1]);
						console.log("Mum's the word.");
					} else {
						console.log("\x1b[47m\x1b[37mDo you need help?\x1b[0m");
					}
					break;
				case "unredact":
					if (arguments[1] != undefined && /^#.*/g.test(arguments[1]) == true) {
						journal.redacted.splice(journal.redacted.indexOf(arguments[1]), 1);
						console.log("I found it!");
					} else {
						console.log("That's a bit too revealing...");
					}
					break;
				case "hilite":
					if (arguments[1] != undefined && colors.indexOf(arguments[1]) > -1) {
						if (arguments[2] != undefined && /^#.*/g.test(arguments[2]) == true) {
							if (journal.hilited.indexOf(arguments[2]) > -1) {
								journal.hilited[journal.hilited.indexOf(arguments[2])+1] = arguments[1];
							} else {
								journal.hilited.push(arguments[2]);
								journal.hilited.push(arguments[1]);
							}
						} else if (arguments[2] == "default") {
							journal.hilited[journal.hilited.indexOf("default")+1] = arguments[1];
						} else {
							console.log("Honestly, why is this even a feature?");
						}
					} else {
						console.log("Available Colors:\n\x1b[41mred\n\x1b[44mblue\n\x1b[45mmagenta\n\x1b[43myellow\n\x1b[46mcyan\n\x1b[42mgreen\x1b[0m");
					}
					break;
				case "task":
					if (arguments[1] != undefined) {
						if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true && arguments[2] != undefined) {
							if (journal.entries.indexOf(arguments[1]) > -1) {
								journal.entries[journal.entries.indexOf(arguments[1])+1].tasks.push(arguments[2]);
								touch(arguments[1]);
								console.log("Task recorded.");
							} else {
								journal.entries.push(arguments[1]);
								journal.entries.push({logs:[],tasks:[arguments[2]],records:[],day:new Date(arguments[1]).getDay(),touched:datestring+timestamp})
								console.log("Task recorded.");
							}
						} else if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == false) {
							journal.entries[journal.entries.indexOf(datestring)+1].tasks.push(arguments[1]);
							touch(datestring);
							console.log("Task recorded.");
						} else {
							console.log("I think you made a mistake.");
						}
					} else {
						console.log("When is this?");
					}
					break;
				case "record":
					if (arguments[1] != undefined && /^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == false) {
						console.log("When?!");
					} else {
						console.log("Press CTRL-C when you're finished.");
						var record = "";
						var recorddate = datestring;
						if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true) {
							recorddate = arguments[1];
						}
						rl.resume();
						rl.on('line', (input) => {
							record += input+"\n";
						});
						rl.on('SIGINT', () => {
							record+=timestamp;
							if (journal.entries.indexOf(recorddate) == -1) {
								journal.entries.push(recorddate);
								journal.entries.push({tasks:[],logs:[],records:[],day:new Date(recorddate).getDay(),touched:""});
							}
							journal.entries[journal.entries.indexOf(recorddate)+1].records.push(record);
							touch(recorddate);
							fs.writeFile("journal.json", JSON.stringify(journal),function(){});
							console.log("Entry recorded.");
							rl.pause();
						});
					}
					break;
				case "log":
					if (arguments[1] != undefined) {
						if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true && arguments[2] != undefined) {
							if (journal.entries.indexOf(arguments[1]) > -1) {
								journal.entries[journal.entries.indexOf(arguments[1])+1].logs.push(arguments[2]+"\n"+timestamp);
								touch(arguments[1]);
								console.log("Entry logged.");
							} else {
								journal.entries.push(arguments[1]);
								journal.entries.push({logs:[arguments[2]+"\n"+timestamp],tasks:[],records:[],day:new Date(arguments[1]).getDay(),touched:datestring+timestamp})
								console.log("Entry logged.");
							}
						} else if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == false) {
							journal.entries[journal.entries.indexOf(datestring)+1].logs.push(arguments[1]+" \n"+timestamp);
							touch(datestring);
							console.log("Entry logged.");
						} else {
							console.log("How on earth did you garble that up?!");
						}
					} else {
						console.log("Pardon me, but, log what?");
					}
					break;
				case "read":
					if (arguments[1] != undefined) {
						if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true) {
							logday(arguments[1]);
						} else if (/^#.*/g.test(arguments[1]) == true) {
							console.log("TAG TODAY ALL");
						} else if (arguments[1] == "task" || arguments[1] == "log" || arguments[1] == "record") {
							console.log(arguments[1].toUpperCase());
						} else {
							console.log("I'm NOT reading that.");
						}
					} else {
						logday(datestring);
					}
					break;
				default:
					console.log("Do you need help?");
					break;
			}
		} else {
			logday(datestring);
		}
		fs.writeFile("journal.json", JSON.stringify(journal),function(){});
	});
}
