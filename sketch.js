let socket;
let socketId;

let drawing = [];
let active = false;
let lastMove = [];

let word;

let message = [];

let users = {};

let input, button;
let chat;

let avatar, clock;

let timer;

function preload()
{
	avatar = loadImage('public/avatar.png');
	clock = loadImage('public/clock.png');
}

function send()
{
	socket.emit('sendName', input.value());
}

function limitChatSize()
{
	if(textWidth(users[socketId].name + ": " + chat.value()) > 370)
	{
		chat.value(chat.value().substring(0, chat.value().length-1));
	}
}

function limitNameSize()
{
	if(input.value().length > 12)
	{
		input.value(input.value().substring(0, 12));
	}
}

function setup()
{
	createCanvas(1600, 800);
	
	input = createInput('username');
	input.position(10, 10);
	input.size(120);
	input.input(limitNameSize);
	
	button = createButton('Actualiser');
	button.position(160, 10);
	button.mousePressed(send);
	
	chat = createInput();
	chat.position(1180, 780);
	chat.size(370);
	chat.input(limitChatSize);
	
	//#region Networking
	
	socket = io.connect();
	
	send();
	
	socket.on('mouse',
		function(data)
		{
			drawing[drawing.length] = data;
		}
	);
	
	socket.on('load', 
		function(data)
		{
			//console.log(data);
			socketId = socket.id;
			
			switch(data.type)
			{
				case 'users':
					users = data.data;
					break;
				case 'active':
					var index = 0;
					for(var id in users)
					{
						if(id == socketId)
						{
							active = data.data == index;
							break;
						}
						index++;
					}
					break;
				case 'drawing':
					drawing = data.data;
					break;
				case 'timer':
					timer = data.data;
					break;
				case 'word':
					word = data.data;
					break;
			}
		}
	);
	
	socket.on('sendMessage', 
		function(data)
		{
			message[message.length] = {'name': data.name, 'msg': ": "+data.msg};
		}
	);
	
	socket.on('foundWord',
		function(data)
		{
			message[message.length] = {'name': users[data].name, 'msg': " a trouvé le mot!"};
			users[data].found = true;
		}
	);
	
	socket.on('undo',
		function(data)
		{
			drawing.splice(data, 1);
		}
	);
	
	//#endregion Networking
}

function draw()
{
	background(36, 81, 149);
	
	noStroke();
	fill(255);
	rect(0, 0, 1550, 60);
	
	imageMode(CENTER);
	image(clock, 36, 30);
	
	fill(20);
	textAlign(CENTER, CENTER);
	textSize(24);
	text(timer || 0, 37, 34);
	
	if(word != undefined)
	{
		if(active)
		{
			text(word, 800, 34);
		}
		else
		{
			for(i = 0; i < word.length-1; i++)
			{
				text("_", 800 + i*20, 34);
			}
		}
	}
	
	fill(255);
	rect(236, 70, 920, 692); //Sketch
	rect(1170, 70, 385, 690); //Chat
	
	textSize(16);
	
	var index = 0;
	imageMode(CORNER);
	for(var user in users)
	{
		var factor = index % 2 == 0 ? 0 : 30;
		
		fill(users[user].found ? color(151-factor, 216-factor, 127-factor): color(255-factor));
		rect(0, 70 + 55*index, 226, 55)
		
		image(avatar, 226-60, 70 + 55*index);
		
		var str = "";
		if(user == socketId){ str = "#";}
		str += users[user].name;
		
		fill(0);
		text(str, 113, 70 + 55/2 + index*55);
		
		index++;
	}
	/*var _y = active.index*55 + 70;
	triangle(10, _y + 55/5, 10, _y + 55/5*4, 40, _y + 55/2);*/
	
	textSize(14);
	textAlign(LEFT, TOP);
	for(var i = 0; i < message.length; i++)
	{
		var str = message[i].name;
		
		textStyle(BOLD);
		text(str, 1180, 80 + i*20);
		
		var width = textWidth(str);
		
		textStyle(NORMAL);
		text(message[i].msg, 1180 + width, 80 + i*20);
	}
	
	strokeWeight(10);
	stroke(0);
	for(i = 0; i < drawing.length; i++)
	{
		var m = drawing[i];
		line(m.x.a, m.y.a, m.x.b, m.y.b);
	}
	
	if(inCanvas())
	{
		line(pmouseX, pmouseY, mouseX, mouseY);
	}
}

function inCanvas()
{
	return min(pmouseX, mouseX) > 240 && max(pmouseX, mouseX) < 1155 && min(pmouseY, mouseY) > 75 && max(pmouseY, mouseY) < 755;
}

function mouseDragged()
{
	if(inCanvas() && active)
	{
		let data = {
			x: {a: pmouseX, b: mouseX},
			y: {a: pmouseY, b: mouseY}
		};
		
		if(lastMove.length < 50)
			lastMove[lastMove.length] = drawing.length;
		
		
		drawing[drawing.length] = data;
		// Send that object to the socket
		socket.emit('mouse',data);
	}
}

function keyPressed()
{
	if(keyCode == ENTER)
	{
		var msg = chat.value();
		if(msg == "") return;
		
		if(msg.startsWith('*'))
		{
			msg = msg.substring(1);
			
			message[message.length] = {'name': users[socketId].name, 'msg': ": "+msg};
			socket.emit('sendMessage', msg);
		}
		else if(!active)
		{
			var similarity = stringSimilarity.compareTwoStrings(msg, word);
			console.log(similarity);
			
			if(similarity > .95)
			{
				socket.emit('foundWord');
				message[message.length] = {'name': users[socketId].name, 'msg': " a trouvé le mot!"};
				users[socketId].found = true;
			}
			else if(similarity > .8)
			{
				message[message.length] = {'name': "", 'msg': msg + " est proche."};
			}
		}
		
		chat.value("");
	}
	
	if(keyCode == 82 && lastMove.length > 0)
	{
		socket.emit('undo', lastMove[lastMove.length-1]);
		drawing.splice(lastMove[lastMove.length-1], 1);
		
		lastMove.pop();
	}
}