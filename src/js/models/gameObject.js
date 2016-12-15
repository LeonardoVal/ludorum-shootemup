// Maneja las posiciones de los "objetos" (todo basicamente)

var GameObject = exports.GameObject = function GameObject(){
	this.x = 0;
	this.y = 0;
	this.vx = 0;
	this.vy = 0;
};

GameObject.prototype.updatePosition = function updatePosition(delta){
	this.x += this.vx * delta / 1000;
	this.y += this.vy * delta / 1000;
};

GameObject.prototype.phaserAnimInterface = {
	addAnimation: function addAnimation(name, frames, frameRate, loop, useNumericIndex){
		this.animations.push({name: name, frames: frames, frameRate: frameRate, loop: loop, useNumericIndex: useNumericIndex});
	},
	queueAnimation: function queueAnimation(name){
		this.animation = name;
		this.playAnimation = true;
	}
}

GameObject.prototype.animationInterface = GameObject.prototype.phaserAnimInterface;

GameObject.prototype.addAnimation = function(){
	this.animationInterface.addAnimation.apply(this, arguments);
};

GameObject.prototype.queueAnimation = function(){
	this.animationInterface.queueAnimation.apply(this, arguments);
};

exports.GameObject = GameObject;
