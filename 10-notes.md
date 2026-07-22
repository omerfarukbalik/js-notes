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
