function Menu() {
	this.titleTxt = null;
	this.startTxt = null;
}

Menu.prototype = {

	create: function () {

		var x = this.game.width / 2
			, y = this.game.height / 2;


		this.titleTxt = this.add.bitmapText(x, y, 'minecraftia', 'PHASER SHMUP' );
		this.titleTxt.align = 'center';
		this.titleTxt.x = this.game.width / 2 - this.titleTxt.textWidth / 2;
		this.titleTxt.y = this.titleTxt.y - this.titleTxt.height * 2 + 5;

		y = y + this.titleTxt.height + 5;
		this.startTxt = this.add.bitmapText(x, y, 'minecraftia', '_______________\nControls\nW : shoot / start\nArrows : move\nF : bullet time\n_______________');
		this.startTxt.align = 'center';
		this.startTxt.x = this.game.width / 2 - this.startTxt.textWidth / 2;

		this.gruntTxt = this.add.bitmapText(0, y/4, 'minecraftia', "Make sure to run Grunt!");
		this.gruntTxt.align = 'center';
		this.gruntTxt.x = this.game.width / 2 - this.gruntTxt.textWidth / 2;

		this.input.onDown.add(this.onDown, this);
	},

	update: function () {
		var keyboard = this.input.keyboard;

		if (keyboard.isDown(Phaser.Keyboard.W)) {
			this.game.state.start('game');
		}
	},

	onDown: function () {
		this.game.state.start('game');
	}
};

exports.Menu = Menu;
