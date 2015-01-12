isPowerOfTwo = (number) -> number != 0 and ((number & (number - 1)) == 0)

class Bitmask
	constructor: (@handler, initialValue, initialOriginalValue) ->
		@value = initialValue
		@originalValue = initialOriginalValue
	_getFlagValue: (flag) ->
		if @handler.flagMap[flag]?
			return @handler.flagMap[flag].value
		else
			throw new Error("No such flag exists.")
	_getFlagInheritances: (flag) ->
		if @handler.flagMap[flag]?
			return @handler.flagMap[flag].inheritedFlags
		else
			throw new Error("No such flag exists.")
	add: (flag) ->
		flagValue = @_getFlagValue(flag)
		flagInheritances = @_getFlagInheritances(flag)

		if @originalValue?
			@originalValue = @originalValue | flagValue
		@value = @value | flagValue

		for inheritance in flagInheritances
			flagValue = @_getFlagValue(inheritance)
			@value = @value | flagValue
	remove: (flag) ->
		flagValue = @_getFlagValue(flag)
		flagInheritances = @_getFlagInheritances(flag)

		if @originalValue?
			@originalValue = @originalValue & ~flagValue
		@value = @value & ~flagValue

		for inheritance in flagInheritances
			flagValue = @_getFlagValue(inheritance)

			if @originalValue? and !(@originalValue & flagValue)
				@value = @value & ~flagValue
	has: (flag) ->
		flagValue = @_getFlagValue(flag)
		return !!(@value & flagValue)
	getValue: ->
		return @value
	getOriginalValue: ->
		return @originalValue

class BitmaskHandler
	constructor: (flagMap) ->
		@setFlagMap flagMap
	setFlagMap: (flagMap) ->
		# Sanity check
		for flag, value of flagMap
			if typeof value == "number"
				# Encapsulate in an object...
				value = {value: value}
				flagMap[flag] = value

			value.inheritedFlags ?= []

			for inheritance in value.inheritedFlags
				if inheritance not of flagMap
					throw new Error("The #{flag} flag attempts to inherit the non-existent #{inheritance} flag.")

			if not isPowerOfTwo value.value
				throw new Error("The value for the #{flag} flag (#{value.value}) is not a power of two.")

		@flagMap = flagMap
	create: (initialValue = 0, initialOriginalValue) ->
		instance = new Bitmask(this, initialValue, initialOriginalValue)

module.exports = (flagMap) -> new BitmaskHandler(flagMap)

