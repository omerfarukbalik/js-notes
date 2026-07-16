# Section 8 — How JavaScript Works Behind the Scenes

The theory section. No new syntax, but this is what separates people who *use* JS from people who *understand* it. Worth rereading.

---

## What JavaScript Is (the formal definition)

JavaScript is a **high-level, prototype-based, object-oriented, multi-paradigm, interpreted-or-JIT-compiled, dynamically-typed, single-threaded, garbage-collected** language with **first-class functions** and a **non-blocking event loop concurrency model**.

Unpacking the parts that matter:

### First-Class Functions

Functions are treated as **values** — just like a number or a string. That means you can:
- store a function in a variable
- pass a function as an argument to another function
- return a function from a function

**Why it matters:** This is the foundation of callbacks, event handlers, and array methods like `map`/`filter`. None of it works without first-class functions.

### Dynamically Typed

No type declarations; types are figured out at runtime and can change.

**Why it matters:** This is *the* reason TypeScript exists — to add the type safety JS deliberately left out.

### Single-Threaded + Concurrency Model

JS runs on **one single thread** — it can only do one thing at a time.

So how does it handle a slow network request without freezing? The **concurrency model** — specifically the **event loop**.

- Long-running tasks (fetch, timers) are handed off to the browser to run **in the background**.
- When they finish, their callback is put back in line to run on the main thread.
- This is why JS can *feel* like it does many things at once while only ever doing one.

---

## The JavaScript Engine

The program that executes your code. **V8** (Google) powers both **Chrome** and **Node.js**.

Every engine has two parts:

```
┌─────────────────────────────┐
│         JS ENGINE           │
│                             │
│  ┌──────────┐  ┌─────────┐  │
│  │  CALL    │  │  HEAP   │  │
│  │  STACK   │  │         │  │
│  └──────────┘  └─────────┘  │
└─────────────────────────────┘
```

- **Call Stack** — where code is actually **executed**. Execution contexts stack up here.
- **Heap** — unstructured memory pool where **objects are stored**.

---

## Compilation vs Interpretation

| | How it works |
|---|---|
| **Compilation** | Entire source code → machine code in one step, written to a portable file. Then executed. |
| **Interpretation** | Interpreter runs through source code and executes it **line by line**. |

**JavaScript is a mix of both — called JIT (Just-In-Time) compilation.**

The whole code is compiled to machine code at once, then executed **immediately** — no portable file. This is much faster than pure interpretation, which is what old JS used to do.

The pipeline: **Parsing** (read code into a data structure called the AST) → **Compilation** (to machine code) → **Execution** (in the call stack). Modern engines also **optimize** in the background during execution.

---

## The JavaScript Runtime (in the browser)

The engine alone isn't enough. The **runtime** is the engine plus everything around it:

```
┌───────────────────────────────────────────┐
│              JS RUNTIME                    │
│                                           │
│  ┌─────────────┐    ┌──────────────────┐  │
│  │  JS ENGINE  │    │    WEB APIs      │  │
│  │ Stack + Heap│    │ DOM, Fetch,      │  │
│  │             │    │ Timers, etc.     │  │
│  └─────────────┘    └──────────────────┘  │
│                                           │
│  ┌────────────────────────────────────┐   │
│  │        CALLBACK QUEUE              │   │
│  └────────────────────────────────────┘   │
│              ↑ event loop ↑               │
└───────────────────────────────────────────┘
```

- **Web APIs** — DOM, Fetch, Timers. **Provided by the browser, not the JS language.** Accessible on the `window` object.
- **Callback Queue** — where ready-to-run callbacks wait (e.g. a click handler's function after the click happens).
- **Event Loop** — takes callbacks from the queue and pushes them onto the call stack when the stack is empty.

**Example flow:** you click a button → the `click` event fires → the callback goes to the callback queue → the event loop moves it to the call stack → it runs.

---

## Execution Context (EC)

**In my words:** An environment where a piece of JS is executed. It stores all the info that piece of code needs to run.

- Exactly **one global EC** is created for top-level code (code not inside any function).
- **One new EC is created per function call.**

Each EC contains:
- all its **local variables** (`let`, `const`, `var`)
- **function declarations**
- the **`arguments`** object

The **call stack** is where ECs get stacked in order. The one on top is the one currently running. When a function returns, its EC is popped off, and execution resumes in the one below.

---

## Scope and the Scope Chain

**Scope** = where a variable can be accessed.

| Scope type | Rule |
|---|---|
| **Global scope** | Declared outside any function or block. Accessible everywhere. |
| **Function scope** | Variables declared in a function are only accessible inside it. |
| **Block scope** (ES6) | `let`/`const` inside a `{ }` block are only accessible in that block. `var` is NOT block-scoped. |

**Lexical scoping:** scoping is controlled by **where functions and blocks are physically written** in the code. A nested function can access variables of its parent — this is fixed at write time, not call time.

**Scope chain:** when a variable isn't found in the current scope, JS looks it up in the parent scope, then the parent's parent, and so on up to global.

---

## Hoisting

**In my words:** Before code runs, JS scans for variable and function declarations and makes some of them accessible *before* the line they're actually declared on. Each gets an entry in the environment before execution.

| Declaration type | Hoisted? | Initial value | Scope |
|---|---|---|---|
| **function declaration** | ✅ Yes | the actual function | Block (strict mode) |
| **`var` variable** | ✅ Yes | `undefined` | Function |
| **`let` / `const`** | ⚠️ Technically yes | `<uninitialized>` — TDZ | Block |
| **function expression / arrow** | Depends | same as the variable holding it (`var` vs `let`/`const`) | — |

### The Temporal Dead Zone (TDZ)

For `let`/`const`, the variable exists from the start of its block but is **uninitialized** until the declaration line. Accessing it before then throws a **ReferenceError: Cannot access before initialization**.

**Why it matters:** The TDZ is a *feature*, not a bug. It makes accessing-too-early a loud error instead of a silent `undefined`, which is what `var` gives you.

```js
console.log(x);   // ReferenceError (let, in TDZ)
console.log(y);   // undefined (var, hoisted)
let x = 1;
var y = 2;
```

**Practical rule:** because function *declarations* are fully hoisted, you can call them before they're written. Function *expressions* and *arrows* cannot — they're in the TDZ (or `undefined`) until their line runs.

---

## The `this` Keyword

**In my words:** `this` is a special variable created for every execution context (every function). Its value is **not static** — it depends entirely on **how the function is called**, decided only when the function actually runs.

| How the function is called | What `this` points to |
|---|---|
| **Method** (`obj.fn()`) | the object that is calling the method |
| **Simple call** (`fn()`) | `undefined` (in strict mode) |
| **Arrow function** | `this` of the surrounding function (lexical parent) — arrows have no `this` of their own |
| **Event listener** | the DOM element the handler is attached to |

**Gotcha:** In a regular function call, `this` is `undefined` in strict mode (and the `window` object in sloppy mode). This trips people up when they pull a method out of an object and call it plain.

**Gotcha:** Never use an arrow function as a method if you need `this` to point at the object — it'll inherit `this` from the parent scope instead.

---

## Primitives vs Objects (Memory)

This is the one that causes the most real bugs.

| | Stored where | Variable holds |
|---|---|---|
| **Primitives** | Call stack | the actual value |
| **Objects** (incl. arrays, functions) | Heap | a **reference** (address) to the value |

**Why it matters:** When you copy an object variable, you copy the **reference**, not the object. Both variables now point at the **same** object in the heap. Change one, you change "both" — because there's only one object.

```js
const me = { age: 30 };
const friend = me;      // copies the REFERENCE, not the object
friend.age = 27;
console.log(me.age);    // 27 — they're the same object
```

---

## Copying Objects

### Shallow Copy — spread `{ ...obj }`

```js
const jessica = {
  firstName: 'Jessica',
  lastName: 'Williams',
  age: 27,
  family: ['Alice', 'Bob'],
};

const jessicaCopy = { ...jessica };   // shallow copy
```

**Shallow copy = only the first level is truly copied.** Primitive properties are copied correctly. But **nested objects/arrays are still shared by reference.**

```js
jessica.family.push('Mary');
// jessicaCopy.family ALSO has 'Mary' now — same array in the heap
```

### Deep Copy — `structuredClone()`

Copies **everything**, including nested objects and arrays, so nothing is shared.

```js
const jessicaClone = structuredClone(jessica);

jessica.family.push('John');
// jessicaClone.family is UNAFFECTED — fully independent
```

**Support:** `structuredClone` works in all modern browsers (Chrome 98+, Firefox 94+, Safari 15+) and Node.js 17+.

**Gotcha:** `structuredClone` **cannot** copy functions or DOM nodes — it throws if the object contains them.

**Old hacky way** (still seen in older code): `JSON.parse(JSON.stringify(obj))`. Works for plain data but silently destroys `Date`, `Map`, `Set`, `undefined`, and functions. Avoid it now that `structuredClone` exists.
