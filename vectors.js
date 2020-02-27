/*
	2D Vector math compilation
*/

function lerp(vecOne, vecTwo, amount)
{
	return new Vec2(vecOne.x*(1-amount)+vecTwo.x*amount,vecOne.y*(1-amount)+vecTwo.y*amount);
}

function sq(num)
{
	return num*num;
}

function distance(one,two)
{
	return Math.sqrt(sq(one.x-two.x)+sq(one.y-two.y));
}

function distanceSQ(one,two)
{
	return sq(one.x-two.x)+sq(one.y-two.y);
}

function angleOfVec(inVec)
{
	return Math.atan2(inVec.y, inVec.x) - Math.atan2(1,0);//2nd atan is the direction of 0 degrees
}

function vecOfAngle(angle)
{
	return new Vec2(Math.cos(angle), Math.sin(angle));
}

function rotateVec(inVec, inAngle)
{
	var angle = angleOfVec(inVec);
	angle += inAngle;
	return vecOfAngle(angle);
}

function Vec2(x,y)
{
	this.x = x;
	this.y = y;
}

Vec2.prototype.add = function(addVec)
{
	this.x += addVec.x;
	this.y += addVec.y;
}

Vec2.prototype.sub = function(addVec)
{
	this.x -= addVec.x;
	this.y -= addVec.y;
}

Vec2.prototype.multiply = function(num)
{
	this.x *= num;
	this.y *= num;
}

Vec2.prototype.divide = function(num)
{
	this.x /= num;
	this.y /= num;
}

Vec2.prototype.clone = function()
{
	return new Vec2(this.x,this.y);
}

Vec2.prototype.length = function()
{
	return Math.sqrt(sq(this.x) + sq(this.y));
}

Vec2.prototype.lengthSQ = function()
{
	return sq(this.x) + sq(this.y);
}

function addVec(vec, addVec)
{
	return new Vec2(vec.x + addVec.x, vec.y + addVec.y);
}

function subtractVec(vec, subVec)
{
	return new Vec2(vec.x - subVec.x, vec.y - subVec.y);
}

function multiplyVec(vec,num)
{
	return new Vec2(vec.x*num,vec.y*num);
}

function divideVec(vec, num)
{
	return new Vec2(vec.x/num,vec.y/num);
}

function normaliseVec(vec)
{
	var length = Math.sqrt(sq(vec.x) + sq(vec.y));
	if(!length)
		return vec.clone();
	return divideVec(vec,length);
}

function dotVec(vec1, vec2)
{
	return vec1.x * vec2.x + vec1.y * vec2.y;
}