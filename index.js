// MQTT Switch Accessory plugin for HomeBridge
//
// Remember to add accessory to config.json. Example:
// "accessories": [
//     {
//            "accessory": "mqttlightbulb",
//            "name": "PUT THE NAME OF YOUR SWITCH HERE",
//            "url": "PUT URL OF THE BROKER HERE",
//			  "username": "PUT USERNAME OF THE BROKER HERE",
//            "password": "PUT PASSWORD OF THE BROKER HERE"
// 			  "caption": "PUT THE LABEL OF YOUR SWITCH HERE",
// 			  "topics": {
// 				"statusGet": 	"PUT THE MQTT TOPIC FOR THE GETTING THE STATUS OF YOUR SWITCH HERE",
// 				"statusSet": 	"PUT THE MQTT TOPIC FOR THE SETTING THE STATUS OF YOUR SWITCH HERE"
// 			  }
//     }
// ],
//
// When you attempt to add a device, it will ask for a "PIN code".
// The default code for all HomeBridge accessories is 031-45-154.

'use strict';

var Service, Characteristic;
var mqtt = require("mqtt");
var inherits = require('util').inherits;

// Necessary because Accessory is defined after we have defined all of our classes
function fixInheritance(subclass, superclass) {
    var proto = subclass.prototype;
    inherits(subclass, superclass);
    subclass.prototype.parent = superclass.prototype;
    for (var mn in proto) {
        subclass.prototype[mn] = proto[mn];
    }
}


function mqttlightbulbAccessory(log, config) {
  	this.log          	= log;
  	this.name 			= config["name"];
  	this.url 			= config["url"];
	this.client_Id 		= 'mqttjs_' + Math.random().toString(16).substr(2, 8);
	this.options = {
	    keepalive: 10,
    	clientId: this.client_Id,
	    protocolId: 'MQTT',
    	protocolVersion: 4,
    	clean: true,
    	reconnectPeriod: 1000,
    	connectTimeout: 30 * 1000,
		will: {
			topic: 'WillMsg',
			payload: 'Connection Closed abnormally..!',
			qos: 0,
			retain: false
		},
	    username: config["username"],
	    password: config["password"],
    	rejectUnauthorized: false
	};
	this.caption		= config["caption"];
	this.retain             = config["retain"];
  this.topics = config["topics"];
	this.on = false;
    this.randomEffect = false;
  this.brightness = 0;
  this.hue = 0;
  this.saturation = 0;

	this.service = new mqttlightbulbAccessory.RandomLightbulb(this.name);
    this.service.addOptionalCharacteristic(Cha)
  	this.service
      .getCharacteristic(Characteristic.On)
    	.on('get', this.getStatus.bind(this))
    	.on('set', this.setStatus.bind(this));
  	this.service
      .getCharacteristic(mqttlightbulbAccessory.RandomEffect)
    	.on('get', this.getRandomEffect.bind(this))
    	.on('set', this.setRandomEffect.bind(this));
    this.service
      .getCharacteristic(Characteristic.Brightness)
    	.on('get', this.getBrightness.bind(this))
    	.on('set', this.setBrightness.bind(this));
    this.service
      .getCharacteristic(Characteristic.Hue)
    	.on('get', this.getHue.bind(this))
    	.on('set', this.setHue.bind(this));
    this.service
      .getCharacteristic(Characteristic.Saturation)
    	.on('get', this.getSaturation.bind(this))
    	.on('set', this.setSaturation.bind(this));

	// connect to MQTT broker
	this.client = mqtt.connect(this.url, this.options);
	var that = this;
	this.client.on('error', function (err) {
		that.log('Error event on MQTT:', err);
	});

	this.client.on('message', function (topic, message) {
    // console.log(message.toString(), topic);

		if (topic == that.topics.getOn) {
			var status = message.toString();
			that.on = (status == "true" ? true : false);
		   	that.service.getCharacteristic(Characteristic.On).setValue(that.on, undefined, 'fromSetValue');
		}

    if (topic == that.topics.getBrightness) {
      var val = parseInt(message.toString());
      that.brightness = val;
      that.service.getCharacteristic(Characteristic.Brightness).setValue(that.brightness, undefined, 'fromSetValue');
    }

    if (topic == that.topics.getHue) {
      var val = parseInt(message.toString());
      that.hue = val;
      that.service.getCharacteristic(Characteristic.Hue).setValue(that.hue, undefined, 'fromSetValue');
    }
	if (topic == that.topics.getRandomEffect) {
		var status = message.toString();
		that.randomEffect = (status == "true" ? true : false);
	   	that.service.getCharacteristic(mqttlightbulbAccessory.RandomEffect).setValue(that.randomEffect, undefined, 'fromSetValue');
	}
    if (topic == that.topics.getSaturation) {
      var val = parseInt(message.toString());
      that.saturation = val;
      that.service.getCharacteristic(Characteristic.Brightness).setValue(that.saturation, undefined, 'fromSetValue');
    }
	});
    this.client.subscribe(this.topics.getOn);
    this.client.subscribe(this.topics.getBrightness);
    this.client.subscribe(this.topics.getHue);
    this.client.subscribe(this.topics.getSaturation);
    this.client.subscribe(this.topics.getRandomEffect);
}

module.exports = function(homebridge) {
  	Service = homebridge.hap.Service;
  	Characteristic = homebridge.hap.Characteristic;

    fixInheritance(mqttlightbulbAccessory.RandomLightbulb,Service);
    fixInheritance(mqttlightbulbAccessory.RandomEffect,Characteristic);

  	homebridge.registerAccessory("homebridge-random-mqttlightbulb", "randommqttlightbulb", mqttlightbulbAccessory);
}

mqttlightbulbAccessory.prototype.getStatus = function(callback) {
    callback(null, this.on);
}

mqttlightbulbAccessory.prototype.setStatus = function(status, callback, context) {
	if(context !== 'fromSetValue') {
		this.on = status;
	  this.client.publish(this.topics.setOn, status ? "true" : "false",{ retain: this.retain});
	}
	callback();
}

mqttlightbulbAccessory.prototype.getRandomEffect = function(callback) {
    callback(null, this.randomEffect);
}

mqttlightbulbAccessory.prototype.setRandomEffect = function(status, callback, context) {
	if(context !== 'fromSetValue') {
		this.randomEffect = status;
	  this.client.publish(this.topics.setRandomEffect, status ? "true" : "false",{ retain: this.retain});
	}
	callback();
}


mqttlightbulbAccessory.prototype.getBrightness = function(callback) {
    callback(null, this.brightness);
}

mqttlightbulbAccessory.prototype.setBrightness = function(brightness, callback, context) {
	if(context !== 'fromSetValue') {
		this.brightness = brightness;
    // console.log("Brightness:",this.brightness);
	  this.client.publish(this.topics.setBrightness, this.brightness.toString(),{ retain: this.retain});
	}
	callback();
}

mqttlightbulbAccessory.prototype.getHue = function(callback) {
    callback(null, this.hue);
}

mqttlightbulbAccessory.prototype.setHue = function(hue, callback, context) {
	if(context !== 'fromSetValue') {
		this.hue = hue;
    // console.log("Hue:",this.hue);
	  this.client.publish(this.topics.setHue, this.hue.toString(),{ retain: this.retain});
	}
	callback();
}

mqttlightbulbAccessory.prototype.getSaturation = function(callback) {
    callback(null, this.saturation);
}

mqttlightbulbAccessory.prototype.setSaturation = function(saturation, callback, context) {
	if(context !== 'fromSetValue') {
		this.saturation = saturation;
    // console.log("Saturation:",this.saturation);
	  this.client.publish(this.topics.setSaturation, this.saturation.toString(),{ retain: this.retain});
	}
	callback();
}

mqttlightbulbAccessory.prototype.getServices = function() {
  return [this.service];
}

mqttlightbulbAccessory.RandomEffect = function() {
  Characteristic.call(this, 'Random Effect', '00001004-0000-1000-8000-0026BB76529A');
  this.setProps({
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
  });
  this.value = this.getDefaultValue();
};

mqttlightbulbAccessory.RandomLightbulb = function(displayName, subtype) {
  Service.call(this, displayName, '00001004-0000-1000-8000-0026BB765291', subtype);

  // Required Characteristics
  this.addCharacteristic(Characteristic.On);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.Brightness);
  this.addOptionalCharacteristic(Characteristic.Hue);
  this.addOptionalCharacteristic(Characteristic.Saturation);
  this.addOptionalCharacteristic(Characteristic.Name);
  this.addOptionalCharacteristic(Characteristic.ColorTemperature); //Manual fix to add temperature
  this.addOptionalCharacteristic(mqttlightbulbAccessory.RandomEffect);
};