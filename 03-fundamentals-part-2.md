# Section 3 — JavaScript Fundamentals, Part 2

## Functions

**In my words:** A reusable block of code. Write it once, call it as many times as you want.

**Why it matters:** **DRY — Don't Repeat Yourself.** If you're copy-pasting logic, that logic should be a function. Every bug fix then only has to happen in one place.

### Parameters vs Arguments

- **Parameters** = the placeholders in the definition (the *prototype*)
- **Arguments** = the actual values you pass in when calling

```js
function greet(name, age) {   // name, age → PARAMETERS
  console.log(`Hi ${name}, you are ${age}`);
}

greet("Ömer", 25);            // "Ömer", 25 → ARGUMENTS
```

---

## The Three Ways to Write a Function

### 1. Function Declaration

```js
function calcAge(birthYear) {
  return 2037 - birthYear;
}
```

**Key trait:** It's **hoisted** — you can call it *before* it's defined in the file.

```js
console.log(calcAge(1991));   // ✅ works, even though it's defined below

function calcAge(birthYear) {
  return 2037 - birthYear;
}
```

### 2. Function Expression

```js
const calcAge = function (birthYear) {
  return 2037 - birthYear;
};
```

Here the function is a **value** stored in a variable. **Not hoisted** — calling it before this line throws an error.

### 3. Arrow Function

An easier, shorter way to write a function expression.

```js
// one line → implicit return, no braces needed
const calcAge = birthYear => 2037 - birthYear;

// more than one line → open { } and use an explicit return
const yearsUntilRetirement = (birthYear, firstName) => {
  const age = 2037 - birthYear;
  const retirement = 65 - age;
  return `${firstName} retires in ${retirement} years`;
};
```

**Gotcha:** Arrow functions do **not** have their own `this` keyword. That matters a lot later in OOP and in event handlers — a regular function gets its own `this`, an arrow function inherits it from the surrounding scope.

---

## Arrays

Two ways to create one:

```js
const friends = ['Michael', 'Steven', 'Peter'];        // literal — use this
const years = new Array(1991, 1984, 2008, 2020);       // constructor — rare
```

### Reading and Length

```js
friends[0];        // 'Michael' — zero-indexed
friends.length;    // 3 — the NUMBER of elements, not the last index
friends[friends.length - 1];   // 'Peter' — last element
```

You can put any **expression** inside the brackets:

```js
console.log(friends[friends.length - 1]);
```

**Gotcha:** `const` arrays are still mutable. You can `push`, `pop`, and change elements — you just can't reassign the whole variable. Only *primitive* values are truly immutable in `const`.

---

## Array Methods

| Method | What it does | What it returns |
|---|---|---|
| `push('Jay')` | Adds to the **end** | New **length** of the array |
| `unshift('John')` | Adds to the **beginning** | New **length** of the array |
| `pop()` | Removes the **last** element | The **removed element** |
| `shift()` | Removes the **first** element | The **removed element** |
| `indexOf('Steven')` | Finds position of an element | The **index**, or `-1` if not found |
| `includes('Steven')` | Checks if element exists | `true` / `false` |

```js
const friends = ['Michael', 'Steven', 'Peter'];

friends.push('Jay');         // → 4        friends: [Michael, Steven, Peter, Jay]
friends.unshift('John');     // → 5        friends: [John, Michael, Steven, Peter, Jay]

const popped = friends.pop();    // → 'Jay'
const shifted = friends.shift(); // → 'John'
```

**Memory trick:** *add* methods return the **length**, *remove* methods return the **element**.

**Gotcha:** `includes()` uses **strict equality (`===`)**. So `[23].includes('23')` is `false` — the string `'23'` is not the number `23`.

---

## Objects

Arrays are for **ordered** data. Objects are for **named** data — when you care what each value *means*, not what position it's in.

```js
const jonas = {
  firstName: 'Jonas',      // ← key: value pair = PROPERTY
  lastName: 'Schmedtmann',
  age: 23,
  friends: ['Michael', 'Peter', 'Steven'],
};
```

### Reading Properties — Two Notations

```js
// dot notation — clean, use when you know the key
console.log(jonas.lastName);

// bracket notation — use when the key is computed
console.log(jonas['lastName']);
```

**Why bracket notation exists:** you can put any **expression** inside the brackets. Dot notation can't do this.

```js
const nameKey = 'Name';
console.log(jonas['first' + nameKey]);   // 'Jonas'  ← builds the key at runtime
console.log(jonas.first + nameKey);      // ❌ doesn't work
```

**Gotcha:** Reading a property that doesn't exist returns `undefined` — **not** an error.

```js
console.log(jonas.twitter);   // undefined
```

### Adding Properties

Both notations work for writing, too:

```js
jonas.location = 'Türkiye';
jonas['twitter'] = '@omerfarukbalik';
```
