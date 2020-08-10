let socket;

function setup()
{
	createCanvas(400, 400);
	
	socket = io.connect();
	
	socket.on('mouse',
		function(data)
		{
			// Draw a blue circle
			fill(0);
			noStroke();
			circle(data.x,data.y,10);
		}
	);
	
}

function draw()
{
	background(200);
	
	let data = {
		x: mouseX,
		y: mouseY
	};
	// Send that object to the socket
	socket.emit('mouse',data);
	
	/*noStroke();
	fill(0);
	circle(mouseX, mouseY, 10);*/
}