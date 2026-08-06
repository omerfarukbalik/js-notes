# Section 16 — Asynchronous JavaScript: Promises, Async/Await, AJAX

**The most important section for real apps.** Everything before this was synchronous. Every app that talks to a server — loads data, submits a form, fetches an API — lives here. This is the gate between "can write JS logic" and "can build a data-driven frontend."

---

## Synchronous vs Asynchronous

### Synchronous

**In my words:** Code runs **line by line**, top to bottom. Each line **waits** for the previous one to finish before it runs.

```js
const a = 1;
const b = 2;
alert('Wait!');   // BLOCKS everything — nothing runs until you click OK
const c = 3;       // waits for the alert
```

**Gotcha:** long-running operations **block** execution. While `alert` is open, the whole page is frozen. If a task took 5 seconds synchronously, the page would be unusable for 5 seconds.

### Asynchronous

**In my words:** A task runs in the **background** and the rest of the code keeps going. When the background task finishes, its callback runs. Async code does **not** block.

```js
setTimeout(() => console.log('done'), 5000);   // scheduled, runs in background
console.log('next');                            // runs IMMEDIATELY, doesn't wait
```

**Things that are asynchronous:**
- `setTimeout` — runs its callback only *after* the timer finishes in the background
- the `'load'` event listener (image loading, etc.)
- **AJAX calls** — the big one
- geolocation, `fetch`, and anything with a callback that "finishes later"

**In my words:** async is coordinated with **callbacks** (run this when the background task is done) — but note that *not every callback is async*. `arr.map(cb)` is synchronous. What makes something async is the background task, not the callback itself.

---

## AJAX and APIs

### AJAX

**Asynchronous JavaScript And XML.** Lets us communicate with **remote web servers** asynchronously — request data from servers **dynamically**, without reloading the page.

(Despite the name, we use JSON now, not XML.)

### API

**Application Programming Interface** — a piece of software that another piece of software can talk to. Lots of kinds, but here we mean **online / web APIs**: an application running on a server that receives requests, fetches data from a database, and sends data back as a response.

**In my words:** you send a request to an API's URL, it sends back data (usually JSON), and your code uses it. That's the whole model of a modern frontend.

### JSON

The most popular API data format. Basically a JavaScript object converted to a string so it can travel over the network.

```js
JSON.parse(responseText);        // JSON string → JS object
JSON.stringify(obj);             // JS object → JSON string
```

`response.json()` (on a fetch response) does the parsing for you — but it's itself async and returns a promise (below).

---

## The Old Way — Callbacks and Callback Hell

Before promises, async results were handled with **nested callbacks**: do one async call, and inside its callback do the next, and inside *that* callback do the next...

**Callback Hell:** when you need one async operation to run *after* another, you nest callbacks inside callbacks inside callbacks. The code becomes a sideways pyramid — hard to read, hard to maintain, easy to get wrong.

```js
// callback hell (conceptually)
getData(function (a) {
  getMoreData(a, function (b) {
    getEvenMore(b, function (c) {
      // ...nested forever
    });
  });
});
```

**Promises are the solution to callback hell.**

---

## Promises

**In my words:** A **promise is an object** used as a **placeholder for the future result of an async operation**. It's a container for a value that isn't available yet but will be.

**Why it matters — two big wins:**
1. We no longer need to nest callbacks and rely on events. No more callback hell.
2. We can **chain** promises for a sequence of async operations, flat instead of nested.

### The Promise Lifecycle

A promise goes through states:

```
        ┌─────────────┐
        │   PENDING   │   async task still running, value not available yet
        └──────┬──────┘
               │  the async task finishes → SETTLED
        ┌──────┴──────┐
        ▼             ▼
 ┌────────────┐  ┌────────────┐
 │ FULFILLED  │  │  REJECTED  │
 │ success —  │  │ an error   │
 │ value ready│  │ happened   │
 └────────────┘  └────────────┘
```

- **Pending** — before the result is available; the async task is still working.
- **Settled** — the task finished. Either:
  - **Fulfilled** — success, the value is now available.
  - **Rejected** — an error happened.

Once settled, a promise stays settled — it can't change again.

**Building vs consuming:** most of the time we **consume** promises (use ones that already exist, like the one `fetch` returns). Occasionally we **build** our own (below).

---

## Consuming Promises — `fetch` and `.then()`

`fetch(url)` makes an AJAX request and **returns a promise**. We consume it with `.then()`.

```js
const getCountryData = function (country) {
  fetch(`https://restcountries.com/v3/name/${country}`)
    .then(function (response) {
      console.log(response);
      return response.json();          // .json() ALSO returns a promise
    })
    .then(function (data) {
      console.log(data);
      renderCountry(data[0]);
    });
};

getCountryData('portugal');
```

**In my words:**
- `.then()` takes a callback that runs when the promise is **fulfilled**. It receives the resolved value.
- `response.json()` reads the response body and parses the JSON — but it's **async too**, so it returns *another* promise, which is why we `return` it and chain a second `.then()`.

**Gotcha:** you must `return response.json()` and handle it in the next `.then()`. Forgetting the `return` is a classic bug — the next `.then()` gets `undefined`.

---

## Chaining Promises

Because each `.then()` returns a promise, you chain them **flat** — no nesting. This is the whole point.

```js
const getCountryAndNeighbour = function (country) {
  // Country 1
  fetch(`https://restcountries.com/v3/name/${country}`)
    .then(response => response.json())
    .then(data => {
      renderCountry(data[0]);
      const neighbour = data[0].borders[0];
      if (!neighbour) return;

      // Country 2 — RETURN the new fetch to keep the chain flat
      return fetch(`https://restcountries.com/v3/alpha/${neighbour}`);
    })
    .then(response => response.json())
    .then(data => renderCountry(data, 'neighbour'));
};
```

**The key move:** `return fetch(...)` inside a `.then()`. Returning the promise lets the *next* `.then()` in the chain handle it — that's how you sequence async operations without nesting. Chaining instead of nesting is what kills callback hell.

**Gotcha:** always `return` the promise. If you don't return it and just call `fetch` inside `.then()`, the chain breaks and the next `.then()` won't wait for it.

---

## Handling Errors — `.catch()` and `.finally()`

### `.catch()`

Put **one** `.catch()` at the end of the chain — it catches any error from **any** `.then()` above it (errors propagate down the chain).

```js
fetch(url)
  .then(response => response.json())
  .then(data => renderCountry(data[0]))
  .catch(err => {
    console.error(err);
    alert(`Something went wrong: ${err.message}`);
  });
```

**In my words:** the `.catch()` also returns a promise, and it handles errors from anywhere earlier in the chain — you don't need one per `.then()`.

### `.finally()`

Runs **no matter what** — whether the promise fulfilled or rejected. Used for cleanup that must happen either way, like hiding a loading spinner.

```js
.finally(() => {
  countriesContainer.style.opacity = 1;   // runs on success OR failure
});
```

### The 404 gotcha

**Gotcha:** `fetch` only rejects on a **network failure** — a 404 (not found) does NOT reject the promise. You have to check `response.ok` yourself and throw manually:

```js
.then(response => {
  if (!response.ok) throw new Error(`Country not found (${response.status})`);
  return response.json();
})
```

**`throw new Error(...)`** inside a `.then()` immediately rejects that promise, so the error jumps to the `.catch()`. Without this manual check, a 404 sails through as if it succeeded.

---

## Building a Promise

Occasionally you wrap an old callback-based API in a promise. `new Promise` takes an **executor function** with `resolve` and `reject`.

```js
const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
    // equivalent to:
    // pos => resolve(pos),
    // err => reject(err)
  });
};

getPosition().then(pos => console.log(pos));
```

**In my words:**
- `resolve(value)` — marks the promise **fulfilled** and sets the value the `.then()` receives.
- `reject(error)` — marks it **rejected**, sending the error to `.catch()`.

This is **"promisifying"** — converting a callback-based async function into a promise-based one. `getCurrentPosition` takes success and error callbacks, so passing `resolve`/`reject` directly as those callbacks wraps it neatly.

---

## How Async Works Behind the Scenes

Ties back to Section 8. JS itself is **single-threaded** — one thing at a time — so how does it do async?

### The runtime

```
┌───────────────────────────────────────────────┐
│  JS ENGINE          │   WEB APIs               │
│  ┌────────┐ ┌─────┐ │   (DOM, fetch, timers,   │
│  │ Heap   │ │Stack│ │    geolocation...)       │
│  └────────┘ └─────┘ │   ← async tasks run HERE │
└─────────────────────┴───────────────────────────┘
   ┌──────────────────────┐   ┌────────────────┐
   │  CALLBACK QUEUE      │   │ MICROTASK QUEUE │
   │  (callbacks, timers) │   │  (promises)     │
   └──────────────────────┘   └────────────────┘
              ▲ event loop ▲
```

- **The DOM is not part of JS** — it lives in the **Web APIs** environment provided by the browser. So does `fetch`, timers, geolocation.
- Async tasks run in the **Web API environment**, not on the call stack — that's why they don't block.
- When `fetch` runs, its associated promise lives in the Web API environment until the response arrives.

### The Event Loop

**In my words:** When the call stack is **empty**, the event loop takes the first callback from a queue and puts it on the call stack to execute. This is what orchestrates async — it decides *when* each finished callback actually runs.

### Callback Queue vs Microtask Queue

**Gotcha — priority matters:**
- **Callbacks** (from `setTimeout`, DOM events) go to the **callback queue**.
- **Promise callbacks** (`.then`, `.catch`, `.finally`) go to the **microtask queue**.
- **The microtask queue has PRIORITY** over the callback queue. After each task, the event loop drains *all* microtasks before touching the callback queue.

**Consequence:** a resolved promise's `.then` runs **before** a `setTimeout(…, 0)` callback, even if the timer was scheduled first. Promises can "cut in line."

---

## Async / Await

**In my words:** Syntactic sugar over promises that lets you write async code that **looks synchronous** — no `.then()` chains. This is the modern way.

```js
const getCountryData = async function (country) {
  // `await` pauses the function until the promise settles, then unwraps the value
  const res = await fetch(`https://restcountries.com/v3/name/${country}`);
  const data = await res.json();
  renderCountry(data[0]);
};
```

- **`async`** before a function makes it an async function — it always returns a **promise**.
- **`await`** pauses the function until the awaited promise settles, then returns the resolved value directly (no `.then` needed). It only *looks* like it blocks — the function is suspended, but the rest of the program keeps running.

**In my words:** `const data = await res.json()` reads like normal synchronous code, but under the hood it's the same promise machinery. Much easier to read than chains.

### Error handling — `try / catch`

`await` has no `.catch()`, so wrap it in a **`try / catch`** block:

```js
const getCountryData = async function (country) {
  try {
    const res = await fetch(`.../name/${country}`);
    if (!res.ok) throw new Error('Country not found');
    const data = await res.json();
    renderCountry(data[0]);
  } catch (err) {
    console.error(err.message);
  } finally {
    // cleanup
  }
};
```

`try` runs the risky code; if anything throws (including a manual `throw`), `catch` handles it. Same `throw new Error()` pattern for the 404 problem.

**Gotcha:** an async function returns a promise, so if you need its *return value* outside, you still consume it with `.then()` / `await` — the async keyword doesn't make the result magically synchronous to the caller.
