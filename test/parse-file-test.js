"use strict";

var ParseFileTest = TestCase("ParseFileTest");

ParseFileTest.prototype.test = function() {
	var files = [ "[1943]_rolling_fire.xml", "[G_DARIUS]_homing_laser.xml",
			"[Guwange]_round_2_boss_circle_fire.xml",
			"[Guwange]_round_3_boss_fast_3way.xml",
			"[Guwange]_round_4_boss_eye_ball.xml",
			"[Progear]_round_1_boss_grow_bullets.xml",
			"[Progear]_round_2_boss_struggling.xml",
			"[Progear]_round_3_boss_back_burst.xml",
			"[Progear]_round_3_boss_wave_bullets.xml",
			"[Progear]_round_4_boss_fast_rocket.xml",
			"[Progear]_round_5_boss_last_round_wave.xml",
			"[Progear]_round_5_middle_boss_rockets.xml",
			"[Progear]_round_6_boss_parabola_shot.xml",
			"[Psyvariar]_X-A_boss_opening.xml",
			"[Psyvariar]_X-A_boss_winder.xml",
			"[Psyvariar]_X-B_colony_shape_satellite.xml",
			"[XEVIOUS]_garu_zakato.xml" ];
	files.forEach(function(file) {
		ajax("/test/sample-xml/" + file, function(xml) {
			var result = BulletML.build(xml);
			assertNotUndefined(result);
		});
	});
};

function ajax(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				callback(xhr.responseXML);
			}
		}
	};
	xhr.open("GET", url);
	xhr.send();
}
