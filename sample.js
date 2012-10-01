var bmlFiles = [ "sample-xml/[G_DARIUS]_homing_laser.xml" ];

enchant();
window.onload = function() {
	var game = new Game();
	game.preload(bmlFiles);
	game.onload = function() {
		var bulletml = game.assets[bmlFiles[0]];
		var root = BulletML.build(bulletml);
	};
	game.start();
};
