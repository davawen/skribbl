let pos = [];

setup()
{
    
}

draw()
{
    pos[pos.length] = createVector(mouseX, mouseY);
    
    for(i = 0; i < pos.length; i++)
    {
        circle(pos[i].x, pos[i].y, 10);
    }
}