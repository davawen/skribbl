let socket;
let active;

let drawing = [];
let lastMove = 0;

let message = [];

let users = {};

let input, button;
let chat;

let avatar, unispace;

function preload()
{
	avatar = loadImage('public/avatar.png');
	unispace = loadFont('public/unispace.ttf');
}

function send()
{
	socket.emit('sendName', input.value());
}

function setup()
{
	createCanvas(1600, 700);
	
	input = createInput('username');
	input.position(10, 10);
	input.size(120);
	
	button = createButton('Actualiser');
	button.position(160, 10);
	button.mousePressed(send);
	
	chat = createInput();
	chat.position(1180, 710);
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
			
			if(data.type == 'users')
				users = data.data;
			else if(data.type == 'drawing')
				drawing = data.data;
		}
	);
	
	socket.on('sendMessage', 
		function(data)
		{
			message[message.length] = data.name + ": " + data.msg;
		}
	);
	
	//#endregion Networking
}

function draw()
{
	noStroke();
	fill(255);
	rect(236, 0, 922, 692); //Sketch
	rect(1170, 0, 385, 690); //Chat
	
	textSize(16);
	textFont(unispace);
	
	var index = 0;
	textAlign(CENTER, CENTER);
	for(var user in users)
	{
		fill(255);
		rect(0, 55*index, 226, 55)
		
		image(avatar, 226-60, 55*index);
		
		fill(0);
		text(users[user].name, 113, 55/2 + index*55);
		index++;
	}
	
	textAlign(LEFT, TOP);
	for(var i = 0; i < message.length; i++)
	{
		text(message[i], 1180, 10 + i*20);
	}
	
	strokeWeight(10);
	stroke(0);
	for(i = 0; i < drawing.length; i++)
	{
		var m = drawing[i];
		line(m.x.a, m.y.a, m.x.b, m.y.b);
	}
}

function mouseDragged()
{
	if(mouseX > 236)
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