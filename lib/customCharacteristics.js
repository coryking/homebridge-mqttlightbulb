var inherits = require('util').inherits;

function RandomLightCharacteristics(Characteristic, Service) {

    this.RandomEffect = function() {
      Characteristic.call(this, 'Random Effect', '00001004-0000-1000-8000-0026BB76529A');
      this.setProps({
        format: Characteristic.Formats.BOOL,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    };
    inherits(this.RandomEffect, Characteristic);
    

    this.RandomLightbulb = function(displayName, subtype) {
      Service.call(this, displayName, '00000043-0000-1000-8000-0026BB765291', subtype);

      // Required Characteristics
      this.addCharacteristic(Characteristic.On);

      // Optional Characteristics
      this.addOptionalCharacteristic(Characteristic.Brightness);
      this.addOptionalCharacteristic(Characteristic.Hue);
      this.addOptionalCharacteristic(Characteristic.Saturation);
      this.addOptionalCharacteristic(Characteristic.Name);
      this.addOptionalCharacteristic(Characteristic.ColorTemperature); //Manual fix to add temperature
      this.addOptionalCharacteristic(Characteristic.Active);
    };
    inherits(this.RandomLightbulb, Service);

    return this;
};
module.exports.RandomLightCharacteristics = RandomLightCharacteristics;