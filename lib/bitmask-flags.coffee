isPowerOfTwo = (number) -> number != 0 and ((number & (number - 1)) == 0)

class Bitmask
	constructor: (@handler, initialValue, initialOriginalValue) ->
		@value = initialValue
		@originalValue = initialOriginalValue
	add: (flag) ->
		flagValue = @handler.getFlagValue(flag)
		flagInheritances = @handler.getInheritedFlags(flag)

		if @originalValue?
			@originalValue = @originalValue | flagValue
		@value = @value | flagValue

		for inheritance in flagInheritances
			flagValue = @handler.getFlagValue(inheritance)
			@value = @value | flagValue
	remove: (flag) ->
		flagValue = @handler.getFlagValue(flag)
		flagInheritances = @handler.getInheritedFlags(flag)

		if @originalValue?
			@originalValue = @originalValue & ~flagValue
		@value = @value & ~flagValue

		for inheritance in flagInheritances
			flagValue = @handler.getFlagValue(inheritance)

			if @originalValue? and !(@originalValue & flagValue)
				@value = @value & ~flagValue
	has: (flag) ->
		flagValue = @handler.getFlagValue(flag)
		return !!(@value & flagValue)
	getValue: ->
		return @value
	getOriginalValue: ->
		return @originalValue
	getFlags: ->
		flags = []
		for flag, opts of @handler.getFlagMap()
			if @has flag
				flags.push flag
		return flags

class BitmaskHandler
	constructor: (flagMap) ->
		@setFlagMap flagMap
	getFlagValue: (flag) ->
		if @flagMap[flag]?
			return @flagMap[flag].value
		else
			throw new Error("No such flag exists.")
	getInheritedFlags: (flag) ->
		if @flagMap[flag]?
			return @flagMap[flag].inheritedFlags
		else
			throw new Error("No such flag exists.")
	getFlagMap: ->
		return @flagMap
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
					throw new Error("The #{flag} flag attempted to inherit the non-existent #{inheritance} flag.")

			if not isPowerOfTwo value.value
				throw new Error("The value for the #{flag} flag (#{value.value}) is not a power of two.")

		@flagMap = flagMap
	create: (initialValue = 0, initialOriginalValue) ->
		instance = new Bitmask(this, initialValue, initialOriginalValue)

module.exports = (flagMap) -> new BitmaskHandler(flagMap)

