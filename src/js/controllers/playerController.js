// Player controller. Esta clase se volvio bastante inutil
if (typeof SpriteController === 'function') { 
	var PlayerController = exports.PlayerController = function PlayerController(player, state) {
	  SpriteController.call(this, player, state, 'player_' + player.playerClass);
	};

	PlayerController.prototype = Object.create(SpriteController.prototype);
	PlayerController.prototype.constructor = PlayerController;

	PlayerController.prototype.update = function() {
	  SpriteController.prototype.update.call(this);
		this.updateSound();
	};

	PlayerController.prototype.updateSound = function(){
		if (!this.state.mute && this.gameObject.playSound){
		this.game.sound['shoot_player_' + this.gameObject.firingSound].play('', 0, 0.25);
		this.gameObject.playSound = false;
	  }
	};
}