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
		function selectfrom(searchdate) {
			var selections = [];
			var selectionlength = 0;
			var h = "\x1b[47m\x1b[30m";
			var r = "\x1b[0m";
			console.log(h+"\x1b[4m"+searchdate+r+"\n"+h+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(searchdate)+1].day]+r);
			console.log(h+rlt[0]+r+"\n");
			for (var i = 0; i < journal.entries[journal.entries.indexOf(searchdate)+1].records.length; i++) {
				selections.push(selectionlength.toString());
				selections.push("R"+i+journal.entries[journal.entries.indexOf(searchdate)+1].records[i].substr(journal.entries[journal.entries.indexOf(searchdate)+1].records[i].indexOf("~"), journal.entries[journal.entries.indexOf(searchdate)+1].records[i].length));
				console.log(processentry(hilite("("+selectionlength+")", "default")+" "+journal.entries[journal.entries.indexOf(searchdate)+1].records[i]+"\n"));
				selectionlength++;
			}
			console.log(h+rlt[1]+r+"\n");
			for (var i = 0; i < journal.entries[journal.entries.indexOf(searchdate)+1].logs.length; i++) {
				selections.push(selectionlength.toString());
				selections.push("L"+i+journal.entries[journal.entries.indexOf(searchdate)+1].logs[i].substr(journal.entries[journal.entries.indexOf(searchdate)+1].logs[i].indexOf("~"), journal.entries[journal.entries.indexOf(searchdate)+1].logs[i].length));
				console.log(processentry(hilite("("+selectionlength+")", "default")+" "+journal.entries[journal.entries.indexOf(searchdate)+1].logs[i]+"\n"));
				selectionlength++;
			}
			console.log(h+rlt[2]+r+"\n");
			for (var i = 0; i < journal.entries[journal.entries.indexOf(searchdate)+1].tasks.length; i++) {
				selections.push(selectionlength.toString());
				selections.push("T"+i+"~");
				console.log(processentry(hilite("("+selectionlength+")", "default")+" "+journal.entries[journal.entries.indexOf(searchdate)+1].tasks[i]+"\n"));
				selectionlength++;
			}
			console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(searchdate)+1].touched.replace("~", "-")+r);
			return selections;
		}
		function findtag(day, tag, RLT, nv) {
			var results = [];
			if (RLT.indexOf("R") > -1) {
				for (var i = 0; i < journal.entries[journal.entries.indexOf(day)+1].records.length; i++) {
					if (journal.entries[journal.entries.indexOf(day)+1].records[i].search(tag) > -1) {
						results.push("0"+journal.entries[journal.entries.indexOf(day)+1].records[i]);
					}
				}
			}
			if (RLT.indexOf("L") > -1) {
				for (var i = 0; i < journal.entries[journal.entries.indexOf(day)+1].logs.length; i++) {
					if (journal.entries[journal.entries.indexOf(day)+1].logs[i].search(tag) > -1) {
						results.push("1"+journal.entries[journal.entries.indexOf(day)+1].logs[i]);
					}
				}
			}
			if (RLT.indexOf("T") > -1) {
				for (var i = 0; i < journal.entries[journal.entries.indexOf(day)+1].tasks.length; i++) {
					if (journal.entries[journal.entries.indexOf(day)+1].tasks[i].search(tag) > -1) {
						results.push("2"+journal.entries[journal.entries.indexOf(day)+1].tasks[i]);
					}
				}
			}
			if (results.length > 0) {
				var h = "\x1b[47m\x1b[30m";
				var r = "\x1b[0m";
				var currentresults = results[0].substr(0,1);
				console.log(h+"\x1b[4m"+day+r+"\n"+h+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(day)+1].day]+r);
				console.log(h+rlt[Number(currentresults)]+r+"\n");
				for (var i = 0; i < results.length; i++) {
					if (results[i].substr(0,1) != currentresults) {
						currentresults = results[i].substr(0,1);
						console.log(h+rlt[Number(currentresults)]+r+"\n");
					}
					console.log(processentry(results[i].substr(1, results[i].length))+"\n");
				}
				console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(day)+1].touched.replace("~", "-")+r);
			} else {
				if (nv == undefined) {
					console.log("I couldn't find any entries tagged: "+tag);
				}
			}
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
				case "help":
					console.log("OPTIONS:")
					console.log("hilite (color) (#tag || default)");
					console.log("  hilite tags, several colors are available");
					console.log("erase (date)");
					console.log("  select from a list an entry to erase");
					console.log("read (tasks || records || logs || #tag || date) (#tag || date) (date || #tag) (#tag)");
					console.log("  verbose command used to search through entries")
					console.log("edit (date)");
					console.log("  select from a list an entry to edit");
					console.log("task (date || task) (task)");
					console.log("  record a task");
					console.log("record (date)");
					console.log("  record a multiline log");
					console.log("log (date || log) (log)");
					console.log("  record a log");
					console.log("redact (#tag)");
					console.log("  hide a tag");
					console.log("unredact (#tag)");
					console.log("  unhide a tag");
					break;
				case "erase":
					var searchdate = "";
					var selections;
					if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true) {
						searchdate = arguments[1];
					} else if (arguments[1] == undefined) {
						searchdate = datestring;
					} else {
						console.log("Just try again.");
						break;
					}
					if (journal.entries.indexOf(searchdate) > -1) {
						selections = selectfrom(searchdate);
					} else {
						console.log("404 Entry Not Found");
						break;
					}
					if (selections.length == 0) {
						console.log("There is nothing to erase.");
						break;
					}
					var somenumber = "";
					var fallingthrough = false;
					console.log("Select an entry to erase.");
					rl.resume();
					rl.on('line', (input) => {
						if (!fallingthrough) {
							somenumber = input;
							if (/\d+/g.test(somenumber) == true && selections.indexOf(somenumber) > -1) {
								fallingthrough = true;
								if (selections[selections.indexOf(somenumber)+1].substr(0,1) == "L") {
									console.log(journal.entries[journal.entries.indexOf(searchdate)+1].logs[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)]);
								} else if (selections[selections.indexOf(somenumber)+1].substr(0,1) == "R") {
									console.log(journal.entries[journal.entries.indexOf(searchdate)+1].records[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)]);
								} else if (selections[selections.indexOf(somenumber)+1].substr(0,1) == "T") {
									console.log(journal.entries[journal.entries.indexOf(searchdate)+1].tasks[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)]);
								}
								console.log("Really? (Y/N)");
								rl.on('line', (input) => {
									if (input.toUpperCase() == "Y") {
										if (selections[selections.indexOf(somenumber)+1].substr(0,1) == "L") {
											journal.entries[journal.entries.indexOf(searchdate)+1].logs.splice(journal.entries[journal.entries.indexOf(searchdate)+1].logs.indexOf(selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)), 1);
										} else if (selections[selections.indexOf(somenumber)+1].substr(0,1) == "R") {
											journal.entries[journal.entries.indexOf(searchdate)+1].records.splice(journal.entries[journal.entries.indexOf(searchdate)+1].records.indexOf(selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)), 1);
										} else if (selections[selections.indexOf(somenumber)+1].substr(0,1) == "T") {
											journal.entries[journal.entries.indexOf(searchdate)+1].tasks.splice(journal.entries[journal.entries.indexOf(searchdate)+1].tasks.indexOf(selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)), 1);
										}
										touch(searchdate);
										fs.writeFile("journal.json", JSON.stringify(journal),function(){});
										console.log("It is gone.");
									} else {
										console.log("Aborted.");
									}
									rl.pause();
								});
							} else {
								console.log("That isn't a valid entry.");
								rl.pause();
							}
						}
					});
					break;
				case "edit":
					var searchdate = "";
					if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true) {
						searchdate = arguments[1];
					} else if (arguments[1] == undefined) {
						searchdate = datestring;
					} else {
						console.log("Just try again.");
						break;
					}
					if (journal.entries.indexOf(searchdate) > -1) {
						var selections = selectfrom(searchdate);
						if (selections.length == 0) {
							console.log("There is nothing to edit");
							break;
						}
						console.log("Select an entry to edit.");
						var somenumber = "";
						var fallingthrough = false;
						var lineinput = "";
						rl.resume();
						rl.on('line', (input) => {
							if (!fallingthrough) {
								somenumber = input;
								if (/\d+/g.test(somenumber) == true && selections.indexOf(somenumber) > -1) {
									if (selections[selections.indexOf(somenumber)+1].substr(0,1) == "L") {
										fallingthrough = true;
										console.log(journal.entries[journal.entries.indexOf(searchdate)+1].logs[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)].substr(0, journal.entries[journal.entries.indexOf(searchdate)+1].logs[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)].indexOf("\n~")));
										rl.on('line', (input) => {
											if (input.length > 0) {
												journal.entries[journal.entries.indexOf(searchdate)+1].logs[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)] = input+"\n"+selections[selections.indexOf(somenumber)+1].substr(selections[selections.indexOf(somenumber)+1].indexOf("~"), selections[selections.indexOf(somenumber)+1].length);
												touch(searchdate);
												fs.writeFile("journal.json", JSON.stringify(journal),function(){});
												console.log("Entry was edited successfully.");
											} else {
												console.log("Aborted.");
											}
											rl.pause();
										});
									} else if (selections[selections.indexOf(somenumber)+1].substr(0,1) == "R") {
										fallingthrough = true;
										console.log(journal.entries[journal.entries.indexOf(searchdate)+1].records[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)].substr(0, journal.entries[journal.entries.indexOf(searchdate)+1].records[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)].indexOf("\n~")));
										console.log("Press CTRL-C when you're finished.");
										rl.on('line', (input) => {
											lineinput += input+"\n";
										});
										rl.on('SIGINT', () => {
											if (lineinput.length > 0) {
												journal.entries[journal.entries.indexOf(searchdate)+1].records[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)] = lineinput+selections[selections.indexOf(somenumber)+1].substr(selections[selections.indexOf(somenumber)+1].indexOf("~"), selections[selections.indexOf(somenumber)+1].length);
												touch(searchdate);
												fs.writeFile("journal.json", JSON.stringify(journal),function(){});
												console.log("Entry was edited successfully.");
											} else {
												console.log("Aborted.");
											}
											rl.pause();
										});
									} else {
										fallingthrough = true;
										console.log(journal.entries[journal.entries.indexOf(searchdate)+1].tasks[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)]);
										rl.on('line', (input) => {
											if (input.length > 0) {
												journal.entries[journal.entries.indexOf(searchdate)+1].tasks[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)] = input;
												touch(searchdate);
												fs.writeFile("journal.json", JSON.stringify(journal),function(){});
												console.log("Entry was edited successfully.");
											} else {
												console.log("Aborted.");
											}
											rl.pause();
										});
									}
								} else {
									console.log("That isn't a valid entry.");
									rl.pause();
								}
							}
						});
					} else {
						console.log("404 Entry Not Found");
					}
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
								console.log("Hilited.");
							} else {
								journal.hilited.push(arguments[2]);
								journal.hilited.push(arguments[1]);
								console.log("Hilited.");
							}
						} else if (arguments[2] == "default") {
							journal.hilited[journal.hilited.indexOf("default")+1] = arguments[1];
							console.log("Hilited.");
						} else {
							console.log("Honestly, why is this even a feature?");
						}
					} else {
						var r = "\x1b[0m";
						console.log("Available Colors:\n\x1b[41mred"+r+"\n\x1b[44mblue"+r+"\n\x1b[45mmagenta"+r+"\n\x1b[43myellow"+r+"\n\x1b[46mcyan"+r+"\n\x1b[42mgreen"+r+"\x1b[0m");
					}
					break;
				case "task":
					if (arguments[1] != undefined) {
						if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true && arguments[2] != undefined && arguments[2].length > 0) {
							if (journal.entries.indexOf(arguments[1]) > -1) {
								journal.entries[journal.entries.indexOf(arguments[1])+1].tasks.push(arguments[2]);
								touch(arguments[1]);
								console.log("Task recorded.");
							} else {
								journal.entries.push(arguments[1]);
								journal.entries.push({logs:[],tasks:[arguments[2]],records:[],day:new Date(arguments[1]).getDay(),touched:datestring+timestamp})
								console.log("Task recorded.");
							}
						} else if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true && arguments[2] == undefined) {
							if (journal.entries.indexOf(arguments[1]) == -1) {
								journal.entries.push(arguments[1]);
								journal.entries.push({logs:[],tasks:[],records:[],day:new Date(arguments[1]).getDay(),touched:datestring+timestamp});
							}
							console.log("Which task?");
							rl.resume();
							rl.on('line', (input) => {
								if (input.length > 0) {
									journal.entries[journal.entries.indexOf(arguments[1])+1].tasks.push(input);
									touch(arguments[1]);
									fs.writeFile("journal.json", JSON.stringify(journal),function(){});
									console.log("Task recorded.");
								} else {
									console.log("Aborted.");
								}
								rl.pause();
							});
						} else if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == false && arguments[1].length > 0) {
							journal.entries[journal.entries.indexOf(datestring)+1].tasks.push(arguments[1]);
							touch(datestring);
							console.log("Task recorded.");
						} else {
							console.log("I think you made a mistake.");
						}
					} else {
						console.log("Which task?");
						rl.resume();
						rl.on('line', (input) => {
							if (input.length > 0) {
								journal.entries[journal.entries.indexOf(datestring)+1].tasks.push(input);
								touch(datestring);
								fs.writeFile("journal.json", JSON.stringify(journal),function(){});
								console.log("Task recorded.");
							} else {
								console.log("Aborted.");
							}
							rl.pause();
						});
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
						} else if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true && arguments[2] == undefined) {
							if (journal.entries.indexOf(arguments[1]) == -1) {
								journal.entries.push(arguments[1]);
								journal.entries.push({logs:[],tasks:[],records:[],day:new Date(arguments[1]).getDay(),touched:datestring+timestamp});
							}
							console.log("What am I logging?");
							rl.resume();
							rl.on('line', (input) => {
								if (input.length > 0) {
									journal.entries[journal.entries.indexOf(arguments[1])+1].logs.push(input+"\n"+timestamp);
									touch(arguments[1]);
									fs.writeFile("journal.json", JSON.stringify(journal),function(){});
									console.log("Entry logged.");
								} else {
									console.log("Aborted.");
								}
								rl.pause();
							});
						} else if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == false) {
							journal.entries[journal.entries.indexOf(datestring)+1].logs.push(arguments[1]+" \n"+timestamp);
							touch(datestring);
							console.log("Entry logged.");
						} else {
							console.log("How on earth did you garble that up?!");
						}
					} else {
						console.log("What am I logging?");
						rl.resume();
						rl.on('line', (input) => {
							if (input.length > 0) {
								journal.entries[journal.entries.indexOf(datestring)+1].logs.push(input+"\n"+timestamp);
								touch(datestring);
								fs.writeFile("journal.json", JSON.stringify(journal),function(){});
								console.log("Entry logged.");
							} else {
								console.log("Aborted.");
							}
							rl.pause();
						});
					}
					break;
				case "read":
					if (arguments[1] != undefined) {
						if (arguments[2] == undefined) {
							if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true) {
								if (journal.entries.indexOf(arguments[1]) > -1) {
									logday(arguments[1]);
								} else {
									console.log("404 Entry Not Found");
								}
							} else if (/^#.*/g.test(arguments[1]) == true) {
								findtag(datestring, arguments[1], "RLT");
							} else if (arguments[1] == "tasks") {
								console.log("\x1b[47m\x1b[30m\x1b[4m"+datestring+"\x1b[0m"+"\n"+"\x1b[47m\x1b[30m"+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(datestring)+1].day]+"\x1b[0m");
								console.log("\x1b[47m\x1b[30m"+rlt[2]+"\x1b[0m"+"\n");
								for (var i = 0; i < journal.entries[journal.entries.indexOf(datestring)+1].tasks.length; i++) {
									console.log(processentry(journal.entries[journal.entries.indexOf(datestring)+1].tasks[i])+"\n");
								}
								console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(datestring)+1].touched.replace("~", "-")+"\x1b[0m");
							} else if (arguments[1] == "logs") {
								console.log("\x1b[47m\x1b[30m\x1b[4m"+datestring+"\x1b[0m"+"\n"+"\x1b[47m\x1b[30m"+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(datestring)+1].day]+"\x1b[0m");
								console.log("\x1b[47m\x1b[30m"+rlt[1]+"\x1b[0m"+"\n");
								for (var i = 0; i < journal.entries[journal.entries.indexOf(datestring)+1].logs.length; i++) {
									console.log(processentry(journal.entries[journal.entries.indexOf(datestring)+1].logs[i])+"\n");
								}
								console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(datestring)+1].touched.replace("~", "-")+"\x1b[0m");
							} else if (arguments[1] == "records") {
								console.log("\x1b[47m\x1b[30m\x1b[4m"+datestring+"\x1b[0m"+"\n"+"\x1b[47m\x1b[30m"+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(datestring)+1].day]+"\x1b[0m");
								console.log("\x1b[47m\x1b[30m"+rlt[0]+"\x1b[0m"+"\n");
								for (var i = 0; i < journal.entries[journal.entries.indexOf(datestring)+1].records.length; i++) {
									console.log(processentry(journal.entries[journal.entries.indexOf(datestring)+1].records[i])+"\n");
								}
								console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(datestring)+1].touched.replace("~", "-")+"\x1b[0m");
							} else {
								console.log("I'm NOT reading that.");
							}
						} else if (arguments[3] == undefined) {
							if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true) {
								if (new Date(arguments[1]) < new Date(arguments[2])) {
									var tomorrow = new Date(arguments[1]);
									for (var i = 0; i < Math.round((new Date(arguments[2])-new Date(arguments[1]))/(1000*60*60*24))+1; i++) {
										var today = tomorrow.getFullYear()+"/";
										if ((tomorrow.getMonth()+1) < 10) {
											today += "0";
										}
										today += (tomorrow.getMonth()+1)+"/"; 
										if(tomorrow.getDate() < 10) {
											today += "0"
										}
										today += tomorrow.getDate();
										if (journal.entries.indexOf(today) > -1) {
											logday(today);
										}
										tomorrow.setDate(tomorrow.getDate() + 1);
									}
								} else {
									console.log("Nice try.");
								}
							} else if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true && /^#.*/g.test(arguments[2]) == true) {
								findtag(arguments[1], arguments[2], "RLT");
							} else if (arguments[1] == "tasks" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true) {
								if (journal.entries.indexOf(arguments[2]) > -1) {
									console.log("\x1b[47m\x1b[30m\x1b[4m"+arguments[2]+"\x1b[0m"+"\n"+"\x1b[47m\x1b[30m"+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(arguments[2])+1].day]+"\x1b[0m");
									console.log("\x1b[47m\x1b[30m"+rlt[2]+"\x1b[0m"+"\n");
									for (var i = 0; i < journal.entries[journal.entries.indexOf(arguments[2])+1].tasks.length; i++) {
										console.log(processentry(journal.entries[journal.entries.indexOf(arguments[2])+1].tasks[i])+"\n");
									}
									console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(arguments[2])+1].touched.replace("~", "-")+"\x1b[0m");
								} else {
									console.log("Nothing on the books.");
								}
							} else if (arguments[1] == "logs" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true) {
								if (journal.entries.indexOf(arguments[2]) > -1) {
									console.log("\x1b[47m\x1b[30m\x1b[4m"+arguments[2]+"\x1b[0m"+"\n"+"\x1b[47m\x1b[30m"+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(arguments[2])+1].day]+"\x1b[0m");
									console.log("\x1b[47m\x1b[30m"+rlt[1]+"\x1b[0m"+"\n");
									for (var i = 0; i < journal.entries[journal.entries.indexOf(arguments[2])+1].logs.length; i++) {
										console.log(processentry(journal.entries[journal.entries.indexOf(arguments[2])+1].logs[i])+"\n");
									}
									console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(arguments[2])+1].touched.replace("~", "-")+"\x1b[0m");
								} else {
									console.log("Nothing on the books.");
								}
							} else if (arguments[1] == "records" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true) {
								if (journal.entries.indexOf(arguments[2]) > -1) {
									console.log("\x1b[47m\x1b[30m\x1b[4m"+arguments[2]+"\x1b[0m"+"\n"+"\x1b[47m\x1b[30m"+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(arguments[2])+1].day]+"\x1b[0m");
									console.log("\x1b[47m\x1b[30m"+rlt[0]+"\x1b[0m"+"\n");
									for (var i = 0; i < journal.entries[journal.entries.indexOf(arguments[2])+1].records.length; i++) {
										console.log(processentry(journal.entries[journal.entries.indexOf(arguments[2])+1].records[i])+"\n");
									}
									console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(arguments[2])+1].touched.replace("~", "-")+"\x1b[0m");
								} else {
									console.log("Nothing on the books.");
								}
							} else if (arguments[1] == "tasks" && /^#.*/g.test(arguments[2]) == true) {
								findtag(datestring, arguments[2], "T");
							} else if (arguments[1] == "records" && /^#.*/g.test(arguments[2]) == true) {
								findtag(datestring, arguments[2], "R");
							} else if (arguments[1] == "logs" && /^#.*/g.test(arguments[2]) == true) {
								findtag(datestring, arguments[2], "L");
							} else {
								console.log("What went wrong?");
							}
						} else if (arguments[4] == undefined) {
							if (arguments[1] == "tasks" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true && /^\d{4}\D\d\d\D\d\d/g.test(arguments[3]) == true) {
								if (new Date(arguments[2]) < new Date(arguments[3])) {
									var tomorrow = new Date(arguments[2]);
									for (var i = 0; i < Math.round((new Date(arguments[3])-new Date(arguments[2]))/(1000*60*60*24))+1; i++) {
										var today = tomorrow.getFullYear()+"/";
										if ((tomorrow.getMonth()+1) < 10) {
											today += "0";
										}
										today += (tomorrow.getMonth()+1)+"/"; 
										if(tomorrow.getDate() < 10) {
											today += "0"
										}
										today += tomorrow.getDate();
										if (journal.entries.indexOf(today) > -1) {
											console.log("\x1b[47m\x1b[30m\x1b[4m"+today+"\x1b[0m"+"\n"+"\x1b[47m\x1b[30m"+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(today)+1].day]+"\x1b[0m");
											console.log("\x1b[47m\x1b[30m"+rlt[2]+"\x1b[0m"+"\n");
											for (var j = 0; j < journal.entries[journal.entries.indexOf(today)+1].tasks.length; j++) {
												console.log(processentry(journal.entries[journal.entries.indexOf(today)+1].tasks[j])+"\n");
											}
											console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(today)+1].touched.replace("~", "-")+"\x1b[0m");
										}
										tomorrow.setDate(tomorrow.getDate() + 1);
									}
								} else {
									console.log("Nice try.");
								}
							} else if (arguments[1] == "records" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true && /^\d{4}\D\d\d\D\d\d/g.test(arguments[3]) == true) {
								if (new Date(arguments[2]) < new Date(arguments[3])) {
									var tomorrow = new Date(arguments[2]);
									for (var i = 0; i < Math.round((new Date(arguments[3])-new Date(arguments[2]))/(1000*60*60*24))+1; i++) {
										var today = tomorrow.getFullYear()+"/";
										if ((tomorrow.getMonth()+1) < 10) {
											today += "0";
										}
										today += (tomorrow.getMonth()+1)+"/"; 
										if(tomorrow.getDate() < 10) {
											today += "0"
										}
										today += tomorrow.getDate();
										if (journal.entries.indexOf(today) > -1) {
											console.log("\x1b[47m\x1b[30m\x1b[4m"+today+"\x1b[0m"+"\n"+"\x1b[47m\x1b[30m"+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(today)+1].day]+"\x1b[0m");
											console.log("\x1b[47m\x1b[30m"+rlt[0]+"\x1b[0m"+"\n");
											for (var j = 0; j < journal.entries[journal.entries.indexOf(today)+1].records.length; j++) {
												console.log(processentry(journal.entries[journal.entries.indexOf(today)+1].records[j])+"\n");
											}
											console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(arguments[2])+1].touched.replace("~", "-")+"\x1b[0m");
										}
										tomorrow.setDate(tomorrow.getDate() + 1);
									}
								} else {
									console.log("Nice try.");
								}
							} else if (arguments[1] == "logs" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true && /^\d{4}\D\d\d\D\d\d/g.test(arguments[3]) == true) {
								if (new Date(arguments[2]) < new Date(arguments[3])) {
									var tomorrow = new Date(arguments[2]);
									for (var i = 0; i < Math.round((new Date(arguments[3])-new Date(arguments[2]))/(1000*60*60*24))+1; i++) {
										var today = tomorrow.getFullYear()+"/";
										if ((tomorrow.getMonth()+1) < 10) {
											today += "0";
										}
										today += (tomorrow.getMonth()+1)+"/"; 
										if(tomorrow.getDate() < 10) {
											today += "0"
										}
										today += tomorrow.getDate();
										if (journal.entries.indexOf(today) > -1) {
											console.log("\x1b[47m\x1b[30m\x1b[4m"+today+"\x1b[0m"+"\n"+"\x1b[47m\x1b[30m"+"\x1b[4m"+week[journal.entries[journal.entries.indexOf(today)+1].day]+"\x1b[0m");
											console.log("\x1b[47m\x1b[30m"+rlt[1]+"\x1b[0m"+"\n");
											for (var j = 0; j < journal.entries[journal.entries.indexOf(today)+1].logs.length; j++) {
												console.log(processentry(journal.entries[journal.entries.indexOf(today)+1].logs[j])+"\n");
											}
											console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(today)+1].touched.replace("~", "-")+"\x1b[0m");
										}
										tomorrow.setDate(tomorrow.getDate() + 1);
									}
								} else {
									console.log("Nice try.");
								}
							} else if (arguments[1] == "tasks" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true && /^#.*/g.test(arguments[3]) == true) {
								findtag(arguments[2], arguments[3], "T");
							} else if (arguments[1] == "logs" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true && /^#.*/g.test(arguments[3]) == true) {
								findtag(arguments[2], arguments[3], "L");
							} else if (arguments[1] == "records" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true && /^#.*/g.test(arguments[3]) == true) {
								findtag(arguments[2], arguments[3], "R");
							} else if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[1]) == true && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true && /^#.*/g.test(arguments[3]) == true) {
								if (new Date(arguments[1]) < new Date(arguments[2])) {
									var tomorrow = new Date(arguments[1]);
									for (var i = 0; i < Math.round((new Date(arguments[2])-new Date(arguments[1]))/(1000*60*60*24))+1; i++) {
										var today = tomorrow.getFullYear()+"/";
										if ((tomorrow.getMonth()+1) < 10) {
											today += "0";
										}
										today += (tomorrow.getMonth()+1)+"/"; 
										if(tomorrow.getDate() < 10) {
											today += "0"
										}
										today += tomorrow.getDate();
										if (journal.entries.indexOf(today) > -1) {
											findtag(today,arguments[3],"RLT", true);
										}
										tomorrow.setDate(tomorrow.getDate() + 1);
									}
								} else {
									console.log("Nice try.");
								}
							} else {
								console.log("A wild error has appeared.");
							}
						} else if (arguments[1] == "tasks" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true && /^\d{4}\D\d\d\D\d\d/g.test(arguments[3]) == true && /^#.*/g.test(arguments[4]) == true) {
							if (new Date(arguments[2]) < new Date(arguments[3])) {
								var tomorrow = new Date(arguments[2]);
								for (var i = 0; i < Math.round((new Date(arguments[3])-new Date(arguments[2]))/(1000*60*60*24))+1; i++) {
									var today = tomorrow.getFullYear()+"/";
									if ((tomorrow.getMonth()+1) < 10) {
										today += "0";
									}
									today += (tomorrow.getMonth()+1)+"/"; 
									if(tomorrow.getDate() < 10) {
										today += "0"
									}
									today += tomorrow.getDate();
									if (journal.entries.indexOf(today) > -1) {
										findtag(today,arguments[4],"T", true);
									}
									tomorrow.setDate(tomorrow.getDate() + 1);
								}
							} else {
								console.log("Nice try.");
							}
						} else if (arguments[1] == "logs" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true && /^\d{4}\D\d\d\D\d\d/g.test(arguments[3]) == true && /^#.*/g.test(arguments[4]) == true) {
							if (new Date(arguments[2]) < new Date(arguments[3])) {
								var tomorrow = new Date(arguments[2]);
								for (var i = 0; i < Math.round((new Date(arguments[3])-new Date(arguments[2]))/(1000*60*60*24))+1; i++) {
									var today = tomorrow.getFullYear()+"/";
									if ((tomorrow.getMonth()+1) < 10) {
										today += "0";
									}
									today += (tomorrow.getMonth()+1)+"/"; 
									if(tomorrow.getDate() < 10) {
										today += "0"
									}
									today += tomorrow.getDate();
									if (journal.entries.indexOf(today) > -1) {
										findtag(today,arguments[4],"L", true);
									}
									tomorrow.setDate(tomorrow.getDate() + 1);
								}
							} else {
								console.log("Nice try.");
							}
						} else if (arguments[1] == "records" && /^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true && /^\d{4}\D\d\d\D\d\d/g.test(arguments[3]) == true && /^#.*/g.test(arguments[4]) == true) {
							if (new Date(arguments[2]) < new Date(arguments[3])) {
								var tomorrow = new Date(arguments[2]);
								for (var i = 0; i < Math.round((new Date(arguments[3])-new Date(arguments[2]))/(1000*60*60*24))+1; i++) {
									var today = tomorrow.getFullYear()+"/";
									if ((tomorrow.getMonth()+1) < 10) {
										today += "0";
									}
									today += (tomorrow.getMonth()+1)+"/"; 
									if(tomorrow.getDate() < 10) {
										today += "0"
									}
									today += tomorrow.getDate();
									if (journal.entries.indexOf(today) > -1) {
										findtag(today,arguments[4],"R", true);
									}
									tomorrow.setDate(tomorrow.getDate() + 1);
								}
							} else {
								console.log("Nice try.");
							}
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