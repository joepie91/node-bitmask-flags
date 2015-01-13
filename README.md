# bitmask-flags

A utility for working with bitmasks to do flags and permissions. Supports flag inheritance.

While the examples in this documentation will show usage for a permission system, you could of course use it for any kind of flags.

## License

[WTFPL](http://www.wtfpl.net/txt/copying/) or [CC0](https://creativecommons.org/publicdomain/zero/1.0/), whichever you prefer.

## Donate

My income consists entirely of donations for my projects. If this module is useful to you, consider [making a donation](http://cryto.net/~joepie91/donate.html)!

You can donate using Bitcoin, PayPal, Gratipay, Flattr, cash-in-mail, SEPA transfers, and pretty much anything else.

## Contributing

Pull requests welcome. Please make sure your modifications are in line with the overall code style, and ensure that you're editing the `.coffee` files, not the `.js` files.

As this module could potentially deal with authentication, tests are needed; a pull request for those would be especially welcome.

Build tool of choice is `gulp`; simply run `gulp` while developing, and it will watch for changes.

Be aware that by making a pull request, you agree to release your modifications under the licenses stated above.

## Usage

### Create a new instance

```javascript
var bitmaskFlags = require("bitmask-flags");

var flagHandler = bitmaskFlags({
	view_announcements: 1,
	create_announcements: {
		value: 2,
		inheritedFlags: ["edit_announcements"]
	},
	edit_announcements: 4,
	delete_announcements: 8
});
```

Why you need to explicitly specify the values for each flag? Because if they were assigned automatically in order, it'd be too easy to accidentally mess up the values of your flags during later editing or rearranging. Especially in a permission system, that could have disastrous consequences.

`bitmask-flags` will do a sanity check on instantiating to ensure that all of your flags are a power of 2. If that's not the case, it will throw an Error and bail out.

### Regular flags

The `user` object is a hypothetical ORM model/object of some sort. It hypothetically supports plain attributes and has a save() method, for the sake of illustrating how this module works.

```javascript
var permissions = flagHandler.create(); // This is how you create a new value, starting at 0 (no flags).
// or
var permissions = flagHandler.create(user.permissions); // This is how you use an existing starting value (eg. from the database).
// or
var permissions = flagHandler.create(user.permissions, user.originalPermissions); // If you want to use flag inheritance (explained later).

permissions.add("view_announcements"); // This permission is now set.
permissions.add("delete_announcements"); // The value now has `view_announcements` and `delete_announcements` flags.

permissions.remove("view_announcements"); // Now only `delete_announcements` is left.

console.log(permissions.has("delete_announcements")); // true

user.permissions = permissions.getValue();
user.save(); // Done!
```

### Flag inheritance

The really interesting thing, though, is flag inheritance. Sometimes one flag should automatically grant another flag, but the other flag can also be granted separately. `bitmask-flags` makes this easy.

Note that you will have to store *two* values in your database for this to work, rather than one - the second value indicates which flags were *explicitly* set. This way, when you've explicitly set a child flag, unsetting the parent flag won't change the state of the child flag. That also means you can explicitly set a flag that was *already* set through inheritance, and have it persist.

For these examples, we will assume that the section above never happened, and the user starts out with no permissions.

```javascript
var permissions = flagHandler.create(user.permissions, user.originalPermissions); // Like we saw before...

permissions.add("create_announcements"); // The user now has `create_announcements` AND `edit_anouncements`.

console.log(permissions.has("edit_announcements")); // true

permissions.remove("create_announcements"); // The user now has no permissions.

console.log(permissions.has("edit_announcements")); // false

/* Now let's try that again, but this time explicitly setting `edit_announcements`. */

permissions.add("create_announcements"); // The user now has `create_announcements` and `edit_anouncements`.
permissions.add("edit_announcements"); // The user *still* has `create_announcements` and `edit_anouncements`.

permissions.remove("create_announcements");

console.log(permissions.has("edit_announcements")); // true - Because we set `edit_announcements` explicitly, it wasn't unset along with `create_announcements`. Magic!

user.permissions = permissions.getValue();
user.originalPermissions = permissions.getOriginalValue();
user.save(); // Done! The inheritance structure will persist, even through database loads and saves.
```

In this example, `getValue()` will return the effective value (ie. all flags that are set), while `getOriginalValue()` will only return a value consisting of the *explicitly* set flags. This second value is what is used to keep track of inherited permissions, and should be passed as a second argument to `.create` when creating a new value.


## API

### bitmaskFlags(flagMap)

Returns a new bitmaskFlags instance with the given `flagMap`. The `flagMap` is an object that maps flag names to values and, optionally, inheritances.

Each value in the `flagMap` object can either be an object with options, or a number directly. All values should be powers of two. See the Example section for a usage example.

An Error is thrown if there is a problem with the flagMap; eg. one of the values is not a power of two, or one of the inheritances refers to a non-existent flag.

The rest of the API documentation will refer to the returned value as `flagHandler`.

### flagHandler.create([initialValue, [initialOriginalValue]])

Creates a new value.

* __initialValue__: The initial value it should be set to. This is typically the current value from a database. Defaults to 0 (no flags set).
* __initialOriginalValue__: The initial 'original value', when using flag inheritance. This is the value that represents the *explicitly* set flags, so that they are not automatically unset through inheritance. Leaving this out will make inheritance very unpleasant to work with; however, if you do not use inheritance, you can omit this option. __For a 'blank' value, you *must* explicitly set this to 0.__

The rest of the API documentation will refer to the returned value as `flagValue`.

### flagHandler.setFlagMap(flagMap)

Replaces the current `flagMap` of the handler with a new one. The same sanity checks are performed as for `bitmaskFlags(flagMap)`, and the same input is accepted.

### flagHandler.getflagMap()

Returns the current `flagMap`.

### flagHandler.getInheritedFlags(flag)

Returns an array of flags that inherited from the specified flag.

* __flag__: The name of the flag to return the inheritances for. An Error is thrown if it does not exist.

### flagHandler.getFlagValue(flag)

Returns the internal bitmask value for the specified flag. This is the value originally specified in the `flagMap`.

*You almost certainly won't need this; look at the `flagValue` API methods instead.*

* __flag__: The flag to return the internal bitmask value for. An Error is thrown if it does not exist.

### flagValue.add(flag)

Sets the flag (if it is not yet set). Also sets any inherited flags.

* __flag__: The name of the flag to set. An Error is thrown if it does not exist.

### flagValue.remove(flag)

Unsets the flag (if it is set). Also unsets any inherited flags, except for those that were *explicitly* set (assuming an initialOriginalValue was specified).

* __flag__: The name of the flag to unset. An Error is thrown if it does not exist.

### flagValue.has(flag)

Returns whether the specified flag is set or not.

* __flag__: The flag to check. An Error is thrown if it does not exist.

### flagValue.getValue()

Returns the current value as a Number. This is what you'll want to use for storing the effective value in a database.

It is the value that you will pass to `flagHandler.create([initialValue, [initialOriginalValue]])` as the first argument (`initialValue`).

### flagValue.getOriginalValue()

Returns the current 'original value' as a Number. This represents the explicitly set flags, and you will have to store this in your database as a separate value for full inheritance support.

It is the value that you will pass to `flagHandler.create([initialValue, [initialOriginalValue]])` as the second argument (`initialOriginalValue`).

### flagValue.getFlags()

Returns an array of all the flags (names, not values) that are set in the current value, both explicit and inherited.

*You probably won't need this, unless you're trying to debug something.*

## Changelog

### v0.0.2

* More exposed API methods: `getFlagMap`, `getFlags` and `getInheritedFlags`.
* Documentation update; now with a full API documentation and a changelog!
* Shuffled around some functions, so that they are in a sensible place.

### v0.0.1

Initial release.
