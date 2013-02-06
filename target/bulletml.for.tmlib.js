/*
 bulletml.js v0.5.0-SNAPSHOT

 The MIT License (MIT)
 Copyright (c) 2012-2013 daishi@dev7.jp All Rights Reserved.

 Permission is hereby granted, free of charge, to any person obtaining a
 copy of this software and associated documentation files (the "Software"),
 to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense,
 and/or sell copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included
 in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 IN THE SOFTWARE.
*/
var bulletml={GLOBAL:this,_temp:function(){}};
(function(){function m(a){var b=new bulletml.Root;if(a=a.getElementsByTagName("bulletml")[0]){d(a,"type",function(a){b.type=a});var c=a.getElementsByTagName("action");if(c)for(var l=0,f=c.length;l<f;l++)if(c[l].parentNode===a){var h=q(b,c[l]);h&&(b.actions[b.actions.length]=h)}if(c=a.getElementsByTagName("bullet")){l=0;for(f=c.length;l<f;l++)c[l].parentNode===a&&(h=e(b,c[l]))&&(b.bullets[b.bullets.length]=h)}if(c=a.getElementsByTagName("fire")){l=0;for(f=c.length;l<f;l++)c[l].parentNode===a&&(h=g(b,
c[l]))&&(b.fires[b.fires.length]=h)}return b}}function q(a,b){var c=new bulletml.Action;d(b,"label",function(a){c.label=a});k(b,".",function(b){switch(b.tagName.toLowerCase()){case "action":c.commands[c.commands.length]=q(a,b);break;case "actionref":c.commands[c.commands.length]=n(a,b);break;case "fire":c.commands[c.commands.length]=g(a,b);break;case "fireref":var f=c.commands,e=c.commands.length,j=new bulletml.FireRef;d(b,"label",function(a){j.label=a});k(b,/param$/,function(a){j.params[j.params.length]=
p(a)});j.root=a;f[e]=j;break;case "changedirection":var f=c.commands,e=c.commands.length,m=new bulletml.ChangeDirection;m.root=a;i(b,"direction",function(a){m.direction=h(new bulletml.Direction,a)});i(b,"term",function(a){m.term=p(a)});f[e]=m;break;case "changespeed":var f=c.commands,e=c.commands.length,t=new bulletml.ChangeSpeed;t.root=a;i(b,"speed",function(a){t.speed=h(new bulletml.Speed,a)});i(b,"term",function(a){t.term=p(a)});f[e]=t;break;case "accel":var f=c.commands,e=c.commands.length,r=
new bulletml.Accel;r.root=a;i(b,"horizontal",function(a){r.horizontal=h(new bulletml.Horizontal,a)});i(b,"vertical",function(a){r.vertical=h(new bulletml.Vertical,a)});i(b,"term",function(a){r.term=p(a)});f[e]=r;break;case "wait":var f=c.commands,e=c.commands.length,u=new bulletml.Wait;u.root=a;u.value=p(b);f[e]=u;break;case "vanish":b=c.commands;f=c.commands.length;e=new bulletml.Vanish;e.root=a;b[f]=e;break;case "repeat":var f=c.commands,e=c.commands.length,s=new bulletml.Repeat;i(b,"action",function(b){s.action=
q(a,b)});i(b,"actionRef",function(b){s.action=n(a,b)});i(b,"times",function(a){s.times=p(a)});s.root=a;f[e]=s}});c.root=a;return c}function n(a,b){var c=new bulletml.ActionRef;d(b,"label",function(a){c.label=a});k(b,/param$/,function(a){c.params[c.params.length]=p(a)});c.root=a;return c}function e(a,b){var c=new bulletml.Bullet;d(b,"label",function(a){c.label=a});i(b,"direction",function(a){c.direction=h(new bulletml.Direction,a)});i(b,"speed",function(a){c.speed=h(new bulletml.Speed,a)});k(b,/(action)|(actionRef)$/,
function(b){"action"==b.tagName.toLowerCase()?c.actions[c.actions.length]=q(a,b):"actionref"==b.tagName.toLowerCase()&&(c.actions[c.actions.length]=n(a,b))});c.root=a;return c}function g(a,b){var c=new bulletml.Fire;d(b,"label",function(a){c.label=a});i(b,"direction",function(a){c.direction=h(new bulletml.Direction,a)});i(b,"speed",function(a){c.speed=h(new bulletml.Speed,a)});i(b,"bullet",function(b){c.bullet=e(a,b)});i(b,"bulletref",function(b){var f=new bulletml.BulletRef;d(b,"label",function(a){f.label=
a});k(b,/param$/,function(a){f.params[f.params.length]=p(a)});f.root=a;c.bullet=f});if(!c.bullet)throw Error("fire has no bullet or bulletRef.");c.root=a;return c}function h(a,b){d(b,"type",function(b){a.type=b});p(b,function(b){a.value=b});return a}function j(a,b){for(var c=0,d=a.length;c<d;c++)if(a[c].label==b)return a[c]}function i(a,b,c,d){for(var b=b.toLowerCase(),a=a.childNodes,f=0,e=a.length;f<e;f++)if(a[f].tagName&&a[f].tagName.toLowerCase()==b)return c&&c(a[f]),a[f];d&&d();return null}function k(a,
b,c){for(var a=a.childNodes,d=0,f=a.length;d<f;d++)a[d].tagName&&a[d].tagName.toLowerCase().match(b)&&c(a[d])}function d(a,b,c,d){if(a=a.attributes[b])return c&&c(a.value),a;d&&d()}function p(a,b){var c=a.textContent.trim();if(void 0!==c||a.childNodes[0]&&(c=a.childNodes[0].nodeValue,void 0!==c))return b&&b(c),c}bulletml.build=function(a){if("string"===typeof a)var b=new DOMParser,a=m(b.parseFromString(a,"application/xml"));else if(a.getElementsByTagName("bulletml"))a=m(a);else throw Error("cannot build "+
a);return a};bulletml.Root=function(a){this.type="none";this.root=this;this.actions=[];this.bullets=[];this.fires=[];if(void 0!==a){for(var b in a)a.hasOwnProperty(b)&&(a[b].label=b,a[b]instanceof bulletml.Action?this.actions.push(a[b]):a[b]instanceof bulletml.Bullet?this.bullets.push(a[b]):a[b]instanceof bulletml.Fire&&this.fires.push(a[b]));a=0;for(b=this.actions.length;a<b;a++)this.actions[a].setRoot(this);a=0;for(b=this.bullets.length;a<b;a++)this.bullets[a].setRoot(this);a=0;for(b=this.fires.length;a<
b;a++)this.fires[a].setRoot(this)}};bulletml.Root.prototype.findAction=function(a){return j(this.actions,a)};bulletml.Root.prototype.getTopActionLabels=function(){for(var a=[],b=0,c=this.actions.length;b<c;b++){var d=this.actions[b];d.label&&0===d.label.indexOf("top")&&(a[a.length]=d.label)}return a};bulletml.Root.prototype.findActionOrThrow=function(a){var b;if(b=this.findAction(a))return b;throw Error("action labeled '"+a+"' is undefined.");};bulletml.Root.prototype.findBullet=function(a){return j(this.bullets,
a)};bulletml.Root.prototype.findBulletOrThrow=function(a){var b;if(b=this.findBullet(a))return b;throw Error("bullet labeled '"+a+"' is undefined.");};bulletml.Root.prototype.findFire=function(a){return j(this.fires,a)};bulletml.Root.prototype.findFireOrThrow=function(a){var b;if(b=this.findFire(a))return b;throw Error("fire labeled '"+a+"' is undefined.");};bulletml.Root.prototype.getWalker=function(a,b){var c=new bulletml.Walker(this,b),d=this.findAction(a);if(d)return c._action=d,c};bulletml.Walker=
function(a,b){this._root=a;this._stack=[];this._cursor=-1;this._action=null;this._localScope={};this._globalScope={$rank:b||0}};bulletml.Walker.prototype.next=function(){this._cursor+=1;if(null!==this._action){var a=this._action.commands[this._cursor];if(void 0!==a){if(a instanceof bulletml.Action)return this.pushStack(),this._action=a,this._localScope=this.cloneScope(),this.next();if(a instanceof bulletml.ActionRef)return this.pushStack(),this._action=this._root.findActionOrThrow(a.label),this._localScope=
this.newScope(a.params),this.next();if(a instanceof bulletml.Repeat)return this._localScope.loopCounter=0,this._localScope.loopEnd=this.evalParam(a.times),this.pushStack(),this._action=a.action.clone(),this._localScope=this.cloneScope(),this.next();if(a instanceof bulletml.Fire){var b=new bulletml.Fire;b.bullet=a.bullet.clone(this);null!==a.direction&&(b.direction=new bulletml.Direction(this.evalParam(a.direction.value)),b.direction.type=a.direction.type);null!==a.speed&&(b.speed=new bulletml.Speed(this.evalParam(a.speed.value)),
b.speed.type=a.speed.type);b.option=a.option;return b}return a instanceof bulletml.FireRef?(this.pushStack(),this._action=new bulletml.Action,this._action.commands=[this._root.findFireOrThrow(a.label)],this._localScope=this.newScope(a.params),this.next()):a instanceof bulletml.ChangeDirection?(b=new bulletml.ChangeDirection,b.direction.type=a.direction.type,b.direction.value=this.evalParam(a.direction.value),b.term=this.evalParam(a.term),b):a instanceof bulletml.ChangeSpeed?(b=new bulletml.ChangeSpeed,
b.speed.type=a.speed.type,b.speed.value=this.evalParam(a.speed.value),b.term=this.evalParam(a.term),b):a instanceof bulletml.Accel?(b=new bulletml.Accel,b.horizontal.type=a.horizontal.type,b.horizontal.value=this.evalParam(a.horizontal.value),b.vertical.type=a.vertical.type,b.vertical.value=this.evalParam(a.vertical.value),b.term=this.evalParam(a.term),b):a instanceof bulletml.Wait?new bulletml.Wait(this.evalParam(a.value)):a instanceof bulletml.Bind?(this._localScope["$"+a.variable]=this.evalParam(a.expression),
bulletml.DummyCommand):null}this.popStack();if(null===this._action)return null;if((a=this._action.commands[this._cursor])&&"repeat"==a.commandName)this._localScope.loopCounter++,this._localScope.loopCounter<this._localScope.loopEnd&&(this.pushStack(),this._action=a.action.clone(),this._localScope=this.cloneScope());return this.next()}return null};bulletml.Walker.prototype.pushStack=function(){this._stack.push({action:this._action,cursor:this._cursor,scope:this._localScope});this._cursor=-1};bulletml.Walker.prototype.popStack=
function(){var a=this._stack.pop();a?(this._cursor=a.cursor,this._action=a.action,this._localScope=a.scope):(this._cursor=-1,this._action=null,this._localScope={})};bulletml.Walker.prototype.evalParam=function(a){var b;if("number"===typeof a)return a;if(isNaN(b=Number(a))){if((b=this._localScope[a])||(b=this._globalScope[a]))return b;if("$rand"==a)return Math.random()}else return b;b={};for(var c in this._globalScope)this._globalScope.hasOwnProperty(c)&&(b[c]=this._globalScope[c]);for(c in this._localScope)this._localScope.hasOwnProperty(c)&&
(b[c]=this._localScope[c]);b.$rand=Math.random();if(c=this._stack[this._stack.length-1])b.$loop={index:c.scope.loopCounter,count:c.scope.loopCounter+1,first:0===c.scope.loopCounter,last:c.scope.loopCounter===c.scope.loopEnd-1};return eval("bulletml._temp = function() { return "+a.split("$").join("this.$")+"}").bind(b)()};bulletml.Walker.prototype.newScope=function(a){var b={};if(a)for(var c=0,d=a.length;c<d;c++)b["$"+(c+1)]=this.evalParam(a[c]);else for(c in this._localScope)this._localScope.hasOwnProperty(c)&&
(b[c]=this._localScope[c]);return b};bulletml.Walker.prototype.cloneScope=function(){var a={},b;for(b in this._localScope)this._localScope.hasOwnProperty(b)&&(a[b]=this._localScope[b]);return a};bulletml.Bullet=function(){this.root=this.label=null;this.direction=new bulletml.Direction(0);this.speed=new bulletml.Speed(1);this.actions=[];this.option={};this._localScope={}};bulletml.Bullet.prototype.getWalker=function(a){var a=new bulletml.Walker(this.root,a),b=new bulletml.Action;b.root=this.root;b.commands=
this.actions;a._action=b;a._localScope=this._localScope;return a};bulletml.Bullet.prototype.clone=function(a){var b=new bulletml.Bullet;b.label=this.label;b.root=this.root;b.actions=this.actions;b.direction=new bulletml.Direction(a.evalParam(this.direction.value));b.direction.type=this.direction.type;b.speed=new bulletml.Speed(a.evalParam(this.speed.value));b.speed.type=this.speed.type;b.option=this.option;b._localScope=a._localScope;return b};bulletml.Bullet.prototype.setRoot=function(a){this.root=
a;for(var b=0,c=this.actions.length;b<c;b++)this.actions[b].setRoot(a)};bulletml.BulletRef=function(){this.label=this.root=null;this.params=[]};bulletml.BulletRef.prototype.clone=function(a){var b=a._localScope;a._localScope=a.newScope(this.params);var c=this.root.findBulletOrThrow(this.label).clone(a);a._localScope=b;return c};bulletml.BulletRef.prototype.setRoot=function(a){this.root=a};bulletml.Command=function(){this.commandName=""};bulletml.Command.prototype.setRoot=function(a){this.root=a};
bulletml.Action=function(){this.commandName="action";this.root=this.label=null;this.commands=[];this.params=[]};bulletml.Action.prototype=new bulletml.Command;bulletml.Action.prototype.setRoot=function(a){this.root=a;for(var b=0,c=this.commands.length;b<c;b++)this.commands[b].setRoot(a)};bulletml.Action.prototype.clone=function(){var a=new bulletml.Action;a.label=this.label;a.root=this.root;a.commands=this.commands;return a};bulletml.ActionRef=function(){this.commandName="actionRef";this.root=this.label=
null;this.params=[]};bulletml.ActionRef.prototype=new bulletml.Command;bulletml.ActionRef.prototype.clone=function(){var a=new bulletml.Action;a.root=this.root;a.commands.push(this);return a};bulletml.Fire=function(){this.commandName="fire";this.bullet=this.speed=this.direction=this.root=this.label=null;this.option=new bulletml.FireOption};bulletml.Fire.prototype=new bulletml.Command;bulletml.Fire.prototype.setRoot=function(a){this.root=a;this.bullet&&this.bullet.setRoot(a)};bulletml.FireRef=function(){this.commandName=
"fireRef";this.label=null;this.params=[]};bulletml.FireRef.prototype=new bulletml.Command;bulletml.ChangeDirection=function(){this.commandName="changeDirection";this.direction=new bulletml.Direction;this.term=0};bulletml.ChangeDirection.prototype=new bulletml.Command;bulletml.ChangeSpeed=function(){this.commandName="changeSpeed";this.speed=new bulletml.Speed;this.term=0};bulletml.ChangeSpeed.prototype=new bulletml.Command;bulletml.Accel=function(){this.commandName="accel";this.horizontal=new bulletml.Horizontal;
this.vertical=new bulletml.Vertical;this.term=0};bulletml.Accel.prototype=new bulletml.Command;bulletml.Wait=function(a){this.commandName="wait";this.value=a||0};bulletml.Wait.prototype=new bulletml.Command;bulletml.Vanish=function(){this.commandName="vanish"};bulletml.Vanish.prototype=new bulletml.Command;bulletml.Repeat=function(){this.commandName="repeat";this.times=0;this.action=null;this.params=[]};bulletml.Repeat.prototype=new bulletml.Command;bulletml.Repeat.prototype.setRoot=function(a){this.root=
a;this.action&&this.action.setRoot(a)};bulletml.Bind=function(a,b){this.commandName="bind";this.variable=a;this.expression=b};bulletml.Bind.prototype=new bulletml.Command;bulletml.DummyCommand=new bulletml.Command;bulletml.Direction=function(a){this.type="aim";this.value=a||0};bulletml.Speed=function(a){this.type="absolute";this.value=void 0===a?1:a};bulletml.Horizontal=function(a){this.type="absolute";this.value=a||0};bulletml.Vertical=function(a){this.type="absolute";this.value=a||0};bulletml.FireOption=
function(a){a=a||{};this.offsetX=a.offsetX||0;this.offsetY=a.offsetY||0;this.autonomy=!!a.autonomy};bulletml.OffsetX=function(a){this.value=a||0};bulletml.OffsetY=function(a){this.value=a||0};bulletml.Autonomy=function(a){this.value=!!a};bulletml.dsl=function(a){var a=a||"",b;for(b in bulletml.dsl)bulletml.dsl.hasOwnProperty(b)&&(bulletml.GLOBAL[a+b]=bulletml.dsl[b])};bulletml.dsl.action=function(a){if(1<arguments.length)for(var b=0,c=arguments.length;b<c;b++)arguments[b]instanceof Function&&(arguments[b]=
arguments[b]());else{b=0;for(c=a.length;b<c;b++)a[b]instanceof Function&&(a[b]=a[b]())}var d=new bulletml.Action;if(a instanceof Array){if(a.some(function(a){return!(a instanceof bulletml.Command)}))throw Error("argument type error.");d.commands=a}else{b=0;for(c=arguments.length;b<c;b++)if(arguments[b]instanceof bulletml.Command)d.commands[b]=arguments[b];else throw Error("argument type error.");}return d};bulletml.dsl.actionRef=function(a,b){for(var c=0,d=arguments.length;c<d;c++)arguments[c]instanceof
Function&&(arguments[c]=arguments[c]());if(void 0===a)throw Error("label is required.");d=new bulletml.ActionRef;d.label=""+a;if(b instanceof Array)d.params=b;else for(c=1;c<arguments.length;c++)d.params.push(arguments[c]);return d};bulletml.dsl.bullet=function(a,b,c,d){for(var f=0,e=arguments.length;f<e;f++)arguments[f]instanceof Function&&(arguments[f]=arguments[f]());e=new bulletml.Bullet;for(f=0;f<arguments.length;f++)arguments[f]instanceof bulletml.Direction?e.direction=arguments[f]:arguments[f]instanceof
bulletml.Speed?e.speed=arguments[f]:arguments[f]instanceof bulletml.Action?e.actions.push(arguments[f]):arguments[f]instanceof bulletml.ActionRef?e.actions.push(arguments[f]):arguments[f]instanceof Array?e.actions.push(bulletml.dsl.action(arguments[f])):arguments[f]instanceof Object?e.option=arguments[f]:"string"===typeof arguments[f]&&(e.label=arguments[f]);return e};bulletml.dsl.bulletRef=function(a,b){for(var c=0,d=arguments.length;c<d;c++)arguments[c]instanceof Function&&(arguments[c]=arguments[c]());
if(void 0===a)throw Error("label is required.");d=new bulletml.BulletRef;d.label=""+a;if(b instanceof Array)d.params=b;else for(c=1;c<arguments.length;c++)d.params.push(arguments[c]);return d};bulletml.dsl.fire=function(a,b,c,d){for(var f=0,e=arguments.length;f<e;f++)arguments[f]instanceof Function&&(arguments[f]=arguments[f]());e=new bulletml.Fire;for(f=0;f<arguments.length;f++)arguments[f]instanceof bulletml.Direction?e.direction=arguments[f]:arguments[f]instanceof bulletml.Speed?e.speed=arguments[f]:
arguments[f]instanceof bulletml.Bullet?e.bullet=arguments[f]:arguments[f]instanceof bulletml.BulletRef?e.bullet=arguments[f]:arguments[f]instanceof bulletml.FireOption?e.option=arguments[f]:arguments[f]instanceof bulletml.OffsetX?e.option.offsetX=arguments[f].value:arguments[f]instanceof bulletml.OffsetY?e.option.offsetY=arguments[f].value:arguments[f]instanceof bulletml.Autonomy&&(e.option.autonomy=arguments[f].value);if(void 0===e.bullet)throw Error("bullet (or bulletRef) is required.");return e};
bulletml.dsl.fireRef=function(a,b){for(var c=0,d=arguments.length;c<d;c++)arguments[c]instanceof Function&&(arguments[c]=arguments[c]());if(void 0===a)throw Error("label is required.");d=new bulletml.FireRef;d.label=""+a;if(b instanceof Array)d.params=b;else for(c=1;c<arguments.length;c++)d.params.push(arguments[c]);return d};bulletml.dsl.changeDirection=function(a,b){for(var c=0,d=arguments.length;c<d;c++)arguments[c]instanceof Function&&(arguments[c]=arguments[c]());if(void 0===a)throw Error("direction is required.");
if(void 0===b)throw Error("term is required.");c=new bulletml.ChangeDirection;c.direction=a instanceof bulletml.Direction?a:new bulletml.Direction(a);c.term=b;return c};bulletml.dsl.changeSpeed=function(a,b){for(var c=0,d=arguments.length;c<d;c++)arguments[c]instanceof Function&&(arguments[c]=arguments[c]());if(void 0===a)throw Error("speed is required.");if(void 0===b)throw Error("term is required.");c=new bulletml.ChangeSpeed;c.speed=a instanceof bulletml.Speed?a:new bulletml.Speed(a);c.term=b;
return c};bulletml.dsl.accel=function(a,b,c){for(var d=0,e=arguments.length;d<e;d++)arguments[d]instanceof Function&&(arguments[d]=arguments[d]());e=new bulletml.Accel;for(d=0;d<arguments.length;d++)arguments[d]instanceof bulletml.Horizontal?e.horizontal=a:arguments[d]instanceof bulletml.Vertical?e.vertical=b:e.term=arguments[d];if(void 0===e.horizontal&&void 0===e.vertical)throw Error("horizontal or vertical is required.");if(void 0===e.term)throw Error("term is required.");return e};bulletml.dsl.wait=
function(a){for(var b=0,c=arguments.length;b<c;b++)arguments[b]instanceof Function&&(arguments[b]=arguments[b]());if(void 0===a)throw Error("value is required.");return new bulletml.Wait(a)};bulletml.dsl.vanish=function(){return new bulletml.Vanish};bulletml.dsl.repeat=function(a,b){for(var c=0,d=arguments.length;c<d;c++)arguments[c]instanceof Function&&(arguments[c]=arguments[c]());if(void 0===a)throw Error("times is required.");if(void 0===b)throw Error("action is required.");d=new bulletml.Repeat;
d.times=a;if(b instanceof bulletml.Action||b instanceof bulletml.ActionRef)d.action=b;else if(b instanceof Array)d.action=bulletml.dsl.action(b);else{for(var e=[],c=1;c<arguments.length;c++)e.push(arguments[c]);d.action=bulletml.dsl.action(e)}return d};bulletml.dsl.direction=function(a,b){for(var c=0,d=arguments.length;c<d;c++)arguments[c]instanceof Function&&(arguments[c]=arguments[c]());if(void 0===a)throw Error("value is required.");c=new bulletml.Direction(a);void 0!==b&&(c.type=b);return c};
bulletml.dsl.speed=function(a,b){for(var c=0,d=arguments.length;c<d;c++)arguments[c]instanceof Function&&(arguments[c]=arguments[c]());if(void 0===a)throw Error("value is required.");c=new bulletml.Speed(a);b&&(c.type=b);return c};bulletml.dsl.horizontal=function(a,b){for(var c=0,d=arguments.length;c<d;c++)arguments[c]instanceof Function&&(arguments[c]=arguments[c]());if(void 0===a)throw Error("value is required.");c=new bulletml.Horizontal(a);b&&(c.type=b);return c};bulletml.dsl.vertical=function(a,
b){for(var c=0,d=arguments.length;c<d;c++)arguments[c]instanceof Function&&(arguments[c]=arguments[c]());if(void 0===a)throw Error("value is required.");c=new bulletml.Vertical(a);b&&(c.type=b);return c};bulletml.dsl.fireOption=function(a){return new bulletml.FireOption(a)};bulletml.dsl.offsetX=function(a){return new bulletml.OffsetX(a)};bulletml.dsl.offsetY=function(a){return new bulletml.OffsetY(a)};bulletml.dsl.autonomy=function(a){return new bulletml.Autonomy(a)};bulletml.dsl.bind=function(a,
b){return new bulletml.Bind(a,b)}})();var BulletML=bulletml;tm.bulletml=tm.bulletml||{};
(function(){function m(e){for(;e<=-Math.PI;)e+=2*Math.PI;for(;Math.PI<e;)e-=2*Math.PI;return e}function q(e,g){return Math.atan2(g.y-e.y,g.x-e.x)}tm.bulletml.AttackPattern=tm.createClass({init:function(e){if(!e)throw Error("argument is invalid.",e);this._bulletml=e},createTicker:function(e,g){var h=this._bulletml.getTopActionLabels();if(void 0===g&&0<h.length){for(var j=[],i=0,k=h.length;i<k;i++)j[j.length]=this._createTicker(e,h[i]);for(var d=function(){for(var e=j.length;e--;)j[e].call(this);d.compChildCount==
j.length&&(d.completed=!0,this.dispatchEvent(tm.event.Event("completeattack")))},i=j.length;i--;)j[i].parentTicker=d;d.compChildCount=0;d.completeChild=function(){this.compChildCount++};d.compChildCount=0;d.completed=!1;d.isDanmaku=!0;return d}return this._createTicker(e,g)},_createTicker:function(e,g){var h=e,j={},i=tm.bulletml.AttackPattern.defaultConfig,k;for(k in i)i.hasOwnProperty(k)&&(j[k]=i[k]);for(k in h)h.hasOwnProperty(k)&&(j[k]=h[k]);e=j;if(!e.target)throw Error("target is undefined in config.");
var d=function(){d.age+=1;this.age=d.age;var e=d.config,a=d._pattern;if(a)if(d.age<d.chDirEnd?d.direction+=d.dirIncr:d.age===d.chDirEnd&&(d.direction=d.dirFin),d.age<d.chSpdEnd?d.speed+=d.spdIncr:d.age===d.chSpdEnd&&(d.speed=d.spdFin),d.age<d.aclEnd?(d.speedH+=d.aclIncrH,d.speedV+=d.aclIncrV):d.age===d.aclEnd&&(d.speedH=d.aclFinH,d.speedV=d.aclFinV),this.x+=Math.cos(d.direction)*d.speed*e.speedRate,this.y+=Math.sin(d.direction)*d.speed*e.speedRate,this.x+=d.speedH*e.speedRate,this.y+=d.speedV*e.speedRate,
e.isInsideOfWorld(this)){if(e.updateProperties&&(this.rotation=(d.direction+0.5*Math.PI)*Math.RAD_TO_DEG,this.speed=d.speed),!(d.age<d.waitTo||d.completed)){for(var b;b=d.walker.next();)switch(b.commandName){case "fire":a._fire.call(this,b,e,d,a);break;case "wait":e=0;d.waitTo="number"===typeof b.value?d.age+b.value:0!==(e=~~b.value)?d.age+e:d.age+eval(b.value);return;case "changeDirection":a._changeDirection.call(this,b,e,d);break;case "changeSpeed":a._changeSpeed.call(this,b,d);break;case "accel":a._accel.call(this,
b,d);break;case "vanish":this.remove(),this.dispatchEvent(tm.event.Event("removed"))}d.completed=!0;d.parentTicker?d.parentTicker.completeChild():this.dispatchEvent(tm.event.Event("completeattack"))}}else this.remove(),d.completed=!0,d.parentTicker?d.parentTicker.completeChild():this.dispatchEvent(tm.event.Event("completeattack"))},g=g||"top";if("string"===typeof g)d.walker=this._bulletml.getWalker(g,e.rank);else if(g instanceof bulletml.Bullet)d.walker=g.getWalker(e.rank);else throw window.console.error(e,
g),Error("\u5f15\u6570\u304c\u4e0d\u6b63");d._pattern=this;d.config=e;d.waitTo=-1;d.completed=!1;d.direction=0;d.lastDirection=0;d.speed=0;d.lastSpeed=0;d.speedH=0;d.speedV=0;d.dirIncr=0;d.dirFin=0;d.chDirEnd=-1;d.spdIncr=0;d.spdFin=0;d.chSpdEnd=-1;d.aclIncrH=0;d.aclFinH=0;d.aclIncrV=0;d.aclFinV=0;d.aclEnd=-1;d.age=-1;d.isDanmaku=!0;return d},_fire:function(e,g,h,j){var i={label:e.bullet.label},k;for(k in e.bullet.option)i[k]=e.bullet.option[k];if(i=g.bulletFactory(i)){var d=j.createTicker(g,e.bullet),
m=this,a={x:this.x+e.option.offsetX,y:this.y+e.option.offsetY};h.lastDirection=d.direction=function(b){var c=eval(b.value)*Math.DEG_TO_RAD;switch(b.type){case "aim":return g.target?e.option.autonomy?q(a,g.target)+c:q(m,g.target)+c:c-Math.PI/2;case "absolute":return c-Math.PI/2;case "relative":return h.direction+c;default:return h.lastDirection+c}}(e.direction||e.bullet.direction);h.lastSpeed=d.speed=function(a){var c=eval(a.value);switch(a.type){case "relative":return h.speed+c;case "sequence":return h.lastSpeed+
c;default:return c}}(e.speed||e.bullet.speed);i.x=a.x;i.y=a.y;g.updateProperties&&(i.rotation=(h.direction+0.5*Math.PI)*Math.RAD_TO_DEG,i.speed=h.speed);i.addEventListener("enterframe",d);i.addEventListener("removed",function(){this.removeEventListener("enterframe",d);this.removeEventListener("removed",arguments.callee)});g.addTarget?g.addTarget.addChild(i):this.parent&&this.parent.addChild(i)}},_changeDirection:function(e,g,h){var j=eval(e.direction.value)*Math.DEG_TO_RAD,i=eval(e.term);switch(e.direction.type){case "aim":e=
g.target;if(!e)return;h.dirFin=q(this,e)+j;h.dirIncr=m(h.dirFin-h.direction)/i;break;case "absolute":h.dirFin=j-Math.PI/2;h.dirIncr=m(h.dirFin-h.direction)/i;break;case "relative":h.dirFin=h.direction+j;h.dirIncr=m(h.dirFin-h.direction)/i;break;case "sequence":h.dirIncr=j,h.dirFin=h.direction+h.dirIncr*(i-1)}h.chDirEnd=h.age+i},_changeSpeed:function(e,g){console.log("changeSpeed");var h=eval(e.speed.value),j=eval(e.term);switch(e.speed.type){case "absolute":g.spdFin=h;g.spdIncr=(g.spdFin-g.speed)/
j;break;case "relative":g.spdFin=h+g.speed;g.spdIncr=(g.spdFin-g.speed)/j;break;case "sequence":g.spdIncr=h,g.spdFin=g.speed+g.spdIncr*j}g.chSpdEnd=g.age+j},_accel:function(e,g){var h=eval(e.term);g.aclEnd=g.age+h;if(e.horizontal){var j=eval(e.horizontal.value);switch(e.horizontal.type){case "absolute":case "sequence":g.aclIncrH=(j-g.speedH)/h;g.aclFinH=j;break;case "relative":g.aclIncrH=j,g.aclFinH=(j-g.speedH)*h}}else g.aclIncrH=0,g.aclFinH=g.speedH;if(e.vertical)switch(j=eval(e.vertical.value),
e.vertical.type){case "absolute":case "sequence":g.aclIncrV=(j-g.speedV)/h;g.aclFinV=j;break;case "relative":g.aclIncrV=j,g.aclFinV=(j-g.speedV)*h}else g.aclIncrV=0,g.aclFinV=g.speedV}});var n=tm.graphics.Canvas();n.resize(8,8);n.setTransformCenter();n.setLineStyle(0).setStrokeStyle("rgba(0,0,0,0)");n.setFillStyle(tm.graphics.RadialGradient(0,0,0,0,0,4).addColorStopList([{offset:0,color:"white"},{offset:0.5,color:"white"},{offset:1,color:"red"}]).toStyle()).fillCircle(0,0,4);tm.bulletml.defaultBulletFactory=
function(e){var g=tm.app.Sprite(8,8,n);g.label=e.label;return g};tm.bulletml.defaultIsInsideOfWorld=function(){return!0};tm.bulletml.AttackPattern.defaultConfig={bulletFactory:tm.bulletml.defaultBulletFactory,isInsideOfWorld:tm.bulletml.defaultIsInsideOfWorld,rank:0,updateProperties:!1,speedRate:2,target:null}})();
