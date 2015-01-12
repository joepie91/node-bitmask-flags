var Bitmask, BitmaskHandler, isPowerOfTwo;

isPowerOfTwo = function(number) {
  return number !== 0 && ((number & (number - 1)) === 0);
};

Bitmask = (function() {
  function Bitmask(handler, initialValue, initialOriginalValue) {
    this.handler = handler;
    this.value = initialValue;
    this.originalValue = initialOriginalValue;
  }

  Bitmask.prototype._getFlagValue = function(flag) {
    if (this.handler.flagMap[flag] != null) {
      return this.handler.flagMap[flag].value;
    } else {
      throw new Error("No such flag exists.");
    }
  };

  Bitmask.prototype._getFlagInheritances = function(flag) {
    if (this.handler.flagMap[flag] != null) {
      return this.handler.flagMap[flag].inheritedFlags;
    } else {
      throw new Error("No such flag exists.");
    }
  };

  Bitmask.prototype.add = function(flag) {
    var flagInheritances, flagValue, inheritance, _i, _len, _results;
    flagValue = this._getFlagValue(flag);
    flagInheritances = this._getFlagInheritances(flag);
    if (this.originalValue != null) {
      this.originalValue = this.originalValue | flagValue;
    }
    this.value = this.value | flagValue;
    _results = [];
    for (_i = 0, _len = flagInheritances.length; _i < _len; _i++) {
      inheritance = flagInheritances[_i];
      flagValue = this._getFlagValue(inheritance);
      _results.push(this.value = this.value | flagValue);
    }
    return _results;
  };

  Bitmask.prototype.remove = function(flag) {
    var flagInheritances, flagValue, inheritance, _i, _len, _results;
    flagValue = this._getFlagValue(flag);
    flagInheritances = this._getFlagInheritances(flag);
    if (this.originalValue != null) {
      this.originalValue = this.originalValue & ~flagValue;
    }
    this.value = this.value & ~flagValue;
    _results = [];
    for (_i = 0, _len = flagInheritances.length; _i < _len; _i++) {
      inheritance = flagInheritances[_i];
      flagValue = this._getFlagValue(inheritance);
      if ((this.originalValue != null) && !(this.originalValue & flagValue)) {
        _results.push(this.value = this.value & ~flagValue);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Bitmask.prototype.has = function(flag) {
    var flagValue;
    flagValue = this._getFlagValue(flag);
    return !!(this.value & flagValue);
  };

  Bitmask.prototype.getValue = function() {
    return this.value;
  };

  Bitmask.prototype.getOriginalValue = function() {
    return this.originalValue;
  };

  return Bitmask;

})();

BitmaskHandler = (function() {
  function BitmaskHandler(flagMap) {
    this.setFlagMap(flagMap);
  }

  BitmaskHandler.prototype.setFlagMap = function(flagMap) {
    var flag, inheritance, value, _i, _len, _ref;
    for (flag in flagMap) {
      value = flagMap[flag];
      if (typeof value === "number") {
        value = {
          value: value
        };
        flagMap[flag] = value;
      }
      if (value.inheritedFlags == null) {
        value.inheritedFlags = [];
      }
      _ref = value.inheritedFlags;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        inheritance = _ref[_i];
        if (!(inheritance in flagMap)) {
          throw new Error("The " + flag + " flag attempts to inherit the non-existent " + inheritance + " flag.");
        }
      }
      if (!isPowerOfTwo(value.value)) {
        throw new Error("The value for the " + flag + " flag (" + value.value + ") is not a power of two.");
      }
    }
    return this.flagMap = flagMap;
  };

  BitmaskHandler.prototype.create = function(initialValue, initialOriginalValue) {
    var instance;
    if (initialValue == null) {
      initialValue = 0;
    }
    return instance = new Bitmask(this, initialValue, initialOriginalValue);
  };

  return BitmaskHandler;

})();

module.exports = function(flagMap) {
  return new BitmaskHandler(flagMap);
};
