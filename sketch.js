let socket;
let data;
let m = [];

function setup()
{
	createCanvas(600, 600);
	
	socket = io.connect();
	
	
	
	socket.on('mouse',
		function(data)
		{
			console.log("Got: " + data.x + " " + data.y);
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