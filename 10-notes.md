# Section 10 — A Closer Look at Functions

---

## Default Parameters

Set a fallback value directly in the function definition.

```js
const createBooking = function (flightNum, numPassengers = 1, price = 199) {
  console.log(flightNum, numPassengers, price);
};

createBooking('LH123');            // LH123 1 199
createBooking('LH123', 2, 800);    // LH123 2 800
```

Defaults can be **expressions**, and can use **earlier parameters**:

```js
const createBooking = function (flightNum, numPassengers = 1, price = 199 * numPassengers) {
  // price defaults based on how many passengers
};
```

**Gotcha:** Order matters — a default can only reference parameters defined **before** it, not after.

### Skipping a Middle Parameter

You can't leave a gap. Pass `undefined` explicitly to fall through to the default:

```js
createBooking('LH123', undefined, 1000);   // numPassengers falls back to 1
```

Passing `undefined` is exactly the same as not passing the argument at all.

---

## How Arguments Are Passed: Value vs Reference

**In my words:** JavaScript is **always pass-by-value**. There is no pass-by-reference. But for objects, the *value* being passed **is a reference** — so it behaves in a way that looks like pass-by-reference and confuses everyone.

```js
const flight = 'LH234';
const omer = { name: 'Ömer Balık', passport: 12345 };

const checkIn = function (flightNum, passenger) {
  flightNum = 'LH999';               // reassigning a primitive
  passenger.name = 'Mr. ' + passenger.name;   // mutating an object
};

checkIn(flight, omer);

console.log(flight);   // 'LH234'  ← UNCHANGED
console.log(omer);     // { name: 'Mr. Ömer Balık', ... }  ← CHANGED
```

**What actually happened:**

- `flightNum` received a **copy of the value** `'LH234'`. Reassigning it only changed the copy.
- `passenger` received a **copy of the reference** to the same object in the heap. Both point at the same object — so mutating through one is visible through the other.

**The distinction that matters:**

| Inside the function | Effect outside |
|---|---|
| **Mutating** an object's property (`passenger.name = ...`) | ✅ visible outside — same object |
| **Reassigning** the parameter (`passenger = {...}`) | ❌ not visible — only the local copy of the reference changed |

**Why it matters:** This is a real source of bugs on teams. Two functions can manipulate the same object without knowing about each other. When it matters, pass a copy in rather than the original.

**Connects to Section 8:** primitives live in the call stack, objects live in the heap and are accessed by reference. This is the same fact seen from the function-argument angle.

---

## First-Class vs Higher-Order Functions

These get used interchangeably. They're not the same thing.

### First-Class Functions

**A feature of the language.** JS treats functions as **values** — "just another type of object." Because they're values, you can:

- store them in variables and object properties
- pass them as arguments
- return them from other functions
- call methods on them

There's no such thing as "a first-class function." It's a property JavaScript *has*.

### Higher-Order Functions

**A concrete function** that does one of these:

1. **receives** another function as an argument, or
2. **returns** a new function, or
3. both

```js
// 1. receives a function — the callback
document.body.addEventListener('click', greet);

// arr.map(fn), arr.filter(fn), arr.sort(fn) — all higher-order

// 2. returns a function
function greet(greeting) {
  return function (name) {
    console.log(`${greeting} ${name}`);
  };
}

greet('Hello')('Ömer');   // 'Hello Ömer'
```

**The relationship:** higher-order functions are only *possible* because JS has first-class functions. First-class is the language feature; higher-order is what you build with it.

**Where you've already used it:** `addEventListener` is a higher-order function — the handler you pass in is a **callback function**.

### Why Callbacks Matter

- They let you split code into small, reusable pieces.
- They allow **abstraction** — the higher-order function doesn't care *how* the callback does its job, only that it does one. `map` doesn't know or care what transformation you're applying.

---

## Functions Returning Functions (Closures Preview)

```js
const greet = function (greeting) {
  return function (name) {
    console.log(`${greeting} ${name}`);
  };
};

const greeterHey = greet('Hey');
greeterHey('Ömer');     // 'Hey Ömer'
greeterHey('Steven');   // 'Hey Steven'

// or call both at once
greet('Hello')('Jonas');   // 'Hello Jonas'
```

**In my words:** `greet` returns a function. The returned function still remembers `greeting` even though `greet` has already finished running. That "remembering" is a **closure** (full section later).

Same thing as an arrow function — much terser, but harder to read at first:

```js
const greet = greeting => name => console.log(`${greeting} ${name}`);
```

---

## `this` Problem: Losing the Binding

`this` depends on **how a function is called**, not where it's written. So a method can lose its object if you copy it or pass it around.

```js
const lufthansa = {
  airline: 'Lufthansa',
  planes: 300,
  bookings: [],
  book(flightNum, name) {
    this.bookings.push({ flight: flightNum, name });
  },
};

const book = lufthansa.book;   // pulled the method OUT of the object

book(23, 'Ömer');   // ❌ TypeError — `this` is now undefined
```

`this` is `undefined` because `book()` was called as a plain function, not as `lufthansa.book()`. The three methods below fix this by letting you **set `this` manually**.

---

## `call`, `apply`, `bind`

All three exist to **manually set what `this` points to**. Functions are objects, so they have these methods.

### `call` — set `this`, pass args normally

```js
book.call(lufthansa, 23, 'Ömer Balık');
//         ↑ this    ↑ the normal arguments

const eurowings = { airline: 'Eurowings', planes: 100, bookings: [] };
book.call(eurowings, 583, 'Mary Cooper');   // reuse the SAME function on a different object
```

First argument = whatever you want `this` to be. The rest = the normal arguments.

### `apply` — same as call, but args come in an array

```js
const flightData = [583, 'George Cooper'];
book.apply(eurowings, flightData);
```

**`apply` is rarely used in modern JS.** The spread operator does the same thing with `call` and reads better:

```js
book.call(eurowings, ...flightData);   // preferred over apply
```

### `bind` — returns a NEW function with `this` locked in

`call` and `apply` **call** the function immediately. `bind` **doesn't call** it — it returns a new copy with `this` permanently set, to call later.

```js
const bookEW = book.bind(eurowings);   // does NOT run — returns a bound copy

bookEW(23, 'Steven Williams');   // now `this` is always eurowings
```

**Why it matters:** `bind` is the common, modern one. `call`/`apply` run once; `bind` gives you a reusable function with `this` fixed.

### Partial Application with `bind`

You can preset **arguments**, not just `this`, by passing them into `bind`. They become fixed defaults.

```js
const addTax = (rate, value) => value + value * rate;

// preset `this` to null (unused here), and preset rate to 0.23
const addVAT = addTax.bind(null, 0.23);
// addVAT is now: value => value + value * 0.23

addVAT(100);   // 123
addVAT(200);   // 246
```

**In my words:** `bind` locks in the earlier arguments, leaving the rest to fill in later. The `null` is just a placeholder for `this` since this function doesn't use it.

### `bind` with Event Listeners

**Gotcha:** In an event handler, `this` points to the **DOM element**, not your object. `bind` fixes it.

```js
lufthansa.buyPlane = function () {
  this.planes++;
  console.log(this.planes);
};

// ❌ without bind: `this` is the button element, this.planes is NaN
document.querySelector('.buy').addEventListener('click', lufthansa.buyPlane);

// ✅ with bind: `this` is forced to lufthansa
document.querySelector('.buy').addEventListener('click', lufthansa.buyPlane.bind(lufthansa));
```

We use `bind`, not `call`, because `addEventListener` needs a **function to call later** — not the result of calling it now.

---

## `setTimeout`

Runs a function **once**, after a delay. It does **not** pause your code — it schedules the callback and moves on (this is the event loop from Section 8).

```js
setTimeout(function () {
  console.log('Here is your pizza 🍕');
}, 3000);   // fires once, after 3000ms (3 seconds)

console.log('Ordering...');   // runs FIRST, immediately
```

**Gotcha:** The order is not top-to-bottom. `'Ordering...'` logs first because `setTimeout` is asynchronous — the callback is deferred, and the rest of the script keeps running.

- **Second argument is milliseconds** (`20` = 0.02 seconds, `2000` = 2 seconds).
- The callback will be invoked later — "immediately invoked" is wrong; it's *deferred*.
- Any arguments after the delay are passed into the callback:

```js
setTimeout((ing1, ing2) => console.log(`Pizza with ${ing1} and ${ing2}`),
  3000, 'olives', 'spinach');
```
