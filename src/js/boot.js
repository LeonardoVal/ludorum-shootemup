function Boot() {}

Boot.prototype = {

	preload: function () {
		this.load.image('preloader', 'assets/preloader.gif');
	},

	create: function () {
		this.game.input.maxPointers = 1;

		// if (! this.game.device.desktop) {
		// } else {
			this.game.scale.minWidth =  CONFIG.GAME_WIDTH;
			this.game.scale.minHeight = CONFIG.GAME_HEIGHT;
			this.game.scale.maxWidth = CONFIG.GAME_WIDTH * 4;
			this.game.scale.maxHeight = CONFIG.GAME_HEIGHT * 4;
			this.game.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			// this.game.scale.forcePortrait = true;
			this.game.scale.pageAlignHorizontally = true;
			this.game.scale.pageAlignVertically = true;

			this.game.antialias = false;
			this.game.stage.smoothed = false;
			this.game.scale.width = CONFIG.GAME_WIDTH * CONFIG.PIXEL_RATIO;
			this.game.scale.height = CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO;
			this.game.scale.refresh();

			// this.game.scale.setScreenSize(true);

		// }
		this.game.state.start('preloader');
	}
};

exports.Boot = Boot;
