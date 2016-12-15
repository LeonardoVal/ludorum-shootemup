
var SpriteController = exports.SpriteController = function SpriteController(gameObject, state, image) {
  this.gameObject = gameObject;
  this.state = state;
	this.game = state.game;
	// Call parent constructor
	Phaser.Sprite.call(this, this.game, 0, 0, image);
	// Add the object to the game world
	this.game.add.existing(this); // TODO averiguar por que al comentar esta linea el player es invisible
	// Pure common things to ALL objects
	this.anchor.setTo(0.5, 0.5);
	this.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO);
  if (this.gameObject.animations){
    this.gameObject.animations.forEach(function(aData){
      this.animations.add(aData.name, aData.frames, aData.frameRate, aData.loop, aData.useNumericIndex);
    }, this);
  }
}

SpriteController.prototype = Object.create(Phaser.Sprite.prototype);
SpriteController.prototype.constructor = SpriteController;

SpriteController.prototype.update = function update(){
  this.x = this.gameObject.x;
  this.y = this.gameObject.y;
  this.alive = this.gameObject.alive;
  this.exists = this.gameObject.exists;
  this.visible = this.gameObject.visible;
  if (this.gameObject.tint !== undefined)
    this.tint = this.gameObject.tint;
  this.updateAnimation();
  Phaser.Sprite.prototype.update.call(this);
}

SpriteController.prototype.updateAnimation = function updateAnimation(){
  if (this.gameObject.playAnimation){
    this.play(this.gameObject.animation);
    this.gameObject.playAnimation = false;
  }
}
