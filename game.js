var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 960;
canvas.height = 540;
canvas.oncontextmenu = function(){return false;};
document.body.appendChild(canvas);

var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

//Global variables
var fps = 0, drawFPS, thenFPS = 0;
var then = Date.now();
var setup = false;
var mousePosition = new Vec2(0,0);
var keyPresses = {};
var playerBoatX;
var playerBoatSpeed;
var playerGun;
var listoffish;
var listofbirds;
var listofshots;
var listofparticles;
var listofguns;
var nextFish;
var nextBird;
var nextShot;
var deadFish;
var deadBirds;
var collectedFish;
var muted = true;

//Type declarations
function Fish(inPosition, inSize, inCol, inSpeed)
{
	this.position = inPosition;
	this.size = inSize;
	this.colour = inCol;
	this.speed = inSpeed;
	this.dead = false;
	this.nextBubble = 1;
	this.upVel = 0;
}

function Bird(inPosition, inSize, inSpeed)
{
	this.position = inPosition;
	this.size = inSize;
	this.speed = inSpeed;
	this.colour = "rgb(0,0,0)";
	this.originalHeight = inPosition.y;
	this.carriedFish;
}

function Shot(inPosition, inVel, inSize)
{
	this.position = inPosition;
	this.velocity = inVel;
	this.size = inSize;
}

function Particle(inPosition, inSize, inLife, inVel, inGrav, inColour, inType)
{
	this.position = inPosition;
	this.size = inSize;
	this.life = inLife;
	this.velocity = inVel;
	this.gravity = inGrav;
	this.colour = inColour;
	this.type = inType;
}

function GunUpgrade(inGunName, inShotNum, inReloadSpeed, inSpread, inSound, inSpeed, inShotSize)
{
	this.gunName = inGunName;
	this.shotNum = inShotNum;
	this.reloadSpeed = inReloadSpeed;
	this.spread = inSpread;
	this.sound = inSound;
	this.shotSpeed = inSpeed;
	this.shotSize = inShotSize;
}

//Functions
//Looped
function main()
{
	if(!setup)
	{
		playerBoatX = canvas.width/2;
		playerBoatSpeed = 100;
		
		listofguns = [];
		listofguns.push(new GunUpgrade("pistol", 1, 0.2, Math.PI/40, new Audio("shotgunSound_cut.mp3"), 800, 4));
		listofguns.push(new GunUpgrade("shotgun", 8, 0.9, Math.PI/20, new Audio("shotgunSound_cut.mp3"), 800, 4));
		listofguns.push(new GunUpgrade("railgun", 1, 1, 0, new Audio("shotgunSound_cut.mp3"), 800, 20));
		playerGun = listofguns[1];
		
		listoffish = [];
		listofbirds = [];
		listofshots = [];
		listofparticles = [];
		nextFish = 0;
		nextBird = 0.5;
		nextShot = 0;
		
		deadFish = 0;
		deadBirds = 0;
		collectedFish = 0;
		
		setup = true;
	}
	var now = Date.now();
	var delta = now - then;
	then = now;
	
	move(delta/1000);
	render();
	
	requestAnimationFrame(main);
	
	fps++;
	if(now > thenFPS + 1000)
	{
		thenFPS = now;
		drawFPS = fps;
		fps = 0;
	}
}

function move(inDelta)
{
	if(keyPresses["m"] || keyPresses["U+004D"])
	{
		muted = !muted;
		keyPresses["m"] = false;
		keyPresses["U+004D"] = false;
		console.log("Muted:" + muted);
	}
	if(keyPresses["Left"] || keyPresses["ArrowLeft"])
	{
		playerBoatX -= playerBoatSpeed*inDelta;
	}
	if(keyPresses["Right"] || keyPresses["ArrowRight"])
	{
		playerBoatX += playerBoatSpeed*inDelta;
	}
	/*if(keyPresses["Up"] || keyPresses["ArrowUp"])
	{
		playerGun = listofguns[2];
	}
	if(keyPresses["Down"] || keyPresses["ArrowDown"])
	{
		playerBoatX += playerBoatSpeed*inDelta;
	}*/
	if(playerBoatX <= 80)
		playerBoatX = 80;
	if(playerBoatX >= canvas.width-80)
		playerBoatX = canvas.width-80;
	
	if(nextFish <= 0)
	{
		nextFish = 1;
		var randColour = "rgb(" + getRandomInt(0,255) + "," + getRandomInt(0,255) + "," + getRandomInt(0,255) + ")";
		listoffish.push(new Fish(new Vec2(0,getRandomNum(canvas.height/2+35,520)), getRandomNum(5,20), randColour, getRandomNum(75,150)));
	}
	if(nextBird <= 0)
	{
		nextBird = 1;
		listofbirds.push(new Bird(new Vec2(canvas.width,getRandomNum(20,canvas.height/2-75)), getRandomNum(10,20), getRandomNum(100,150)));
	}
	nextFish -= inDelta;
	nextBird -= inDelta;
	nextShot -= inDelta;
	
	for(var i = listoffish.length-1; i >= 0; i--)
	{
		var fish = listoffish[i];
		
		if(!fish.dead)
		{
			fish.position.x += fish.speed*inDelta;
			if(fish.nextBubble <= 0)
			{
				var vel = new Vec2(fish.speed/2,-50);
				listofparticles.push(new Particle(new Vec2(fish.position.x,fish.position.y), fish.size/2, getRandomNum(1,3), vel, new Vec2(0,-50), "rgb(150,217,230)", "bubble"));
				fish.nextBubble = getRandomNum(1,2);
			}
			fish.nextBubble -= inDelta;
		}
		else
		{
			if(fish.position.y > canvas.height/2)
			{
				//var vel = (canvas.height/2 - fish.position.y);
				//if(vel <= -200)
				//	vel = -200;
				fish.upVel += 100*inDelta;
				fish.upVel -= 75*inDelta;
				fish.upVel *= Math.pow(0.9,inDelta);
				fish.position.y -= fish.upVel*inDelta;
			}
			else
			{
				fish.upVel -= 75*inDelta;
				fish.upVel *= Math.pow(0.9,inDelta);
				fish.position.y -= fish.upVel*inDelta;
			}
					
			if(fish.position.y < canvas.height/2+20 && fish.position.y > canvas.height/2-20 && Math.abs(fish.position.x - playerBoatX) < 50)
			{
				listoffish.splice(i,1);
				collectedFish++;
				continue;
			}
		}
		
		if(fish.position.x > canvas.width + fish.size*2.5)
		{
			listoffish.splice(i,1);
			continue;
		}
	}
	for(var i = listofbirds.length-1; i >= 0; i--)
	{
		var bird = listofbirds[i];
		
		var fish = bird.carriedFish;
		if(!fish)
		{
			var closestFish = false;
			var closestDist = 300;
			var closestIndex = -1;
			
			for(var j = 0; j < listoffish.length; j++)
			{
				var fish = listoffish[j];
				
				if(fish.dead && fish.position.y < canvas.height/2+20)
				{
					var dist = bird.position.x - fish.position.x;
					if(dist >= 0 && dist < closestDist)
					{
						closestDist = dist;
						closestFish = fish;
						closestIndex = j;
					}
				}
			}
			
			if(closestFish)
			{
				if(distance(closestFish.position, bird.position) < closestFish.size*1.1)
				{
					bird.carriedFish = closestFish;
					listoffish.splice(closestIndex, 1);
				}
				
				var vel = multiplyVec(normaliseVec(subtractVec(addVec(closestFish.position, new Vec2(0,-closestFish.size)), bird.position)), bird.speed*inDelta);
				bird.position = addVec(bird.position, vel);
			}
			else
			{
				var vel = new Vec2(-bird.speed, 0);
				if(bird.position.y > bird.originalHeight)
					vel.y = (bird.originalHeight - bird.position.y);
				vel = multiplyVec(normaliseVec(vel),bird.speed*inDelta);
				bird.position = addVec(bird.position, vel);
			}
		}
		else
		{
			var vel = new Vec2(-bird.speed, 0);
			if(bird.position.y > bird.originalHeight)
				vel.y = (bird.originalHeight - bird.position.y);
			vel = multiplyVec(normaliseVec(vel),bird.speed*inDelta);
			bird.position = addVec(bird.position, vel);
			
			fish.position = addVec(bird.position, new Vec2(0,fish.size));
		}
		if(bird.position.x < -bird.size)
		{
			listofbirds.splice(i,1);
			continue;
		}
	}
	for(var i = listofshots.length-1; i >= 0; i--)
	{
		var shot = listofshots[i];
		var usedShot = false;
		
		shot.position = addVec(shot.position, (multiplyVec(shot.velocity,inDelta)));
		
		for(var j = listoffish.length-1; j >= 0; j--)
		{
			var fish = listoffish[j];
			 
				if(circleCollideEllipse(shot.position, shot.size, fish.position, new Vec2(fish.size*2,fish.size)))
				{
					if(!fish.dead)
					{
						fish.dead = true;
						deadFish++;
						
						bloodPop(fish.position);
						break;
					}
					usedShot = true;
				}
		}
		if(usedShot)
		{
			listofshots.splice(i,1);
			continue;
		}
		for(var j = listofbirds.length-1; j >= 0; j--)
		{
			var bird = listofbirds[j];
			
			if(circleCollideRectangle(shot.position, shot.size, new Vec2(bird.position.x,bird.position.y+bird.size/2), new Vec2(bird.size*2,bird.size)))
			{
				if(bird.carriedFish)
				{
					listoffish.push(bird.carriedFish);
				}
				
				listofbirds.splice(j,1);
				deadBirds++;
				usedShot = true;
				break;
			}
		}
		if(usedShot)
		{
			listofshots.splice(i,1);
			continue;
		}
		
		if(shot.position.x > canvas.width+shot.size  || shot.position.x < -shot.size || 
		   shot.position.y > canvas.height+shot.size || shot.position.y < -shot.size)
		{
			listofshots.splice(i,1);
			continue;
		}
	}
	for(var i = listofparticles.length-1; i >= 0; i--)
	{
		var particle = listofparticles[i];
		
		particle.life -= inDelta;
		if(particle.life <= 0)
		{
			listofparticles.splice(i,1);
			continue;
		}
		
		if(particle.position.y >= canvas.height/2)
		{
			particle.velocity = addVec(particle.velocity, multiplyVec(particle.gravity, inDelta));
			particle.position = addVec(particle.position, multiplyVec(particle.velocity, inDelta));
		}
		else
		{
			particle.position = addVec(particle.position, new Vec2(multiplyVec(particle.velocity, inDelta).x,0));
			
			if(particle.type == "bubble")
			{
				listofparticles.splice(i,1);
				continue;
			}
		}
	}
}

function render()
{
	//Background
	ctx.fillStyle = "rgb(170,230,255)";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
	//Hills
	ctx.fillStyle = "rgb(20,100,15)";
	ctx.beginPath();
	ctx.moveTo(0,canvas.height/2);
	ctx.quadraticCurveTo(canvas.width/2, canvas.height/8, canvas.width,canvas.height/2);
	ctx.fill();
	
	//Water
	ctx.fillStyle = "rgb(35,50,240)"
	ctx.fillRect(0,canvas.height/2,canvas.width,canvas.height);
		
	//Fish
	for(var i = 0; i < listoffish.length; i++)
	{
		var fish = listoffish[i];
		
		ctx.fillStyle = fish.colour;
		ctx.save();
			ctx.scale(2,1);
			ctx.beginPath();
			ctx.arc(fish.position.x/2, fish.position.y, fish.size, 0,Math.PI*2);
			ctx.fill();
		ctx.restore();
		ctx.beginPath();
		ctx.moveTo(fish.position.x-fish.size*1.5, fish.position.y);
		ctx.lineTo(fish.position.x-fish.size*2.5, fish.position.y-fish.size);
		ctx.lineTo(fish.position.x-fish.size*2.5, fish.position.y+fish.size);
		ctx.fill();
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.beginPath();
		ctx.arc(fish.position.x+fish.size, fish.position.y-fish.size*0.25, fish.size/5, 0,Math.PI*2);
		ctx.fill();
	}
	
	//Particles
	for(var i = 0; i < listofparticles.length; i++)
	{
		var particle = listofparticles[i];
		
		ctx.fillStyle = particle.colour;
		ctx.beginPath();
		ctx.arc(particle.position.x,particle.position.y,particle.size, 0,Math.PI*2);
		ctx.fill();
	}
	
	//Birds
	for(var i = 0; i < listofbirds.length; i++)
	{
		var bird = listofbirds[i];
		
		var fish = bird.carriedFish;
		if(fish)
		{
			ctx.fillStyle = fish.colour;
			ctx.save();
				ctx.scale(2,1);
				ctx.beginPath();
				ctx.arc(fish.position.x/2, fish.position.y, fish.size, 0,Math.PI*2);
				ctx.fill();
			ctx.restore();
			ctx.beginPath();
			ctx.moveTo(fish.position.x-fish.size*1.5, fish.position.y);
			ctx.lineTo(fish.position.x-fish.size*2.5, fish.position.y-fish.size);
			ctx.lineTo(fish.position.x-fish.size*2.5, fish.position.y+fish.size);
			ctx.fill();
			ctx.fillStyle = "rgb(0,0,0)";
			ctx.beginPath();
			ctx.arc(fish.position.x+fish.size, fish.position.y-fish.size*0.25, fish.size/5, 0,Math.PI*2);
			ctx.fill();
		}
		
		ctx.strokeStyle = bird.colour;
		ctx.lineWidth = 5;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(bird.position.x-bird.size,bird.position.y);
		ctx.quadraticCurveTo(bird.position.x-bird.size/2,bird.position.y-bird.size,bird.position.x,bird.position.y);
		ctx.quadraticCurveTo(bird.position.x+bird.size/2,bird.position.y-bird.size,bird.position.x+bird.size,bird.position.y);
		ctx.stroke();
		ctx.lineCap = 'butt';
		ctx.lineJoin = 'miter';
	}
	
	//Dude
	//Shirt
	ctx.fillStyle = "red";
	ctx.beginPath();
	ctx.fillRect(playerBoatX-10, canvas.height/2-40, 20, 50);
	//Head
	ctx.fillStyle = "rgb(239,228,176)";
	ctx.beginPath();
	ctx.arc(playerBoatX, canvas.height/2-50, 15, 0,Math.PI*2);
	ctx.fill();
	
	//Boat
	ctx.fillStyle = "rgb(146,80,20)";
	ctx.beginPath();
	ctx.moveTo(playerBoatX-80,canvas.height/2-10);
	ctx.lineTo(playerBoatX+80,canvas.height/2-10);
	ctx.quadraticCurveTo(playerBoatX+75,canvas.height/2+20,playerBoatX+50,canvas.height/2+20);
	ctx.lineTo(playerBoatX-50,canvas.height/2+20);
	ctx.quadraticCurveTo(playerBoatX-75,canvas.height/2+20,playerBoatX-80,canvas.height/2-10);
	ctx.fill();
	
	//Arms
	var playerPos = new Vec2(playerBoatX, canvas.height/2-30);
	var gunDir = normaliseVec(subtractVec(mousePosition,playerPos));
	var gunStart = addVec(playerPos, multiplyVec(gunDir, 20));
	ctx.strokeStyle = "black";
	ctx.lineWidth = 5;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(playerBoatX-10,canvas.height/2-30);
	ctx.lineTo(gunStart.x,gunStart.y);
	ctx.moveTo(playerBoatX+10,canvas.height/2-30);
	ctx.lineTo(gunStart.x,gunStart.y);
	ctx.stroke();
	ctx.lineCap = 'butt';
	
	//Gun
	var gunPin = addVec(playerPos, multiplyVec(gunDir, 21));
	var gunEnd = addVec(playerPos, multiplyVec(gunDir, 60));
	ctx.lineWidth = 10;
	ctx.strokeStyle = "rgb(185,122,87)";
	ctx.beginPath();
	ctx.moveTo(gunStart.x,gunStart.y);
	ctx.lineTo(gunEnd.x,gunEnd.y);
	ctx.stroke();
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(gunStart.x,gunStart.y);
	ctx.lineTo(gunStart.x,gunStart.y+10);
	ctx.stroke();
	ctx.strokeStyle = "rgb(200,200,200)";
	ctx.beginPath();
	ctx.moveTo(gunStart.x,gunStart.y);
	ctx.lineTo(gunPin.x,gunPin.y);
	ctx.stroke();
	
	//Shots
	for(var i = 0; i < listofshots.length; i++)
	{
		var shot = listofshots[i];
		
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.beginPath();
		ctx.arc(shot.position.x, shot.position.y, shot.size, 0,Math.PI*2);
		ctx.fill();
	}
	
	ctx.font = "18px Helvetica";
	ctx.fillStyle = "black";
	ctx.fillText("FPS: " + drawFPS, 4,22);
	
	ctx.fillText("Shot fish: " + deadFish, 4,44);
	ctx.fillText("Shot birds: " + deadBirds, 4,66);
	ctx.fillText("Collected Fish: " + collectedFish, 4,88);
}

//Non-looped
function shoot()
{
	var playerPos = new Vec2(playerBoatX, canvas.height/2-30);
	if(nextShot <= 0)
	{
		var angle = -angleOfVec(subtractVec(mousePosition, playerPos));
		for(var i = 0; i < playerGun.shotNum; i++)
		{
			var newAngle = angle + getRandomNum(-playerGun.spread,playerGun.spread);
			var shotDir = new Vec2(Math.sin(newAngle),Math.cos(newAngle));
			var vel = multiplyVec(shotDir,playerGun.shotSpeed);
			
			var gunEnd = addVec(playerPos, multiplyVec(normaliseVec(subtractVec(mousePosition,playerPos)), 60));
			
			listofshots.push(new Shot(gunEnd, vel, playerGun.shotSize));
		}
		if(!muted)
		{
			if(playerGun.sound.ended || playerGun.sound.currentTime == 0)
				playerGun.sound.play();
			else
				playerGun.sound.currentTime = 0;
		}
		nextShot = playerGun.reloadSpeed;
	}
}

function bloodPop(inPosition)
{
	for(var i = 0; i < 25; i++)
	{
		var angle = getRandomNum(0,Math.PI*2);
		var vel = multiplyVec(new Vec2(Math.sin(angle),Math.cos(angle)),getRandomNum(20,40));
		listofparticles.push(new Particle(new Vec2(inPosition.x,inPosition.y), 1, getRandomNum(1,3), vel, new Vec2(0,-50), "rgb(255,0,0)", "blood"));
	}
}

function circleCollideEllipse(circleCentre, circleRadius, ellipseCentre, ellipseScale)
{
	var dirBetween = normaliseVec(subtractVec(ellipseCentre, circleCentre));
	var testPoint = addVec(circleCentre, multiplyVec(dirBetween, circleRadius));
	
	if(sq((testPoint.x - ellipseCentre.x)/ellipseScale.x) + sq((testPoint.y - ellipseCentre.y)/ellipseScale.y) <= 1)
	{
		return true;
	}
	return false;
}

function circleCollideRectangle(circleCentre, circleRadius, rectangleCentre, rectangleSize)
{
	var dirBetween = normaliseVec(subtractVec(rectangleCentre, circleCentre));
	var testPoint = addVec(circleCentre, multiplyVec(dirBetween, circleRadius));
	
	if(testPoint.x > rectangleCentre.x + rectangleSize.x/2) return false;
	if(testPoint.x < rectangleCentre.x - rectangleSize.x/2) return false;
	if(testPoint.y > rectangleCentre.y + rectangleSize.y/2) return false;
	if(testPoint.y < rectangleCentre.y - rectangleSize.y/2) return false;
	return true;
}

//Events
var mouseButtons = [];
canvas.addEventListener("mousedown", function(e) {
	mousePosition = new Vec2((e.x | e.clientX)-8, (e.y | e.clientY)-8);
	
	mouseButtons[e.which] = true;
	shoot();
}, false);
canvas.addEventListener("mouseup", function(e) {
	mousePosition = new Vec2((e.x | e.clientX)-8, (e.y | e.clientY)-8);
	
	mouseButtons[e.which] = false;
}, false);
canvas.addEventListener("mousemove", function(e) {
	mousePosition = new Vec2((e.x | e.clientX)-8, (e.y | e.clientY)-8);
}, false);
addEventListener("keydown", function(e) {
	keyPresses[e.key || e.keyIdentifier] = true;
}, false);
addEventListener("keyup", function(e) {
	keyPresses[e.key || e.keyIdentifier] = false;
}, false);

//Useful functions
function clamp(value, max, min)
{
	return Math.max(min,Math.min(max,value));
}

function getRandomNum(min, max) 
{
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) 
{
  return Math.floor(Math.random() * (max - min) + min);
}