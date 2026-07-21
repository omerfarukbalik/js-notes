# Section 9 — Data Structures, Modern Operators and Strings

Mostly ES6+ syntax. None of it does anything i couldn't do before — it just does it in far less code. This is the section that makes your JS start looking modern.

---

## Destructuring Arrays

**In my words:** Unpack values from an array into separate variables in one line.

```js
const arr = [2, 3, 4];

// old way
const a = arr[0];
const b = arr[1];
const c = arr[2];

// destructuring
const [x, y, z] = arr;
```

**The original array is not modified.** You're only reading out of it.

### Skipping Elements

Leave a hole with an extra comma:

```js
const [main, , secondary] = restaurant.categories;   // takes 1st and 3rd
```

### Swapping Variables

```js
let [main, secondary] = ['Italian', 'Pizzeria'];

[main, secondary] = [secondary, main];   // swapped, no temp variable
```

**Why it matters:** Without destructuring this needs a third temporary variable. This is the classic "clean code" example.

### Nested Destructuring

```js
const nested = [2, 4, [5, 6]];

const [i, , [j, k]] = nested;   // i=2, j=5, k=6
```

### Default Values

Useful when you don't know the array length — like data from an API.

```js
const [p = 1, q = 1, r = 1] = [8, 9];
// p=8, q=9, r=1  ← r falls back to the default
```

**Without a default, a missing element gives you `undefined`.**

---

## Destructuring Objects

Same idea, but with `{ }` and **property names instead of position**.

```js
const restaurant = {
  name: 'Classico Italiano',
  openingHours: { /* ... */ },
  categories: ['Italian', 'Pizzeria'],
};

const { name, openingHours, categories } = restaurant;
```

**Gotcha:** The variable names must **exactly match** the property names. Order doesn't matter (unlike arrays), but spelling does.

### Renaming

```js
const {
  name: restaurantName,
  openingHours: hours,
  categories: tags,
} = restaurant;
```

**Why it matters:** This is heavily used with **API calls** — the API decides the property names, and they're often not what you want in your code.

### Default Values

```js
const { menu = [], starterMenu: starters = [] } = restaurant;
// menu doesn't exist on restaurant → falls back to []
```

**Why it matters:** Defaulting a missing array to `[]` instead of `undefined` means you can safely call `.length` or loop it without crashing.

### Mutating Variables While Destructuring

**Gotcha:** If the variables already exist, you must wrap the whole thing in parentheses — otherwise JS reads the `{` as the start of a code block.

```js
let a = 111;
let b = 999;
const obj = { a: 23, b: 7, c: 14 };

{ a, b } = obj;      // ❌ SyntaxError — JS thinks { is a block
({ a, b } = obj);    // ✅ works
```

---

## The Spread Operator `...`

**In my words:** Takes an iterable and unpacks all its elements into individual values.

```js
const arr = [7, 8, 9];
const newArr = [1, 2, ...arr];   // [1, 2, 7, 8, 9]

console.log(...newArr);          // logs: 1 2 7 8 9 (individual values)
```

### What It's Used For

**1. Building a new array from an existing one**
```js
const newMenu = [...restaurant.mainMenu, 'Gnocchi'];
```

**2. Shallow copying an array**
```js
const mainMenuCopy = [...restaurant.mainMenu];
```

**3. Merging two arrays**
```js
const menu = [...restaurant.starterMenu, ...restaurant.mainMenu];
```

**4. Passing arguments to a function**
```js
const ingredients = ['mushrooms', 'asparagus', 'cheese'];
restaurant.orderPasta(...ingredients);

// instead of the old, ugly:
restaurant.orderPasta(ingredients[0], ingredients[1], ingredients[2]);
```

### What Is Iterable?

**Iterables:** arrays, strings, maps, sets.
**Not iterable:** objects.

**Gotcha:** Objects are **not** iterable — but since ES2018, spread still works on them anyway (it's a special case, not iteration).

```js
const newRestaurant = { ...restaurant, founder: 'Giuseppe' };   // ✅ works
const restaurantCopy = { ...restaurant };                       // shallow copy
```

**Remember from Section 8:** this is a **shallow** copy. Nested objects and arrays are still shared by reference.

---

## The Rest Pattern `...`

Same `...` symbol, **opposite job**. The position tells you which one it is:

| Position | It is | What it does |
|---|---|---|
| **Right** side of `=` | **Spread** | Unpacks an array into elements |
| **Left** side of `=` | **Rest** | Packs remaining elements into an array |

```js
// SPREAD — right side, unpacking
const arr = [1, 2, ...[3, 4]];

// REST — left side, packing
const [a, b, ...others] = [1, 2, 3, 4, 5];
// a=1, b=2, others=[3, 4, 5]
```

**Gotcha:** The rest element must be **last**. There can only be **one** rest element.

```js
const [a, ...others, b] = [1, 2, 3];   // ❌ SyntaxError
```

### Rest in Objects

```js
const { sat, ...weekdays } = restaurant.openingHours;
// sat = Saturday's hours, weekdays = everything else as an object
```

### Rest Parameters in Functions

Collects an unknown number of arguments into a real array.

```js
const add = function (...numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) sum += numbers[i];
  return sum;
};

add(2, 3);              // 5
add(5, 3, 7, 2);        // 17
add(8, 2, 5, 3, 2, 1);  // 21
```

**Why it matters:** `numbers` behaves like a normal array — you can loop it, `push` to it, everything. This is the modern replacement for the old `arguments` object.

---

## Short-Circuiting with `||` and `&&`

**In my words:** Logical operators don't only work with booleans, and they don't only return booleans. They can take **any data type**, return **any data type**, and they **short-circuit** — meaning if the first value already decides the answer, the second is never evaluated.

### `||` — returns the **first truthy** value

```js
3 || 'Jonas';        // 3
'' || 'Jonas';       // 'Jonas'  ('' is falsy, so it moves on)
undefined || null;   // null     (both falsy → returns the LAST one)
```

**Common use — setting a default:**

```js
const guests = restaurant.numGuests || 10;
// if numGuests doesn't exist (undefined), use 10
```

**Gotcha — this is a real bug source:** `0` is falsy. If `numGuests` is genuinely `0`, `||` skips it and wrongly gives you `10`.

```js
restaurant.numGuests = 0;
const guests = restaurant.numGuests || 10;   // 10 ← WRONG, should be 0
```

### `&&` — returns the **first falsy** value

```js
0 && 'Jonas';           // 0
'Hello' && 23 && null;  // null
```

**Common use — running something only if it exists:**

```js
// old way
if (restaurant.orderPizza) {
  restaurant.orderPizza('mushrooms', 'spinach');
}

// short-circuit way
restaurant.orderPizza && restaurant.orderPizza('mushrooms', 'spinach');
```

If `orderPizza` doesn't exist, `&&` short-circuits and the call never runs.

---

## The Nullish Coalescing Operator `??`

Fixes the `0` bug above.

**`??` only short-circuits on `null` and `undefined`** — **not** on `0` or `''`.

```js
restaurant.numGuests = 0;

const guests1 = restaurant.numGuests || 10;   // 10  ← wrong
const guests2 = restaurant.numGuests ?? 10;   // 0   ← correct
```

**Rule:** Use `??` for defaults, not `||`, unless you specifically want falsy values to trigger the fallback.

**Why it matters:** "Nullish" is a distinct idea from "falsy." Nullish = `null` or `undefined` (genuinely absent). Falsy also includes `0`, `''`, `NaN` — which are real, meaningful values you usually don't want to overwrite.

---

## Logical Assignment Operators

Shorthand for the common "assign if..." patterns.

```js
rest.numGuests ||= 10;    // assign 10 if numGuests is FALSY
rest.numGuests ??= 10;    // assign 10 if numGuests is NULLISH  ← safer
rest.owner &&= 'ANONYMOUS';  // assign only if owner is TRUTHY
```

`&&=` is the useful one for "only overwrite if it already exists" — if `owner` doesn't exist, nothing is added.

---

## The `for...of` Loop

**In my words:** Loops over an iterable and gives you the **element itself** — no counter, no `arr[i]`.

```js
const menu = [...restaurant.starterMenu, ...restaurant.mainMenu];

for (const item of menu) {
  console.log(item);   // the element, not the index
}
```

**Why it matters:** Compare to the classic `for` loop — no `let i = 0`, no `i < arr.length`, no off-by-one risk. `continue` and `break` still work.

### Getting the Index Too

`.entries()` gives you `[index, element]` pairs, which you destructure right in the loop head:

```js
for (const [i, el] of menu.entries()) {
  console.log(`${i + 1}: ${el}`);
}
```

**`i + 1`** because arrays are zero-indexed but menu items should read as 1, 2, 3.

---

## Optional Chaining `?.`

**In my words:** Only continue reading the chain if what's before the `?.` actually exists. If it's `null` or `undefined`, stop and return `undefined` instead of throwing.

```js
// old way — nested existence checks
if (restaurant.openingHours && restaurant.openingHours.mon) {
  console.log(restaurant.openingHours.mon.open);
}

// optional chaining
console.log(restaurant.openingHours.mon?.open);        // undefined if mon doesn't exist
console.log(restaurant.openingHours?.mon?.open);       // safe even if openingHours is missing
```

**Gotcha:** `?.` checks for **nullish** (`null` / `undefined`), not falsy. A property with value `0` or `''` still continues the chain.

### Combining with `??`

The natural pairing — `?.` gives `undefined` when something's missing, `??` supplies the fallback:

```js
console.log(restaurant.openingHours.mon?.open ?? 'closed');
```

### On Methods

```js
console.log(restaurant.order?.(0, 1) ?? 'Method does not exist');
```

The `?.()` runs the method **only if it exists**. Without it, calling a missing method throws a TypeError.

### On Arrays

```js
const users = [];
console.log(users[0]?.name ?? 'Array is empty');
```

Cleaner than `users.length > 0 ? users[0].name : 'Array is empty'`.

---

## Looping Over Objects

Objects aren't iterable, so `for...of` doesn't work directly. Convert to an array first.

| Method | Returns |
|---|---|
| `Object.keys(obj)` | array of property **names** |
| `Object.values(obj)` | array of property **values** |
| `Object.entries(obj)` | array of `[key, value]` pairs |

```js
// keys
for (const day of Object.keys(openingHours)) {
  console.log(day);          // thu, fri, sat
}

// values
const values = Object.values(openingHours);

// entries — both at once, destructured in the loop head
for (const [key, value] of Object.entries(openingHours)) {
  console.log(`${key}: ${value.open}`);
}
```

**`Object.entries` is the one you'll reach for most** — it's the object equivalent of `array.entries()`.

---

## Sets

**In my words:** A collection of **unique** values. Duplicates are impossible — adding one that's already there does nothing.

```js
const orderSet = new Set(['x', 'x', 'y', 'z', 'z', 'y']);
console.log(orderSet);        // Set(3) { 'x', 'y', 'z' }
```

- Sets are **iterable** (so `for...of` and spread work).
- **Order is irrelevant** — there are no indexes.
- Any iterable can be passed in, including a **string**:

```js
console.log(new Set('jonas'));   // Set(4) { 'j', 'o', 'n', 'a', 's' }
```

### Set Methods

| Method | Does |
|---|---|
| `.size` | number of elements (a **property**, not `.length`) |
| `.has('x')` | `true` / `false` — equivalent of `includes` |
| `.add('t')` | adds an element |
| `.delete('t')` | removes an element |
| `.clear()` | removes everything |

**Gotcha:** **There is no way to read a value out of a set by index.** `orderSet[0]` is `undefined`. If you need indexed access, you wanted an array. In a set, all you can meaningfully ask is *whether* something is in it.

### The Main Use Case — Removing Duplicates

```js
const staff = ['Waiter', 'Chef', 'Waiter', 'Manager', 'Chef', 'Waiter'];

const staffUnique = [...new Set(staff)];   // ['Waiter', 'Chef', 'Manager']
```

**Why it matters:** This is the idiomatic one-liner for deduplicating an array. `new Set()` strips the duplicates, the spread turns it back into a real array (so you get `.map()`, `.filter()`, etc. again).

Counting unique values without converting back:

```js
new Set(staff).size;                        // 3
new Set('omerfarukbalik').size;             // number of distinct letters
```

### Set Operations (ES2024)

Four methods for comparing two sets. **None of them mutate** — each returns a **new** Set.

```js
const italianFoods = new Set(['pasta', 'gnocchi', 'tomatoes', 'garlic']);
const mexicanFoods = new Set(['tortillas', 'beans', 'rice', 'tomatoes', 'garlic']);
```

| Method | Returns |
|---|---|
| `.intersection(other)` | items in **both** |
| `.union(other)` | **all** items, duplicates removed |
| `.difference(other)` | items in the first but **not** the second |
| `.symmetricDifference(other)` | items in **either but not both** (everything except the overlap) |

```js
italianFoods.intersection(mexicanFoods);         // Set { 'tomatoes', 'garlic' }
italianFoods.union(mexicanFoods);                // all, no duplicates
italianFoods.difference(mexicanFoods);           // Set { 'pasta', 'gnocchi' }
italianFoods.symmetricDifference(mexicanFoods);  // everything NOT in the overlap
```

There are also three that return a **boolean**: `.isSubsetOf()`, `.isSupersetOf()`, `.isDisjointFrom()`.

**Support:** These landed as Baseline in June 2024 — all major browsers, and Node.js 22+. Safe to use, but worth knowing they're recent if you're targeting an old environment.

---

## Maps

**In my words:** Like an object — key/value pairs — but the **key can be any data type**. In an object, keys are always strings.

```js
const rest = new Map();

rest.set('name', 'Classico Italiano');
rest.set(1, 'Firenze, Italy');       // ← number as a key
rest.set(2, 'Lisbon, Portugal');
```

**`.set()` returns the map**, so you can **chain** calls:

```js
rest
  .set('categories', ['Italian', 'Pizzeria'])
  .set('open', 11)
  .set('close', 23)
  .set(true, 'We are open')          // ← boolean as a key
  .set(false, 'We are closed');
```

### Map Methods

| Method | Does |
|---|---|
| `.get(key)` | reads the value |
| `.set(key, value)` | writes; **returns the map** (chainable) |
| `.has(key)` | `true` / `false` |
| `.delete(key)` | removes a key |
| `.size` | number of entries |
| `.clear()` | removes everything |

```js
rest.get('name');          // 'Classico Italiano'
rest.has('categories');    // true
rest.delete(2);
rest.size;
```

### Converting an Object to a Map

`Object.entries()` produces exactly the `[key, value]` array structure `new Map()` wants:

```js
const hoursMap = new Map(Object.entries(openingHours));
```

### Looping a Map

Maps are iterable and each entry is already a `[key, value]` pair:

```js
for (const [key, value] of question) {
  if (typeof key === 'number') console.log(`Answer ${key}: ${value}`);
}
```

### Converting a Map Back to an Array

```js
console.log([...question]);            // array of [key, value] pairs
console.log([...question.keys()]);     // just the keys
console.log([...question.values()]);   // just the values
```

### Map vs Object — When to Use Which

| Use a **Map** when | Use an **Object** when |
|---|---|
| keys aren't strings | you need methods (`this` works on objects, not maps) |
| you need easy iteration | you're working with JSON |
| you add/remove keys a lot | you want `obj.property` dot access |
| you need `.size` | |

---

## Strings

### Reading

```js
const airline = 'TAP Air Portugal';

airline.length;              // 16
airline[0];                  // 'T'
airline.indexOf('r');        // first occurrence
airline.lastIndexOf('r');    // last occurrence
airline.slice(4, 7);         // 'Air'  — start inclusive, end exclusive
```

`.slice(start, end)` extracts a substring. Negative numbers count from the end: `airline.slice(-8)`.

### Why String Methods Work at All

**In my words:** Strings are **primitives** — they have no methods. When you call a method on a string, JS temporarily converts it to a String **object**, runs the method, then converts the result back to a primitive. This is called **boxing**.

**Why it matters:** It explains the next gotcha.

**Gotcha:** **Strings are immutable.** No string method changes the original — they all return a **new** string. If you don't assign the result, nothing happens.

```js
let str = '  hello  ';
str.trim();              // ❌ result thrown away, str unchanged
str = str.trim();        // ✅
```

### Common Methods

| Method | Does |
|---|---|
| `.toUpperCase()` / `.toLowerCase()` | change case |
| `.trim()` | remove leading/trailing whitespace |
| `.replace('old', 'new')` | replace the **first** occurrence |
| `.replaceAll('old', 'new')` | replace **all** occurrences |
| `.includes('x')` | → boolean |
| `.startsWith('x')` / `.endsWith('x')` | → boolean |
| `.split(' ')` | string → array |
| `.join('-')` | array → string |
| `.padStart(n, '*')` / `.padEnd(n, '*')` | pad to a target length |
| `.repeat(n)` | repeat the string n times |

**Gotcha:** `.replace()` only replaces the **first** match. To replace all, either use `.replaceAll()` or a regex with the global flag — both give the same result:

```js
str.replaceAll('remove', 'add');
str.replace(/remove/g, 'add');     // same outcome
```

### Chaining

Since every method returns a new string, you can chain them:

```js
const fixed = '  Ömer FARUK  '.trim().toLowerCase();
```
