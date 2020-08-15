let socket;
let socketId;

let drawing = [];
let bg = '#FFFFFF';
let active = false;
let lastMove = [];

let size = 10;

let currentColor = 0;
let hue = 126;
let value = 22;

let word;

let message = [];

let users = {};

let input, button;
let chat;

let avatar, clock, montserrat, montserratBold, pattern;

let timer;
let herere;

//#region Custom functions

function preload()
{
	avatar = loadImage('avatar.png');
	clock = loadImage('clock.png');
	pattern = loadImage('pattern.png');
	montserrat = loadFont('Montserrat.ttf');
	montserratBold = loadFont('Montserrat-Bold.ttf');
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

function inCanvas()
{
	return min(pmouseX, mouseX) > 240 && max(pmouseX, mouseX) < 1155 && min(pmouseY, mouseY) > 75 && max(pmouseY, mouseY) < 755;
}


//deutéranopie

function colorButton(x, y, w, h, id)
{
	push();
	
	noStroke();
	
	fill(idToColor(id));
	rect(x, y, w, h);
	
	pop()
	
	if(mouseIsPressed)
	{
		if(mouseX >= x && mouseX <= x+w && mouseY >= y && mouseY <= y+h)
		{
			currentColor = idToColor(id);
		}
	}
}

function idToColor(id)
{
	var c;
	switch(id)
	{
		case 0:
			c = color(255);
			break;
		case 1:
			c = color(191);
			break;
		case 2:
			c = color('#EF130B');
			break;
		case 3:
			c = color('#FF7100');
			break;
		case 4:
			c = color('#FFE400');
			break;
		case 5:
			c = color('#00CC00');
			break;
		case 6:
			c = color('#00B2FF');
			break;
		case 7:
			c = color('#231FD3');
			break;
		case 8:
			c = color('#A300BA');
			break;
		case 9:
			c = color(0);
			break;
		case 10:
			c = color('#4C4C4C');
			break;
		case 11:
			c = color('#740B07');
			break;
		case 12:
			c = color('#C23800');
			break;
		case 13:
			c = color('#E8A200');
			break;
		case 14:
			c = color('#005510');
			break;
		case 15:
			c = color('#00569E');
			break;
		case 16:
			c = color('#0E0865');
			break;
		case 17:
			c = color('#550069');
			break;
	}
	return c;
}

function colorToRGB(col)
{
	return 'rgb(' + red(col) + ', ' + green(col) + ', ' + blue(col) + ')';
}

function sizeButton(x, y, w, h, s)
{
	push()
	
	fill(255);
	rect(x, y, w, h);
	
	noFill();
	stroke(0);
	strokeWeight(2);
	
	circle(x+w/2, y+h/2, s);
	
	if(mouseIsPressed)
	{
		if(mouseX >= x && mouseX <= x+w && mouseY >= y && mouseY <= y+h)
		{
			size = s;
		}
	}
	
	pop();
}

//#endregion



function setup()
{
	createCanvas(1600, 900);
	
	input = createInput('username');
	input.position(90, 30);
	input.size(120);
	input.input(limitNameSize);
	
	button = createButton('Actualiser');
	button.position(220, 30);
	button.mousePressed(send);
	button.style('background-color', '#808080');
	
	chat = createInput();
	chat.position(1180, 743);
	chat.size(375);
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
	
	socket.on('bg',
		function(data)
		{
			bg = data;
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
					drawing = data.data.drawing;
					bg = data.data.bg;
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
	//#endregion Networking
}

function draw()
{
	background(36, 81, 149);
	
	var w = 1600 / pattern.width;
	var h = 900 / pattern.height;
	
	//console.log(w + " " + h);
	
	for(i = 0; i < w; i++)
	{
		for(j = 0; j < h; j++)
		{
			image(pattern, pattern.width*i, pattern.height*j);
		}
	}
	
	noStroke();
	fill(255);
	rect(0, 0, 1550, 60);
	
	imageMode(CENTER);
	image(clock, 36, 30);
	
	fill(20);
	textFont(montserrat);
	textAlign(CENTER, CENTER);
	textSize(24);
	text(timer || 0, 37, 30);
	
	if(word != undefined)
	{
		if(active)
		{
			text(word, 800, 30);
		}
		else
		{
			var w = textWidth("_")+3;
			for(i = 0; i < word.length; i++)
			{
				var str = word.charAt(i) == " " ? " " : "_";
				
				text(str, 800 + i*w, 30);
			}
		}
	}
	
	fill(bg);
	rect(240, 70, 920, 690); //Sketch
	
	fill(255);
	rect(1170, 70, 385, 690); //Chat
	
	textSize(16);
	
	var index = 0;
	imageMode(CORNER);
	for(var user in users)
	{
		var factor = index % 2 == 0 ? 0 : 30;
		
		fill(users[user].found ? color(151-factor, 216-factor, 127-factor): color(255-factor));
		rect(0, 70 + 55*index, 230, 55)
		
		image(avatar, 230-60, 70 + 55*index);
		
		var str = "";
		if(user == socketId){ str = "#";}
		str += users[user].name;
		
		fill(0);
		text(str, 115, 70 + 55/2 + index*55);
		
		index++;
	}
	/*var _y = active.index*55 + 70;
	triangle(10, _y + 55/5, 10, _y + 55/5*4, 40, _y + 55/2);*/
	
	textSize(14);
	textAlign(LEFT, TOP);
	for(var i = 0; i < message.length; i++)
	{
		var str = message[i].name;
		
		textFont(montserratBold);
		text(str, 1180, 80 + i*20);
		
		var width = textWidth(str);
		
		textFont(montserrat);
		text(message[i].msg, 1180 + width, 80 + i*20);
	}
	
	for(i = 0; i < drawing.length; i++)
	{
		var m = drawing[i];
		
		strokeWeight(m.s);
		stroke(m.c);
		line(m.x.a, m.y.a, m.x.b, m.y.b);
	}
	
	
	noFill();
	if(inCanvas())
	{
		strokeWeight(size);
		stroke(currentColor);
		
		line(pmouseX, pmouseY, mouseX, mouseY);
		
		strokeWeight(1);
		stroke(0);
		circle(mouseX, mouseY, size+1);
	}
	//#region Color change
	
	noStroke();
	fill(currentColor);
	rect(240, 770, 54, 54)
	
	for(i = 0; i < 9; i++)
	{
		colorButton(304 + 27*i, 770, 27, 27, i);
	}
	for(i = 9; i < 18; i++)
	{
		colorButton(304 + 27*(i-9), 770+27, 27, 27, i);
	}
	
	colorMode(HSB, 255);
	for(i = 0; i < 200; i++)
	{
		fill(floor(i/8)*8 * 1.275, 255, value*4.72);
		rect(560 + i, 770, 1, 54);
	}
	for(i = 0; i < 54; i++)
	{
		fill(0, 0, floor(i/8)*8 * 4.72);
		rect(770, 770 + i, 60, 1);
	}
	
	colorMode(RGB, 255);
	
	fill(255);
	rect(560 + hue + 2, 770, 4, 54);
	rect(770, 770 + value + 2, 60, 4);
	
	for(i = 0; i < 5; i++)
	{
		sizeButton(850 + i*60, 770, 54, 54, 5*(i+1));
	}
	
	//Clear
	
	fill(255);
	stroke(0);
	strokeWeight(3);
	if(active && mouseX >= 1160 && mouseX <= 1214 && mouseY >= 770 && mouseY <= 824)
	{
		stroke(25);
		fill(200);
		if(mouseIsPressed)
			socket.emit('clear');
	}
	
	rect(1160, 770, 54, 54, 15);
	line(1170, 780, 1204, 814);
	line(1170, 814, 1204, 780);
	
	//#endregion
}

function mouseDragged()
{
	if(mouseX >= 560 && mouseX <= 760 && mouseY >= 770 && mouseY <= 824)
	{
		hue = floor((mouseX-560)/8)*8;
		
		colorMode(HSB, 255);
		currentColor = color(hue*1.275, 255, value*4.72);
		colorMode(RGB, 255);
	}
	else if(mouseX >= 780 && mouseX <= 860 && mouseY >= 770 && mouseY <= 824)
	{
		value = floor((mouseY-770)/8)*8;
		
		colorMode(HSB, 255);
		currentColor = color(hue*1.275, 255, value*4.72);
		colorMode(RGB, 255);
	}
	else if(inCanvas() && active)
	{
		let data = {
			s: size,
			c: colorToRGB(currentColor),
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
	else if(keyCode == 66 && active)
	{
		bg = currentColor;
		socket.emit('bg', colorToRGB(bg));
	}
}