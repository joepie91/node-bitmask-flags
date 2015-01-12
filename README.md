# bitmask-flags

A utility for working with bitmasks to do flags and permissions. Supports flag inheritance.

While the examples in this documentation will show usage for a permission system, you could of course use it for any kind of flags.

## License

[WTFPL](http://www.wtfpl.net/txt/copying/) or [CC0](https://creativecommons.org/publicdomain/zero/1.0/), whichever you prefer.

## Contributing

Pull requests welcome. Please make sure your modifications are in line with the overall code style, and ensure that you're editing the `.coffee` files, not the `.js` files.

As this module could potentially deal with authentication, tests are needed; a pull request for those would be especially welcome.

Build tool of choice is `gulp`; simply run `gulp` while developing, and it will watch for changes.

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
