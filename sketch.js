let socket;
let active;

let drawing = [];
let message = [];

let users = {};

let input, button;
let chat, chatButton;

let avatar;

function preload()
{
	avatar = loadImage('public/avatar.png');
}

function send()
{
	socket.emit('sendName', input.value());
}

function setup()
{
	createCanvas(1600, 700);
	
	input = createInput('username');
	input.position(5, 5);
	input.width = 60;
	
	button = createButton('Envoyer');
	button.position(65+button.width+10, 5);
	button.mousePressed(send);
	
	chat = createInput();
	chat.position(1180, 700);
	chat.width = 100;
	
	socket = io.connect();
	
	send();
	
	socket.on('mouse',
		function(data)
		{
			m[m.length] = data;
		}
	);
	
	socket.on('load', 
		function(data)
		{
			users = data.userData;
			drawing = data.drawingData;
		}
	);
}



function mouseDragged()
{
	if(mouseX > 236)
	{
		let data = {
			x: {a: pmouseX, b: mouseX},
			y: {a: pmouseY, b: mouseY}
		};
		drawing[drawing.length] = data;
		// Send that object to the socket
		socket.emit('mouse',data);
	}
}

function keyPressed()
{
	if(keyCode == 82)
	{
		m.length = 0;
	}
}

function draw()
{
	noStroke();
	fill(255);
	rect(236, 0, 922, 692);
	
	var index = 0;
	textAlign(CENTER, CENTER);
	for(var user in users)
	{
		fill(index % 2 == 0 ? 255 : 200);
		rect(0, 55*index, 226, 55)
		
		image(avatar, 226-60, 55*index);
		
		fill(0);
		text(users[user].name, 113, 22 + index*55);
		index++;
	}
	
	fill(255);
	rect(1170, 0, 385, 690);
	
	textAlign(LEFT, TOP);
	for(var i = 0; i < message.length; i++)
	{
		
	}
	
	strokeWeight(10);
	stroke(0);
	for(i = 0; i < m.length; i++)
	{
		var m = drawing[i];
		line(m.x.a, m.y.a, m.x.b, m.y.b);
	}
}