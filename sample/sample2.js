// BulletMLファイル
var xmlFiles = [ "[1943]_rolling_fire.xml", "[Bulletsmorph]_aba_1.xml",
        "[Bulletsmorph]_aba_2.xml", "[Bulletsmorph]_aba_3.xml",
        "[Bulletsmorph]_aba_4.xml", "[Bulletsmorph]_aba_5.xml",
        "[Bulletsmorph]_aba_6.xml", "[Bulletsmorph]_aba_7.xml",
        "[Bulletsmorph]_convergent.xml", "[Bulletsmorph]_double_seduction.xml",
        "[Bulletsmorph]_fallen_string.xml",
        "[Bulletsmorph]_kunekune_plus_homing.xml",
        "[Bulletsmorph]_satoru4.xml", "[ChaosSeed]_big_monkey_boss.xml",
        "[Daiouzyou]_hibachi_1.xml", "[Daiouzyou]_hibachi_2.xml",
        "[Daiouzyou]_hibachi_3.xml", "[Daiouzyou]_hibachi_4.xml",
        "[Daiouzyou]_hibachi_image.xml", "[Daiouzyou]_hibachi_maybe.xml",
        "[Daiouzyou]_round_1_boss.xml", "[Daiouzyou]_round_1_boss_hakkyou.xml",
        "[Daiouzyou]_round_3_boss.xml", "[Daiouzyou]_round_3_boss_2.xml",
        "[Daiouzyou]_round_3_boss_last.xml", "[Daiouzyou]_round_4_boss.xml",
        "[Daiouzyou]_round_4_boss_1.xml", "[Daiouzyou]_round_4_boss_2.xml",
        "[Daiouzyou]_round_4_boss_4.xml", "[Daiouzyou]_round_4_boss_5.xml",
        "[Daiouzyou]_round_5_boss_1.xml", "[Daiouzyou]_round_5_boss_2.xml",
        "[Daiouzyou]_round_6_boss_1.xml", "[Daiouzyou]_round_6_boss_2.xml",
        "[Daiouzyou]_round_6_boss_3.xml", "[Daiouzyou]_round_6_boss_4.xml",
        "[Daiouzyou]_round_6_boss_5.xml", "[Dodonpachi]_hibachi.xml",
        "[Dodonpachi]_kitiku_1.xml", "[Dodonpachi]_kitiku_2.xml",
        "[Dodonpachi]_kitiku_3.xml", "[Dodonpachi]_kitiku_5.xml",
        "[DragonBlaze]_nebyurosu_2.xml",
        "[ESP_RADE]_round_123_boss_izuna_fan.xml",
        "[ESP_RADE]_round_123_boss_izuna_hakkyou.xml",
        "[ESP_RADE]_round_123_boss_pelaboy_hakkyou.xml",
        "[ESP_RADE]_round_123_boss_satoru_5way.xml",
        "[ESP_RADE]_round_5_alice_clone.xml",
        "[ESP_RADE]_round_5_boss_ares_2.xml",
        "[ESP_RADE]_round_5_boss_gara_1_a.xml",
        "[ESP_RADE]_round_5_boss_gara_1_b.xml",
        "[ESP_RADE]_round_5_boss_gara_2.xml",
        "[ESP_RADE]_round_5_boss_gara_3.xml",
        "[ESP_RADE]_round_5_boss_gara_4.xml",
        "[ESP_RADE]_round_5_boss_gara_5.xml",
        "[ESP_RADE]_round_5_boss_kakusi_hakkyou.xml",
        "[G-Wange]_roll_gara.xml", "[G-Wange]_round_trip_bit.xml",
        "[G_DARIUS]_homing_laser.xml", "[Garegga]_black_heart_mk2_winder.xml",
        "[GigaWing2]_akurimi.xml", "[Guwange]_round_2_boss_circle_fire.xml",
        "[Guwange]_round_3_boss_fast_3way.xml",
        "[Guwange]_round_4_boss_eye_ball.xml", "[Ketui_LT]_1boss_bit.xml",
        "[Ketui_LT]_2boss_winder_crash.xml", "[Ketui_LT]_3boss_kunekune.xml",
        "[Ketui_LT]_3boss_roll_and_aim.xml", "[MDA]_10flower_2.xml",
        "[MDA]_14b_2-3w.xml", "[MDA]_2f.xml", "[MDA]_75l-42.xml",
        "[MDA]_acc_n_dec.xml", "[MDA]_circular.xml",
        "[MDA]_circular_model.xml", "[MDA]_circular_sun.xml",
        "[MDA]_double_w.xml", "[MDA]_fukuro.xml", "[MDA]_gnnnyari.xml",
        "[MDA]_mojya.xml", "[MDA]_mossari.xml", "[MDA]_wind_cl.xml",
        "[Noiz2sa]_5_players.xml", "[Noiz2sa]_88way.xml", "[Noiz2sa]_bit.xml",
        "[Noiz2sa]_rollbar.xml", "[Original]_accusation.xml",
        "[Original]_air_elemental.xml", "[Original]_backfire.xml",
        "[Original]_balloon_bomb.xml", "[Original]_btb_1.xml",
        "[Original]_btb_2.xml", "[Original]_btb_3.xml", "[Original]_btb_4.xml",
        "[Original]_btb_5.xml", "[Original]_btb_6.xml",
        "[Original]_censored.xml", "[Original]_chimera.xml",
        "[Original]_circle.xml", "[Original]_cont_circle.xml",
        "[Original]_dokkaan.xml", "[Original]_ellipse_bomb.xml",
        "[Original]_entangled_space.xml", "[Original]_evil_eye.xml",
        "[Original]_extinction.xml", "[Original]_fujin_ranbu_fake.xml",
        "[Original]_fujin_ranbu_true.xml", "[Original]_guruguru.xml",
        "[Original]_gurutyo.xml", "[Original]_gyakuhunsya.xml",
        "[Original]_hajike.xml", "[Original]_hasami.xml",
        "[Original]_hirahira.xml", "[Original]_housya.xml",
        "[Original]_kagome.xml", "[Original]_kedama.xml",
        "[Original]_knight_1.xml", "[Original]_knight_2.xml",
        "[Original]_knight_3.xml", "[Original]_knight_4.xml",
        "[Original]_kotai.xml", "[Original]_kujira.xml",
        "[Original]_kunekune.xml", "[Original]_light_lv10.xml",
        "[Original]_light_lv25.xml", "[Original]_light_max.xml",
        "[Original]_oogi_hutatsu.xml", "[Original]_optic_seeker.xml",
        "[Original]_pan.xml", "[Original]_progear_cheap_fake.xml",
        "[Original]_sakuretudan.xml", "[Original]_shooting_star.xml",
        "[Original]_star_in_the_sky.xml", "[Original]_stone6.xml",
        "[Original]_stop_and_run.xml", "[Original]_time_twist.xml",
        "[Original]_tsunami.xml", "[Original]_two_cross.xml",
        "[Original]_uneri.xml", "[Original]_wana.xml",
        "[Original]_water_lv10.xml", "[Original]_water_lv25.xml",
        "[Original]_water_max.xml", "[Original]_yokokasoku.xml",
        "[Original]_zako_atack.xml", "[OtakuTwo]_accel_jump.xml",
        "[OtakuTwo]_circle_fireworks.xml", "[OtakuTwo]_circle_fireworks2.xml",
        "[OtakuTwo]_circle_roll.xml", "[OtakuTwo]_circle_trap.xml",
        "[OtakuTwo]_dis_bee_1.xml", "[OtakuTwo]_dis_bee_2.xml",
        "[OtakuTwo]_dis_bee_3.xml", "[OtakuTwo]_dis_bee_hakkyou.xml",
        "[OtakuTwo]_restriction_stasis.xml", "[OtakuTwo]_roll_misago.xml",
        "[OtakuTwo]_self-0012.xml", "[OtakuTwo]_self-0034.xml",
        "[OtakuTwo]_self-0036.xml", "[OtakuTwo]_self-0062.xml",
        "[OtakuTwo]_self-0063.xml", "[OtakuTwo]_self-0071.xml",
        "[OtakuTwo]_self-0081.xml", "[OtakuTwo]_self-1010.xml",
        "[OtakuTwo]_self-1011.xml", "[OtakuTwo]_self-1020.xml",
        "[OtakuTwo]_self-1021.xml", "[OtakuTwo]_self-2010.xml",
        "[OtakuTwo]_self-2011.xml", "[OtakuTwo]_self-2020.xml",
        "[OtakuTwo]_slow_move.xml", "[Progear]_round_10_boss_before_final.xml",
        "[Progear]_round_1_boss_grow_bullets.xml",
        "[Progear]_round_2_boss_struggling.xml",
        "[Progear]_round_3_boss_back_burst.xml",
        "[Progear]_round_3_boss_wave_bullets.xml",
        "[Progear]_round_4_boss_fast_rocket.xml",
        "[Progear]_round_5_boss_last_round_wave.xml",
        "[Progear]_round_5_middle_boss_rockets.xml",
        "[Progear]_round_6_boss_parabola_shot.xml",
        "[Progear]_round_9_boss.xml", "[Psyvariar]_4-D_boss_MZIQ.xml",
        "[Psyvariar]_X-A_boss_opening.xml", "[Psyvariar]_X-A_boss_winder.xml",
        "[Psyvariar]_X-B_colony_shape_satellite.xml",
        "[STORM_CALIBAR]_last_boss_double_roll_bullets.xml",
        "[SilverGun]_4D_boss_PENTA.xml", "[Strikers1999]_hanabi.xml",
        "[XEVIOUS]_garu_zakato.xml", "[XII_STAG]_3b.xml",
        "[tenmado]_3_boss_2.xml", "[tenmado]_5_boss_1.xml",
        "[tenmado]_5_boss_3.xml", "[xsoldier]_8_boss_main.xml" ].map(function(
        fileName) {
    return "sample-assets/" + fileName;
});
// xmlFiles = ["sample-assets/[Daiouzyou]_hibachi_2.xml"];
var c = 0;
xmlFiles.next = function() {
    var result = this[c++];
    if (!result) return;
    console.log(result);
    // fileName.text = result.replace("sample-assets/", "");
    return result;
};
xmlFiles.prev = function() {
    var result = this[c--];
    if (!result) return;
    console.log(result);
    // fileName.text = result.replace("sample-assets/", "");
    return result;
};

var patterns = {};
tm.preload(function() {
    for (var i = 0, end = xmlFiles.length; i < end; i++) {
        (function() {
            var index = i;
            var check = {
                loaded: false,
                isLoaded: function() { return this.loaded; }
            };
            tm.addLoadCheckList(check);
            tm.util.Ajax.load({
                url: xmlFiles[i],
                type: "GET",
                dataType: "xml",
                success: function(data) {
                    patterns[index] = BulletML.build(data);
                    check.loaded = true;
                    console.log(patterns[index]);
                }
            });
        })();
    }
});

tm.main(function() {
    var app = tm.app.CanvasApp("#world");
    app.resize(320, 320);
    app.fitWindow();
    app.fps = 60;
    app.background = "#000033";

    var scene = app.currentScene;

    var player = tm.app.TriangleShape(32, 32);
    player.x = 160;
    player.y = 320 - 50;
    player.radius = 4;
    player.on("enterframe", function() {
        for ( var i = bulletPool.length; i--;) {
            var b = bulletPool[i];
            if (b.active && this.isHitElement(b)) {
                b.remove();
                b.dispatchEvent(tm.event.Event("removed"));
            }
        }
    });
    scene.addChild(player);

    // 弾プール
    var bulletPool = [];
    var gra = (function(){
        var r = tm.graphics.RadialGradient(4, 4, 0, 4, 4, 4);
        r.addColorStopList([
            { offset: 0.0, color: "rgba(255, 255, 255, 1.0)" },
            { offset: 0.5, color: "rgba(255, 255, 255, 1.0)" },
            { offset: 0.8, color: "rgba(255,   0,   0, 0.8)" },
            { offset: 1.0, color: "rgba(255,   0,   0, 0.0)" }
        ]);
        return r;
    })();
    for ( var i = 0; i < 3000; i++) {
        var bullet = tm.app.CircleShape(8, 8, {
            strokeStyle: "none",
            fillStyle: gra.toStyle()
        });
        bullet.active = false;
        bullet.addEventListener("removed", function() {
            this.active = false;
            this.clearEventListener("enterframe");
        });
        bullet.blendMode = "lighter";
        bullet.radius = 4;
        bulletPool[i] = bullet;
    }
    bulletPool.get = function() {
        for ( var i = this.length; i--;) {
            if (!this[i].active) {
                this[i].active = true;
                this[i].age = 0;
                return this[i];
            }
        }
        console.log("弾切れ");
    };

    var enemy = tm.app.CircleShape(32, 32);
    enemy.x = 160;
    enemy.y = 50;
    enemy.name = "enemy";
    scene.addChild(enemy);

    // 攻撃パターン設定
    // 攻撃対象
    tm.bulletml.AttackPattern.defaultConfig.target = player;
    // 弾の生成関数
    tm.bulletml.AttackPattern.defaultConfig.bulletFactory = function() {
        return bulletPool.get();
    };
    // 弾の消去判定
    tm.bulletml.AttackPattern.defaultConfig.isInsideOfWorld = function(b) {
        return (b === enemy)
                || (b.age < 1200 && -50 < b.x && b.x < 50 + app.width
                        && -100 < b.y && b.y < 50 + app.height);
    };
    // 難易度ランク
    tm.bulletml.AttackPattern.rank = 1.0;
    // 弾速
    tm.bulletml.AttackPattern.speedRate = 1.2;

    var i = 0;
    enemy.addEventListener("enterframe", tm.bulletml.AttackPattern(patterns[i++]).createTicker());
    enemy.addEventListener("completeattack", function() {
        console.log("攻撃完了");
        enemy.clearEventListener("enterframe");
        enemy.addEventListener("enterframe", tm.bulletml.AttackPattern(patterns[i++]).createTicker());
    });

    app.run();
});

tm.event.EventDispatcher.prototype.on = tm.event.EventDispatcher.prototype.addEventListener;