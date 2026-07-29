# Section 11 — Working With Arrays

**The most important section for real frontend work.** `map`, `filter`, and `reduce` are what you'll actually reach for every day — in React, in data transformation, everywhere. This is the section to know cold.

---

## Simple Methods

### `slice` — copy a portion (does NOT mutate)

Returns a **new** array; the original is untouched.

```js
const arr = ['a', 'b', 'c', 'd', 'e'];

arr.slice(2);        // ['c', 'd', 'e']  — begin to end
arr.slice(2, 4);     // ['c', 'd']       — begin (incl) to end (excl)
arr.slice(-2);       // ['d', 'e']       — last 2 elements
arr.slice(-1);       // ['e']            — last element
arr.slice(1, -2);    // ['b', 'c']       — from index 1, stop 2 from the end
arr.slice();         // shallow copy of the whole array
[...arr];            // same shallow copy, spread version
```

### `splice` — remove/insert (MUTATES)

Works almost like slice, but **changes the original array** and returns the removed elements.

```js
const arr = ['a', 'b', 'c', 'd', 'e'];

arr.splice(1, 2);    // removes 2 elements starting at index 1
//         ↑ start ↑ deleteCount
// arr is now ['a', 'd', 'e']  — MUTATED
```

**Gotcha:** the second argument is a **count**, not an end index. This is the big difference from `slice`, where the second arg is an end index.

Common use — remove the last element: `arr.splice(-1)`.

### `reverse` — (MUTATES)

```js
const arr = ['a', 'b', 'c'];
arr.reverse();   // ['c', 'b', 'a'] — and arr itself is now reversed
```

### `concat` — join two arrays (does NOT mutate)

```js
const merged = arr1.concat(arr2);
const merged2 = [...arr1, ...arr2];   // same thing, spread version
```

### `join` — array → string

```js
['a', 'b', 'c'].join(' - ');   // 'a - b - c'
```

### `at` — modern element access

```js
const arr = [23, 11, 64];

arr.at(0);    // 23  — same as arr[0]
arr[0];       // 23

arr.at(-1);   // 64  — LAST element, clean
arr[arr.length - 1];   // 64 — old, clunky way
arr.slice(-1)[0];      // 64 — another old way
```

**Why it matters:** `at(-1)` for the last element is far cleaner than `arr[arr.length - 1]`. Also works on **strings**: `'ömer'.at(-1)`.

---

## `forEach` — loop with a callback

**In my words:** Loops over an array and runs a function for each element. It's a higher-order function — you hand it a callback, it calls that callback once per element.

```js
movements.forEach(function (mov, i, arr) {
  console.log(`Movement ${i + 1}: ${mov}`);
});
```

The callback receives **three arguments, in this exact order**:

| Position | Name | Is |
|---|---|---|
| 1st | `mov` | current **element** |
| 2nd | `i` | current **index** |
| 3rd | `arr` | the **whole array** |

**Gotcha:** The order is element-first. In a `for...of` with `.entries()` it's `[index, element]` — the *opposite* order. Easy to mix up.

### `forEach` vs `for...of`

| | `forEach` | `for...of` |
|---|---|---|
| `continue` / `break` | ❌ can't use them | ✅ works |
| skip / stop early | impossible | possible |

**Gotcha:** You **cannot** `break` out of a `forEach`. It always runs over the entire array. If you need to stop early, use `for...of`.

### `forEach` on Maps and Sets

**Maps** — callback gets `(value, key, map)`:

```js
currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
});
```

**Sets** — there are no keys, so the key parameter is just the value again:

```js
currenciesUnique.forEach(function (value, _, set) {
  console.log(`${value}: ${value}`);   // key === value in a set
});
```

**In my words:** Sets have no keys or indexes, so the 2nd parameter is set to the value as well. It's a throwaway — convention is to name it `_` to signal "I'm not using this."

---

## The Big Three: `map`, `filter`, `reduce`

These are the core of functional array work. All three **return a new array (or value)** and **do not mutate** the original.

### `map` — transform every element

**In my words:** Loops over the array and builds a **new array** where each element is the result of the callback. Same length, transformed contents.

```js
const movements = [200, 450, -400, 3000];

const movementsUSD = movements.map(mov => mov * 1.1);
// [220, 495, -440, 3300]  — NEW array, original untouched
```

The callback gets the same three arguments as `forEach`: `(element, index, array)`.

```js
const descriptions = movements.map((mov, i) =>
  `Movement ${i + 1}: ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(mov)}`
);
```

**`map` vs `forEach`:** `forEach` runs a side effect (like logging) and returns nothing. `map` **returns a new array**. If you want a transformed array, use `map`. This is *the* method you'll use most in React.

### `filter` — keep only what passes a test

**In my words:** Returns a **new array** containing only the elements for which the callback returns `true`.

```js
const deposits = movements.filter(mov => mov > 0);
// [200, 450, 3000]  — only positives

const withdrawals = movements.filter(mov => mov < 0);
// [-400]
```

The callback is a **test** — return `true` to keep the element, `false` to drop it.

### `reduce` — boil the array down to a single value

**In my words:** Reduces the whole array to **one value** (a sum, a max, an object, anything) by accumulating as it loops.

```js
const balance = movements.reduce(function (acc, cur, i, arr) {
  return acc + cur;
}, 0);
//    ↑ accumulator  ↑ starting value of acc
```

- **`acc`** (accumulator) — the running result, carried from iteration to iteration.
- **`cur`** — the current element.
- **The second argument to `reduce`** (`0` here) is the **initial value** of the accumulator.

```js
// sum
const balance = movements.reduce((acc, cur) => acc + cur, 0);

// maximum value
const max = movements.reduce((acc, cur) => (acc > cur ? acc : cur), movements[0]);
```

**Gotcha:** Always pass the initial value (the `0`). Without it, `reduce` uses the first element as the starting accumulator and begins from index 1 — which breaks things like building an object from scratch.

---

## Chaining Methods

Because `map` and `filter` return arrays, you can chain them into a pipeline. `reduce` usually ends the chain (it returns a single value).

```js
const totalDepositsUSD = movements
  .filter(mov => mov > 0)        // keep deposits
  .map(mov => mov * 1.1)         // convert to USD
  .reduce((acc, mov) => acc + mov, 0);   // sum them
```

**In my words:** filter, then transform, then collapse. This reads top-to-bottom like a description of what you want, which is the whole appeal.

**Gotcha:** You can only chain a method if the previous one **returned an array**. You can't chain anything after `reduce` (it returns a value, not an array). And avoid chaining methods that mutate (like `splice`, `reverse`) mid-pipeline — it's a bad practice that causes hard-to-find bugs.

**Debugging tip:** the 3rd parameter (`arr`) lets you inspect the array at each step: `.map((mov, i, arr) => { console.log(arr); ... })`.

---

## Finding Elements

### `find` — first element that passes a test

Returns the **element itself** (not an array), or `undefined` if none match.

```js
const firstWithdrawal = movements.find(mov => mov < 0);   // -400

const account = accounts.find(acc => acc.owner === 'Jessica Davis');
// returns the whole matching object
```

**`find` vs `filter`:** `filter` returns an **array** of all matches; `find` returns the **first single element**. Use `find` when you expect exactly one result (like looking up by ID).

### `findIndex` — like find, but returns the index

Returns the **index** of the first match, or `-1`. Useful when you then need to `splice` at that position.

```js
const index = accounts.findIndex(acc => acc.username === 'js');
accounts.splice(index, 1);   // delete that account
```

### `findLast` / `findLastIndex` — search from the end

Same as `find` / `findIndex` but start from the **last** element and work backwards. Returns the last element (or its index) satisfying the condition.

```js
movements.findLast(mov => mov > 0);        // last deposit
movements.findLastIndex(mov => mov > 0);   // its index
```

---

## Checking Conditions

### `includes` — tests EQUALITY

```js
movements.includes(-400);   // true — is this exact value present?
```

### `some` — tests a CONDITION (is ANY true?)

```js
movements.some(mov => mov > 0);        // true if AT LEAST ONE passes
movements.some(mov => mov > 5000);     // false if none do
```

**`includes` vs `some`:** `includes` checks for an exact value (equality). `some` checks whether **any** element satisfies a **condition** (a callback). Use `some` when the test is more than "is X in here."

### `every` — is EVERY element true?

```js
movements.every(mov => mov > 0);   // true only if ALL pass
```

---

## Flattening

### `flat` — flatten nested arrays one level

```js
[[1, 2], [3, 4], 5, 6].flat();      // [1, 2, 3, 4, 5, 6]
[[1, [2, 3]], [4, 5]].flat();       // [1, [2, 3], 4, 5]  — only ONE level
[[1, [2, 3]], [4, 5]].flat(2);      // [1, 2, 3, 4, 5]    — depth 2
```

Default depth is 1. Pass a number for deeper nesting.

### `flatMap` — map then flat(1), in one pass

```js
accounts.flatMap(acc => acc.movements);   // map + flatten one level
```

**Gotcha:** `flatMap` only goes **one level** deep and there's no way to change that. If you need deeper, use `map` then `flat(depth)`.

---

## Sorting

### `sort` — (MUTATES)

**Gotcha:** `sort` mutates the original array. And by default it sorts **as strings**, which breaks numbers:

```js
[8, 1, 30, 200].sort();   // [1, 200, 30, 8]  — WRONG, sorted as text
```

Fix numbers with a **compare callback**:

```js
// ascending
movements.sort((a, b) => a - b);   // return < 0 → a first, > 0 → b first

// descending
movements.sort((a, b) => b - a);
```

**In my words:** if the callback returns a negative number, `a` comes first; positive, `b` comes first; `0`, order unchanged. `a - b` gives ascending, `b - a` descending.

**Since 2023 there's `toSorted`** — a non-mutating version that returns a new sorted array, leaving the original alone. Prefer it when you don't want to mutate: `movements.toSorted((a, b) => a - b)`.

---

## `fill` and `Array.from`

### `Array.from` — build an array programmatically

```js
Array.from({ length: 7 }, () => 1);            // [1,1,1,1,1,1,1]
Array.from({ length: 7 }, (_, i) => i + 1);    // [1,2,3,4,5,6,7]
```

The second argument is a **map callback**, so you can generate values.

**Its other big use — converting array-like things to real arrays**, like a NodeList (see Section 7):

```js
const nums = Array.from(document.querySelectorAll('.movements__value'),
  el => Number(el.textContent));
```

### `fill` — (MUTATES)

```js
const arr = [1, 2, 3, 4, 5];
arr.fill(0);          // [0,0,0,0,0]
arr.fill(9, 2, 4);    // fills 9 from index 2 to 4 (excl)
```

---

## Mutating vs Non-Mutating — the summary that matters

| Mutates original | Returns new (safe) |
|---|---|
| `push`, `pop`, `shift`, `unshift` | `slice` |
| `splice` | `concat`, `map`, `filter`, `reduce` |
| `reverse` | `flat`, `flatMap` |
| `sort` | `toSorted`, `toReversed`, `toSpliced` |
| `fill` | `with` |

**In my words:** Mutating the original data is generally a **bad practice**, especially with function parameters — two parts of the code can change the same array without knowing. When in doubt, copy first (`[...arr]` or `.slice()`) and work on the copy. This is the core mindset behind React state and functional programming.

---

## Grouping — `Object.groupBy` (ES2024)

**In my words:** Groups the elements of an array into an object, using the **string** a callback returns as the group name. Each group is an array of the elements that produced that name.

```js
const dogs = [
  { weight: 22, curFood: 250 },
  { weight: 8, curFood: 200 },
  { weight: 32, curFood: 340 },
];

const grouped = Object.groupBy(dogs, dog =>
  dog.weight >= 20 ? 'large' : 'small'
);
// { small: [ {8...} ], large: [ {22...}, {32...} ] }
```

**Why it matters:** Before this, grouping meant a `reduce` with manual "does this key exist yet? if not, make an empty array" boilerplate. `Object.groupBy` replaces all of it with one line.

**Gotchas:**
- The group name is **always coerced to a string**. Grouping by a number or object turns the key into a string — `5` becomes `'5'`. If you need real (non-string) keys, use `Map.groupBy` instead, which returns a Map.
- **Recent:** Baseline since March 2024 (all modern browsers, Node 21+). In some older browsers it briefly existed as `Array.prototype.group()` before being moved to a static method. Fine to use today, worth a polyfill for old targets.

A common pattern is to return a descriptive key so the group names read well:

```js
const byOwnerCount = Object.groupBy(dogs, dog => `${dog.owners.length}-owners`);
// { '1-owners': [...], '2-owners': [...], '3-owners': [...] }
```

---

## Which Array Method to Use? (decision guide)

The single most useful reference in this section. Pick by **what you want back**.

**To MUTATE the original** (usually avoid these):
- add: `push` (end), `unshift` (start)
- remove: `pop` (end), `shift` (start), `splice` (any)
- other: `reverse`, `sort`, `fill`

**A NEW array based on the original** (safe):
- same length, transformed: `map`
- filtered by a condition: `filter`
- a portion of it: `slice`
- one element replaced: `with`
- flattened: `flat`, `flatMap`
- reversed / sorted / spliced without mutating: `toReversed`, `toSorted`, `toSpliced`
- joining two arrays: `concat`

**An array INDEX:**
- by value: `indexOf`
- by a test condition: `findIndex`, `findLastIndex`

**An array ELEMENT:**
- by a test condition: `find`, `findLast`
- by position: `at`

**Know if the array INCLUDES something:**
- by value: `includes`
- by a test condition: `some`, `every`

**A new STRING:** `join` (by separator)

**To a single VALUE** (number, string, boolean, or even a new array/object): `reduce`

**To just LOOP** with no new array: `forEach`

**More tools:**
- group by category → `Object.groupBy`
- new array from scratch → `Array.from`
- new array with n empty slots (pair with `fill`) → `new Array(n)`
- join arrays → `[...arr1, ...arr2]`
- unique values → `[...new Set(arr)]`
- values in both arrays → `[...new Set(arr1).intersection(new Set(arr2))]`

---

## Worked Examples

Four challenges from this section. Two have standalone files alongside this note (`challenge-01-check-dogs.js`, `challenge-02-avg-human-age.js`); all are embedded here for quick reference.

### Challenge 1 — Adult vs Puppy

Split the array (removing the "cats"), merge two datasets, classify each dog.

```js
const checkDogs = function (dogsJulia, dogsKate) {
  const onlyDogsJulia = dogsJulia.slice(1, -2);   // drop first + last two, on a COPY
  const allDogs = [...onlyDogsJulia, ...dogsKate];

  allDogs.forEach(function (dog, i) {
    if (dog >= 3) {
      console.log(`Dog number ${i + 1} is an adult, and is ${dog} years old`);
    } else {
      console.log(`Dog number ${i + 1} is still a puppy 🐶`);
    }
  });
};

checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
checkDogs([9, 16, 6, 8, 3], [10, 5, 6, 1, 4]);
```

**The point:** `slice` (not `splice`) so Julia's original array isn't mutated — the whole reason the brief says "shallow copy." Adult is `>= 3`, not `> 3`.

### Challenge 2 — Average Human Age (map → filter → reduce)

The classic pipeline: transform, keep some, collapse to one value.

```js
const calcAverageHumanAge = function (ages) {
  return ages
    .map(dogAge => (dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4))   // dog → human years
    .filter(humanAge => humanAge >= 18)                            // adults only
    .reduce((acc, humanAge, i, arr) => acc + humanAge / arr.length, 0);  // average
};

console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
console.log(calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]));
```

**The point:** the average is computed *inside* reduce — `acc + value/arr.length` — instead of summing then dividing separately. `arr.length` here is the length **after** filtering, since `arr` is the array reduce receives. This is the chaining pattern you'll use constantly.

### Challenge 4 — Dog Breeds (find, flatMap, Set, some/every, Math.max)

Grab-bag of the whole section on an array of breed objects.

```js
// the only breed that likes BOTH running and fetch
const dogBothActivities = breeds.find(
  dog => dog.activities.includes('running') && dog.activities.includes('fetch')
).breed;

// unique list of every activity across all breeds
const uniqueActivities = [...new Set(breeds.flatMap(dog => dog.activities))];

// heaviest weight among breeds that fetch
const maxFetcher = Math.max(
  ...breeds.filter(dog => dog.activities.includes('fetch')).map(dog => dog.averageWeight)
);
```

**The point:** `flatMap` collapses the per-dog activity arrays into one flat list, then `new Set` dedupes it. For the bonus, `filter → map → Math.max(...)` — the spread turns the array into the individual arguments `Math.max` needs.

**Note:** task 1 (a Husky's weight) is a single lookup — `breeds.find(d => d.breed === 'Husky').averageWeight` — not a `reduce`. Use `find` when you expect one result.

### Challenge 5 — Food Portions (forEach mutation, groupBy, toSorted)

The one that ties Section 11 together — including in-place mutation and grouping.

```js
// 1. add a property to each object WITHOUT building a new array
dogs.forEach(dog => (dog.recFood = Math.floor(dog.weight ** 0.75 * 28)));
//                                              ↑ power, not times

// 8. group by portion in one line
const byPortion = Object.groupBy(dogs, dog =>
  dog.curFood > dog.recFood ? 'too-much'
  : dog.curFood < dog.recFood ? 'too-little'
  : 'exact'
);

// 10. sort by recFood ascending WITHOUT mutating
const dogsSorted = dogs.toSorted((a, b) => a.recFood - b.recFood);
```

**The point:** task 1 is the rare case where you *want* to mutate — the brief says do NOT create a new array, so `forEach` writes `recFood` straight onto each object. Contrast task 10, which explicitly says don't mutate → `toSorted`, not `sort`. Knowing *when* each is appropriate is the actual lesson.

**Formula gotcha:** `recFood` is `weight ** 0.75 * 28` — weight raised to the 0.75 power. Writing `weight * 0.75` (multiply) gives wrong numbers and throws off every status, group, and sort downstream.
