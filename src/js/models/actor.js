/*globals*/

/************************************************************************************************
 * ACTOR CLASS
 *
 * Add some common properties like :
 * - beeing pinned to ground
 * - finding direction (read angle) to another sprite
 *
 ************************************************************************************************/

var Actor = exports.Actor = function Actor(stage){
	GameObject.call(this);
	this.stage = stage;
	this.isPinnedToGround = false;
};

Actor.prototype = Object.create(GameObject.prototype);
Actor.prototype.constructor = Actor;

Actor.prototype.updateLogic = function(delta){
	
};

Actor.prototype.getAngleTo = function(gameObject){
	var angle;
	if (gameObject.x || gameObject.y){ // FIXME
		angle = Math.atan2(gameObject.x - this.x, gameObject.y - this.y);
	}
	return angle;
};
