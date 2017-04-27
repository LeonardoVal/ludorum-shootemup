// Maneja las posiciones de los "objetos" (todo basicamente)

var GameObject = exports.GameObject = function GameObject(){
	p2.Body.call(this, {mass: 100});
	this.damping = 0; // removes friction
	this.shape = new p2.Box({ width: 20, height: 20 });
	this.shape.sensor = true;
	this.addShape(this.shape);
};

GameObject.prototype = Object.create(p2.Body.prototype);

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
