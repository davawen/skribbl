let socket;
let socketId;

let active;

let drawing = [];
let lastMove = 0;

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

function setup()
{
	createCanvas(1600, 800);
	
	input = createInput('username');
	input.position(10, 10);
	input.size(120);
	
	button = createButton('Actualiser');
	button.position(160, 10);
	button.mousePressed(send);
	
	chat = createInput();
	chat.position(1180, 780);
	chat.size(370);
	
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
				case 'drawing':
					drawing = data.data;
					break;
				case 'timer':
					timer = data.data;
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
	text(timer, 37, 34);
	
	fill(255);
	rect(236, 70, 920, 692); //Sketch
	rect(1170, 70, 385, 690); //Chat
	
	textSize(16);
	
	var index = 0;
	imageMode(CORNER);
	for(var user in users)
	{
		fill(255);
		rect(0, 70 + 55*index, 226, 55)
		
		image(avatar, 226-60, 70 + 55*index);
		
		fill(0);
		text(users[user].name, 113, 70 + 55/2 + index*55);
		index++;
	}
	
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
	return mouseX > 236 && mouseX < 1160 && mouseY > 70 && mouseY < 690;
}

function mouseDragged()
{
	if(inCanvas())
	{
		let data = {
			x: {a: pmouseX, b: mouseX},
			y: {a: pmouseY, b: mouseY}
		};
		lastMove = drawing.length;
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
		
		socket.emit('sendMessage', msg);
		chat.value("");
	}
}