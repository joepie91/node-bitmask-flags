/* I haven't bothered to write 'real' tests yet. I should probably do that at some point, given that this is supposed to deal with authentication. Pull requests welcome! */

var bitmaskFlags = require("./");

var flagHandler = bitmaskFlags({
	view_announcements: 1,
	create_announcements: {
		value: 2,
		inheritedFlags: ["edit_announcements"]
	},
	edit_announcements: 4,
	delete_announcements: 8
});

var permissions = flagHandler.create(); // This is how you create a new value, starting at 0 (no flags).

permissions.add("view_announcements"); // This permission is now set.
permissions.add("delete_announcements"); // The value now has `view_announcements` and `delete_announcements` flags.

permissions.remove("view_announcements"); // Now only `delete_announcements` is left.

console.log(false, permissions.has("view_announcements")); // false
console.log(true, permissions.has("delete_announcements")); // true

console.log(permissions.getValue());


var permissions = flagHandler.create(0, 0); // Like we saw before...

permissions.add("create_announcements"); // The user now has `create_announcements` AND `edit_anouncements`.

console.log(permissions.getFlags());

console.log(true, permissions.has("edit_announcements")); // true

permissions.remove("create_announcements"); // The user now has no permissions.

console.log(false, permissions.has("edit_announcements")); // false

/* Now let's try that again, but this time explicitly setting `edit_announcements`. */

permissions.add("create_announcements"); // The user now has `create_announcements` and `edit_anouncements`.
permissions.add("edit_announcements"); // The user *still* has `create_announcements` and `edit_anouncements`.

console.log(permissions.getValue());
console.log(permissions.getOriginalValue());

permissions.remove("create_announcements");

console.log(true, permissions.has("edit_announcements")); // true - Because we set `edit_announcements` explicitly, it wasn't unset along with `create_announcements`. Magic!

console.log(permissions.getValue());
console.log(permissions.getOriginalValue());
