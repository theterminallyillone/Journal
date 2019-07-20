#!/usr/bin/env nodejs
var fs = require("fs");
var crypto = require('crypto');
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
		fs.writeFile("journal.json", JSON.stringify(entry),function(){});
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
				return "\x1b[47m\x1b[37m"+str.replace(/[^\n]/g, "*").replace(/\n/g, "\x1b[0m\n\x1b[47m\x1b[37m")+"\x1b[0m";
			} else {
				return rstr.replace(/\* /g, "\n");
			}
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
				console.log(hilite("("+selectionlength+")", "default")+" "+processentry(journal.entries[journal.entries.indexOf(searchdate)+1].records[i]+"\n"));
				selectionlength++;
			}
			console.log(h+rlt[1]+r+"\n");
			for (var i = 0; i < journal.entries[journal.entries.indexOf(searchdate)+1].logs.length; i++) {
				selections.push(selectionlength.toString());
				selections.push("L"+i+journal.entries[journal.entries.indexOf(searchdate)+1].logs[i].substr(journal.entries[journal.entries.indexOf(searchdate)+1].logs[i].indexOf("~"), journal.entries[journal.entries.indexOf(searchdate)+1].logs[i].length));
				console.log(hilite("("+selectionlength+")", "default")+" "+processentry(journal.entries[journal.entries.indexOf(searchdate)+1].logs[i]+"\n"));
				selectionlength++;
			}
			console.log(h+rlt[2]+r+"\n");
			for (var i = 0; i < journal.entries[journal.entries.indexOf(searchdate)+1].tasks.length; i++) {
				selections.push(selectionlength.toString());
				selections.push("T"+i+"~");
				console.log(hilite("("+selectionlength+")", "default")+" "+processentry(journal.entries[journal.entries.indexOf(searchdate)+1].tasks[i]+"\n"));
				selectionlength++;
			}
			console.log("\x1b[33m~"+journal.entries[journal.entries.indexOf(searchdate)+1].touched.replace("~", "-")+r);
			return selections;
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
		function encrypt(str, password) {
			var cipher = crypto.createCipher('aes-256-ctr',password);
			var crypted = cipher.update(str,'utf8','hex');
  			crypted += cipher.final('hex');
			return crypted;
		}
		function decrypt(str, password) {
			var decipher = crypto.createDecipher('aes-256-ctr',password);
			var dec = decipher.update(str,'hex','utf8');
			dec += decipher.final('utf8');
			return dec;
		}
		function print(RLT, day) {
			var book = "";
			book += day+"\n"+week[journal.entries[journal.entries.indexOf(day)+1].day].replace(" ", "")+"\n";
			if (RLT.indexOf("R") > -1) {
				book+="Records\n";
				for (var i = 0; i < journal.entries[journal.entries.indexOf(day)+1].records.length; i++) {
					var redacted = false;
					for (var j = 0; j < journal.redacted.length; j++) {
						if (journal.entries[journal.entries.indexOf(day)+1].records[i].indexOf(journal.redacted[j]) > -1) {
							redacted = true;
						}
					}
					if (!redacted) {
						book += journal.entries[journal.entries.indexOf(day)+1].records[i]+"\n";
					} else {
						book += journal.entries[journal.entries.indexOf(day)+1].records[i].replace(/[^\n]/g, "*")+"\n";
					}
				}
			}
			if (RLT.indexOf("L") > -1) {
				book += "Logs\n";
				for (var i = 0; i < journal.entries[journal.entries.indexOf(day)+1].logs.length; i++) {
					var redacted = false;
					for (var j = 0; j < journal.redacted.length; j++) {
						if (journal.entries[journal.entries.indexOf(day)+1].logs[i].indexOf(journal.redacted[j]) > -1) {
							redacted = true;
						}
					}
					if (!redacted) {
						book += journal.entries[journal.entries.indexOf(day)+1].logs[i]+"\n";
					} else {
						book += journal.entries[journal.entries.indexOf(day)+1].logs[i].replace(/[^\n]/g, "*")+"\n";
					}
				}
			}
			if (RLT.indexOf("T") > -1) {
				book += "Tasks\n";
				for (var i = 0; i < journal.entries[journal.entries.indexOf(day)+1].tasks.length; i++) {
					var redacted = false;
					for (var j = 0; j < journal.redacted.length; j++) {
						if (journal.entries[journal.entries.indexOf(day)+1].tasks[i].indexOf(journal.redacted[j]) > -1) {
							redacted = true;
						}
					}
					if (!redacted) {
						book += journal.entries[journal.entries.indexOf(day)+1].tasks[i]+"\n";
					} else {
						book += journal.entries[journal.entries.indexOf(day)+1].tasks[i].replace(/[^\n]/g, "*")+"\n";
					}
				}
			}
			book += "~"+journal.entries[journal.entries.indexOf(day)+1].touched.replace("~", "-");
			return book;
		}
		if (arguments[0] != undefined) {
			switch (arguments[0]) {
				case "help":
					console.log("OPTIONS:");
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
					console.log("webview (port)");
					console.log("  initiates a webserver on specified port, default is 8080");
					console.log("print (file.txt) (tasks || logs || records || date) (date) (date)");
					console.log("  builds a human readable text for a date range");
					console.log("export (file.dat)");
					console.log("  spawns json");
					console.log("import (file.dat)");
					console.log("  copies json");
					console.log("burn");
					console.log("  destroys unexported json");
					break;
				case "burn":
					console.log("Are you sure? (Y/N)");
					rl.resume();
					rl.on('line', (input) => {
						if (input.toUpperCase() == "Y") {
							fs.unlink("journal.json", (err) => {
								console.log("Your journal.json bursts into flames.");
							});
						} else {
							console.log("Aborted");
						}
						rl.pause();
					});
					break;
				case "print":
					var book = "";
					if (arguments[1] == undefined || /^.*\.txt/g.test(arguments[1]) == false) {
						console.log("Where?");
					} else if (arguments[2] == undefined) {
						book += arguments[1].substring(arguments[1].lastIndexOf("/")+1, arguments[1].lastIndexOf("."))+"\n";
						book += print("RLT", datestring);
						fs.writeFile(arguments[1], book,function(){});
					} else if (arguments[3] == undefined) { 
						book += arguments[1].substring(arguments[1].lastIndexOf("/")+1, arguments[1].lastIndexOf("."))+"\n";
						if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true && journal.entries.indexOf(arguments[2]) > -1) {
							book += print("RLT", arguments[2]);
						} else if (arguments[2] == "tasks") {
							book += print("T", datestring);
						} else if (arguments[2] == "records") {
							book += print("R", datestring);
						} else if (arguments[2] == "logs") {
							book += print("L", datestring);
						} else {
							console.log("What?");
							break;
						}
						fs.writeFile(arguments[1], book, function(){});
					} else if (arguments[4] == undefined && /^\d{4}\D\d\d\D\d\d/g.test(arguments[3]) == true) {
						book += arguments[1].substring(arguments[1].lastIndexOf("/")+1, arguments[1].lastIndexOf("."))+"\n";
						if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[2]) == true) {
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
										book += print("RLT", today)+"\n";
									}
									tomorrow.setDate(tomorrow.getDate() + 1);
								}
							} else {
								console.log("Nice try.");
								break;
							}
						} else if (arguments[2] == "tasks" && journal.entries.indexOf(arguments[3]) > -1) {
							book += print("T", arguments[3]);
						} else if (arguments[2] == "records" && journal.entries.indexOf(arguments[3]) > -1) {
							book += print("R", arguments[3]);
						} else if (arguments[2] == "logs" && journal.entries.indexOf(arguments[3]) > -1) {
							book += print("L", arguments[3]);
						} else {
							console.log("What?");
							break;
						}
						fs.writeFile(arguments[1], book, function(){});
					} else if (/^\d{4}\D\d\d\D\d\d/g.test(arguments[3]) == true && /^\d{4}\D\d\d\D\d\d/g.test(arguments[4]) == true) {
						book += arguments[1].substring(arguments[1].lastIndexOf("/")+1, arguments[1].lastIndexOf("."))+"\n";
						if (arguments[2] == "tasks") {
							if (new Date(arguments[3]) < new Date(arguments[4])) {
								var tomorrow = new Date(arguments[3]);
								for (var i = 0; i < Math.round((new Date(arguments[4])-new Date(arguments[3]))/(1000*60*60*24))+1; i++) {
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
										book += print("T", today)+"\n";
									}
									tomorrow.setDate(tomorrow.getDate() + 1);
								}
							} else {
								console.log("Nice try.");
								break;
							}
						} else if (arguments[2] == "records") {
							if (new Date(arguments[3]) < new Date(arguments[4])) {
								var tomorrow = new Date(arguments[3]);
								for (var i = 0; i < Math.round((new Date(arguments[4])-new Date(arguments[3]))/(1000*60*60*24))+1; i++) {
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
										book += print("R", today)+"\n";
									}
									tomorrow.setDate(tomorrow.getDate() + 1);
								}
							} else {
								console.log("Nice try.");
								break;
							}
						} else if (arguments[2] == "logs") {
							if (new Date(arguments[3]) < new Date(arguments[4])) {
								var tomorrow = new Date(arguments[3]);
								for (var i = 0; i < Math.round((new Date(arguments[4])-new Date(arguments[3]))/(1000*60*60*24))+1; i++) {
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
										book += print("L", today)+"\n";
									}
									tomorrow.setDate(tomorrow.getDate() + 1);
								}
							} else {
								console.log("Nice try.");
								break;
							}
						} else {
							console.log("What?");
							break;
						}
						fs.writeFile(arguments[1], book, function(){});
					} else {
						console.log("The printer is jammed.");
					}
					break;
				case "export":
					var path;
					if (arguments[1] != undefined && /^.*\.dat/g.test(arguments[1]) == true) {
						path = arguments[1]
						console.log("Your password, please?");
						rl.stdoutMuted = true;
						rl.query = "(-.^) ";
						rl.question(rl.query, function(password1) {
							console.log("\nAnd, once more?");
							rl.question(rl.query, function(password2) {
								if (password1 == password2) {
									fs.writeFile(path, encrypt(JSON.stringify(journal), password2), function(){});
									console.log("\nIt is done.");
								} else {
									console.log("\nAmnesia?");
								}
								rl.close();
							});
						});
						rl._writeToOutput = function _writeToOutput(stringToWrite) {
							if (rl.stdoutMuted) {
								rl.output.write("\x1B[2K\x1B[200D"+"("+((rl.line.length%2==1)?"^.-":"-.^")+") ");
							} else {
								rl.output.write(stringToWrite);
							}
						};
					} else {
						console.log("Where?");
					}
					break;
				case "import":
					if (arguments[1] != undefined && fs.existsSync(arguments[1]) && /^.*\.dat/g.test(arguments[1]) == true) {
						var path = arguments[1];
						console.log("Your password, please?");
						rl.stdoutMuted = true;
						rl.query = "(-.^) ";
						rl.question(rl.query, function(password) {
							fs.readFile(path,'utf8',function(err, data) {
								var book = JSON.parse(decrypt(data,password));
								for (var i = 0; i < book.entries.length; i+=2) {
									if (journal.entries.indexOf(book.entries[i]) == -1) {
										journal.entries.push(book.entries[i]);
										journal.entries.push(book.entries[i+1]);
										touch(book.entries[i]);
									} else {
										for (var j = 0; j < book.entries[i+1].records.length;j++) {
											if (journal.entries[journal.entries.indexOf(book.entries[i])+1].records.indexOf(book.entries[i+1].records[j]) == -1) {
												journal.entries[journal.entries.indexOf(book.entries[i])+1].records.push(book.entries[i+1].records[j]);
												touch(book.entries[i]);
											}
										}
										for (var j = 0; j < book.entries[i+1].logs.length;j++) {
											if (journal.entries[journal.entries.indexOf(book.entries[i])+1].logs.indexOf(book.entries[i+1].logs[j]) == -1) {
												journal.entries[journal.entries.indexOf(book.entries[i])+1].logs.push(book.entries[i+1].logs[j]);
												touch(book.entries[i]);
											}
										}
										for (var j = 0; j < book.entries[i+1].tasks.length;j++) {
											if (journal.entries[journal.entries.indexOf(book.entries[i])+1].tasks.indexOf(book.entries[i+1].tasks[j]) == -1) {
												journal.entries[journal.entries.indexOf(book.entries[i])+1].tasks.push(book.entries[i+1].tasks[j]);
												touch(book.entries[i]);
											}
										}
									}
								}
								journal.redacted = book.redacted;
								journal.hilited = book.hilited;
								fs.writeFile("journal.json", JSON.stringify(journal),function(){});
								console.log("\nIt is done.");
							});
							rl.close();
						});
						rl._writeToOutput = function _writeToOutput(stringToWrite) {
							if (rl.stdoutMuted) {
								rl.output.write("\x1B[2K\x1B[200D"+"("+((rl.line.length%2==1)?"^.-":"-.^")+") ");
							} else {
								rl.output.write(stringToWrite);
							}
						};
					} else {
						console.log("Where?");
					}
					break;
				case "webview":
					var PORT;
					if (arguments[1] != undefined && Number(arguments[1]) >= 1024 && Number(arguments[1]) <= 49151) {
						PORT = arguments[1];
					} else if (arguments[1] == undefined) {
						PORT = 8080;
					} else {
						console.log("Where?");
						break;
					}
					var os = require('os');
					var networkInterfaces = os.networkInterfaces();
					if (networkInterfaces.wlan0 != undefined) {
						console.log("Here's that server: http://"+networkInterfaces.wlan0[0].address+":"+PORT);
					} else if (networkInterfaces.eth0 != undefined) {
						console.log("Here's that server: http://"+networkInterfaces.eth0[0].address+":"+PORT);
					} else {
						console.log("Here's that server: http://localhost:"+PORT);
					}
					var document = "<!DOCTYPE html><html><head><title>Journal</title></head>";
					document += "<style>.green { background-color: green} .yellow { background-color: yellow} .magenta { background-color: magenta } .cyan {background-color: cyan} .blue { background-color: blue} .red { background-color: red }</style>";
					document += "<body bgcolor='#000000'><div id='container'></div><script>";
					document += "function hilite(str,color){ if (color == 'default') { color = journal.hilited[journal.hilited.indexOf('default')+1]; }return '<span style=\"position:relative\" class='+color+'>'+str+'</span>';}";
					document += "function processentry(str) {var pstr = str.replace(/\\n/g, ' * ').split(' '); var rstr = '';var redacted = false;for (var i = 0; i < journal.redacted.length; i++) {if (pstr.indexOf(journal.redacted[i]) > -1) {redacted = true;}} if (!redacted) {for (var i = 0; i < pstr.length; i++) {if (journal.hilited.indexOf(pstr[i]) > -1) {pstr[i]=hilite(pstr[i], journal.hilited[journal.hilited.indexOf(pstr[i])+1]);} else if (/^#.*/g.test(pstr[i]) == true) {pstr[i]=hilite(pstr[i], 'default');} else if (/~\\d\\d:\\d\\d:\\d\\d/g.test(pstr[i]) == true) {pstr[i] = '<span style=\"color:red\">'+pstr[i]+'</span>';}rstr += pstr[i]+' ';}}if (redacted == true) {return '<span style=\"background-color:#000000\">'+str.replace(/[^\\n]/g, '*').replace(/\\n/g, '</span>\\n<span style=\"background-color:#000000\">')+'</span>';} else {return rstr.replace(/\\* /g, '\\n');}}";
					document += "var journal = "+JSON.stringify(journal)+";";
					document += "for (var i = 0; i < journal.entries.length; i+=2) { var added = ''; added += '<div style=\"background-color:#FFFFFF\" id='+\"c\"+journal.entries[i]+' onclick='+\"document.getElementById(\"+\'+journal.entries[i]+\'+\").style=\"+\'visibility:visible\'+'><h>'+journal.entries[i]+'</h></div><div style=\"background-color:#FFFFFF;visibility:hidden;\" id='+journal.entries[i]+'><center>'; added+='<div class=\"records\">'; for (var j = 0; j < journal.entries[i+1].records.length; j++) { added+=processentry(journal.entries[i+1].records[j]).replace(/\\n/g, '<br>');} added+='</div><div class=\"logs\">'; for (var j = 0; j < journal.entries[i+1].logs.length; j++) { added+=processentry(journal.entries[i+1].logs[j]).replace(/\\n/g, '<br>');} added+='</div><div class=\"tasks\">'; for (var j = 0; j < journal.entries[i+1].tasks.length; j++) { added+=processentry(journal.entries[i+1].tasks[j]).replace(/\\n/g, '<br>');} added+='</center></div>';";
					document += "added += '</div><br>'; document.getElementById('container').innerHTML += added;}";
					document += "</script></body></html>";
					var http = require('http');
					var server = http.createServer(function (req, res) {
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.write(document);
						res.end();
					})
					server.listen(PORT);
					rl.resume();
					rl.on('SIGINT', () => {
						console.log("Closing...");
						server.close();
						process.exit(0);
						rl.pause();
					});
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
									console.log(processentry(journal.entries[journal.entries.indexOf(searchdate)+1].logs[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)]));
								} else if (selections[selections.indexOf(somenumber)+1].substr(0,1) == "R") {
									console.log(processentry(journal.entries[journal.entries.indexOf(searchdate)+1].records[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)]));
								} else if (selections[selections.indexOf(somenumber)+1].substr(0,1) == "T") {
									console.log(processentry(journal.entries[journal.entries.indexOf(searchdate)+1].tasks[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)]));
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
										console.log(processentry(journal.entries[journal.entries.indexOf(searchdate)+1].logs[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)].substr(0, journal.entries[journal.entries.indexOf(searchdate)+1].logs[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)].indexOf("\n~"))));
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
										console.log(processentry(journal.entries[journal.entries.indexOf(searchdate)+1].records[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)].substr(0, journal.entries[journal.entries.indexOf(searchdate)+1].records[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)].indexOf("\n~"))));
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
										console.log(processentry(journal.entries[journal.entries.indexOf(searchdate)+1].tasks[selections[selections.indexOf(somenumber)+1].substr(1,selections[selections.indexOf(somenumber)+1].indexOf("~")-1)]));
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