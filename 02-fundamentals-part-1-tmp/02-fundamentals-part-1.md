# Section 2 — JavaScript Fundamentals, Part 1

## What JavaScript Is

**In my words:** A high-level, object-oriented, multi-paradigm programming language. Multi-paradigm means it supports both **imperative** (step-by-step instructions) and **declarative** (describe the result, not the steps) styles.

**Why it matters:** React is declarative — you describe what the UI should look like, not how to build it step by step. That's only possible because JS supports the paradigm.

Not just for browsers: with React Native it compiles to native mobile apps.

---

## Variables

**Naming rules:**
- Use `camelCase` (`firstName`, not `first_name`)
- Cannot start with a number
- Can only contain letters, numbers, `_`, and `$`

```js
let firstName = "Ömer";   // ✅
let 1stName = "Ömer";     // ❌ SyntaxError
```

---

## The 7 Primitive Types

| Type | Notes |
|---|---|
| `Number` | All numbers are floats under the hood — no separate int type |
| `String` | `'single'`, `"double"`, or `` `backtick` `` |
| `Boolean` | `true` / `false` |
| `Undefined` | Declared but no value assigned — `let children;` |
| `Null` | Also "empty," but *intentionally* set by you |
| `Symbol` | Unique, unchangeable value. Rarely used early on — mostly for object keys that can't collide |
| `BigInt` | Integers larger than `Number` can safely hold |

**`undefined` vs `null`:** `undefined` is JS saying "you never gave this a value." `null` is *you* saying "this is intentionally empty."

---

## Dynamic Typing

**In my words:** You never declare the type of a variable. JS figures out the data type automatically from the value you assign, and that type can change at runtime.

```js
let x = 23;      // Number
x = "twenty-three";  // now a String — perfectly legal
```

**Why it matters:** This is exactly the problem TypeScript exists to solve. Understanding what JS *doesn't* enforce makes TS make sense.

---

## `typeof`

Shows the data type of a value.

```js
typeof 23;        // "number"
typeof "hi";      // "string"
typeof true;      // "boolean"
```

**Gotcha:** `typeof null` returns `"object"`.

```js
typeof null;      // "object"  ← WRONG, but it's a famous JS bug
```

This is a bug from the very first version of JavaScript. It was never fixed because too much existing code depends on it. `null` is *not* an object — it's a primitive.

---

## `let`, `const`, `var`

| Keyword | Reassignable? | Scope | Use it? |
|---|---|---|---|
| `let` | Yes | Block | When the value needs to change |
| `const` | No | Block | **Default choice** |
| `var` | Yes | Function | **Never** |

- **Mutate / reassign** = changing a variable's value after declaration.
- `let` allows reassignment. You can declare it empty and fill it later: `let children;`
- `const` does not. You **must** give it a value at declaration.
- `var` is the old pre-ES6 way. It's function-scoped, not block-scoped, which causes bugs.

**Gotcha:** Declaring a variable **without** `let`/`const`/`var` doesn't throw an error — it silently creates a property on the **global object**. This is one of the things `'use strict'` forbids.

```js
lastName = "Balık";  // no keyword → global object property, bad
```

**Note on `const`:** Only *primitive* values are truly immutable. A `const` array or object can still have its contents changed — you just can't reassign the variable itself.

```js
const friends = ["Steven"];
friends.push("Sarah");   // ✅ allowed — mutating contents
friends = ["John"];      // ❌ TypeError — reassigning the variable
```

---

## Operators

- `**` is exponentiation: `2 ** 3` → `8` (2³)
- `+` concatenates strings: `"Hello " + "world"`

**Operator precedence:** Some operators run before others. Instead of memorizing the table, look it up on **MDN** and use **parentheses** to remove ambiguity.

```js
// don't make the reader guess
const result = (a + b) * c;
```

---

## Template Literals

Start and end with **backticks** (`` ` ``) — on a Turkish keyboard, `AltGr` + the backtick key.

```js
const name = "Ömer";
const jonas = `I'm ${name}, and I'm ${2037 - 1991} years old.`;
```

**Why it matters:** Use them always. Two big wins:

1. **Multi-line strings** — just press Enter, no `\n` needed.
2. **Expressions inside `${}`** — but only *expressions*, not *statements*. You can't put an `if` block in there. A ternary works, because a ternary is an expression.

```js
// ✅ ternary is an expression
console.log(`You are ${age >= 18 ? "an adult" : "a minor"}`);
```

---

## Type Conversion vs Type Coercion

| | Who does it | Example |
|---|---|---|
| **Conversion** | You, manually / explicitly | `Number('1991')` → `1991` |
| **Coercion** | JS, automatically / implicitly | `'23' + 1` → `'231'` |

```js
Number('1991');   // '1991' → 1991
String(23);       // 23 → '23'
```

**Coercion rules to remember:**
- The `+` operator converts **numbers to strings**
- The `-`, `*`, `/` operators convert **strings to numbers**

```js
'23' + 1;   // '231'  ← number became a string
'23' - 1;   // 22     ← string became a number
'23' * 2;   // 46
```

**NaN** = *Not a Number*. It's what you get from an invalid number operation. Ironically, `typeof NaN` is `"number"`.

```js
Number('Ömer');   // NaN
```

---

## Truthy and Falsy Values

**5 falsy values:** `0`, `''` (empty string), `undefined`, `null`, `NaN`

Everything else is **truthy** — including things that look empty:

```js
Boolean({});   // true  ← empty object is TRUTHY
Boolean([]);   // true  ← empty array is TRUTHY
Boolean('0');  // true  ← string "0" is TRUTHY
```

**Gotcha:** The empty object being truthy trips people up constantly. If you want to check whether an object has keys, `if (obj)` won't help — it's always true.

---

## Equality Operators

| Operator | Name | Behavior |
|---|---|---|
| `===` | Strict equality | Compares value **and** type. No coercion. |
| `==` | Loose equality | Does **type coercion** first. |
| `!==` | Strict inequality | |
| `!=` | Loose inequality | |

```js
18 === '18';   // false ← different types
18 ==  '18';   // true  ← '18' coerced to 18
```

**Rule: always use `===` and `!==`.** Loose equality has weird, unpredictable coercion rules and is a bug source.

---

## `prompt()`

Opens a browser dialog and returns whatever the user typed — **always as a string**.

```js
const favorite = prompt("What's your favorite number?");
console.log(favorite);        // "23" — a STRING, not a number
console.log(typeof favorite); // "string"
```

**Gotcha:** If you want to compare it to a number, convert it first: `Number(favorite) === 23`.

---

## `if / else`

Curly brackets are technically optional for a single statement, but **use them anyway** — most companies enforce it in their style guide, and skipping them is a known bug source.

```js
// ✅ always
if (age >= 18) {
  console.log("Adult");
}
```

---

## Logical Operators

| Operator | Name |
|---|---|
| `&&` | AND |
| `\|\|` | OR |
| `!` | NOT |

---

## `switch`

**Gotcha:** `switch` compares cases using **strict equality (`===`)**. So `switch(1)` will not match `case '1':`.

---

## Statements vs Expressions

**Expression** → **produces a value**
- A literal value: `3 + 4`, `1991`, `true`
- A function call: `calcAge(1991)`
- A ternary: `age >= 18 ? 'adult' : 'minor'`

**Statement** → **does something, but produces no value**
- An `if/else` block
- A `for` loop
- A variable declaration

**Why it matters:** This is *exactly* why you can put a ternary inside a template literal but not an `if` block. `${}` only accepts expressions, because it needs a value to insert.

---

## The Conditional (Ternary) Operator

```js
age >= 18 ? console.log('x') : console.log('y');
```

It's an **expression**, so it can go inside a template literal:

```js
console.log(`I'd like to drink ${age >= 18 ? 'wine' : 'water'}`);
```

---

## ES6 / ECMAScript 2015

**ECMAScript** is the standard. **JavaScript** is the implementation.

**JS is backward compatible, not forward compatible.**
- **Backward:** old code from 1997 still runs in modern browsers. Nothing is ever removed.
- **Forward:** new syntax does **not** run in old browsers. That's why we transpile (Babel).

---

## `'use strict'`

Put it as the **very first line** of the file.

```js
'use strict';
```

Forbids certain sloppy things (like creating global variables without a keyword) and turns silent failures into visible errors.

**Use it always.** It makes JS tell you about bugs instead of hiding them.
