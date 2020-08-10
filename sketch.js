let socket;
let data;
let m = [];
let usernames = {};

function setup()
{
	createCanvas(600, 600);
	
	socket = io.connect();
	
	socket.on('mouse',
		function(data)
		{
			m[m.length] = data;
		}
	);
	
}

function mouseDragged()
{
	let data = {
		x: mouseX,
		y: mouseY
	};
	m[m.length] = data;
	// Send that object to the socket
	socket.emit('mouse',data);
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
	background(0);
	
	
	noStroke();
	fill(255);
	
	for(i = 0; i < m.length; i++)
	{
		circle(m[i].x, m[i].y, 10);
	}
}