# Section 7 — JavaScript in the Browser: DOM and Events

## What the DOM Is

**DOM = Document Object Model.** A structured representation of an HTML document that JavaScript can read and change.

**In my words:** The browser reads your HTML file and builds a tree of objects out of it. That tree is the DOM. JS doesn't touch the HTML *file* — it touches the tree, and the browser re-renders from the tree.

**Why it matters:** This is the entire mechanism behind every interactive website. Nothing on a page changes without something changing the DOM.

### The Tree Structure

```
document          ← the entry point of the DOM
  └── html        ← the first child
       ├── head
       └── body
            └── ...everything else
```

Every element, attribute, and piece of text is a **node** in this tree. JS can interact with any node.

### The DOM Is Not Part of JavaScript

**Gotcha:** The DOM is a **Web API** — a set of tools provided by the *browser*, not by the JavaScript language.

That's why `document`, `querySelector`, `addEventListener` don't exist in Node.js. They're browser features that happen to be written in JS and exposed to your code.

---

## Selecting Elements

```js
document.querySelector('.message');       // first match only
document.querySelectorAll('.btn');        // ALL matches
```

`querySelector` takes a **CSS selector** — the same syntax as your stylesheet. `.class`, `#id`, `div`, whatever.

**Gotcha:** `querySelector` returns **only the first** matching element, even if ten elements match. Silently. This bites people constantly.

### `querySelectorAll` Returns a NodeList — Not an Array

**Gotcha:** `querySelectorAll` gives you a **NodeList**. It *looks* like an array (has `.length`, you can index it, you can `for` loop it) but it is **not** an array.

```js
const btns = document.querySelectorAll('.btn');

btns.length;        // ✅ works
btns[0];            // ✅ works
for (...) {}        // ✅ works
btns.forEach(...)   // ✅ works (NodeList has this one)

btns.map(...)       // ❌ TypeError — NodeList has no .map()
btns.filter(...)    // ❌ TypeError — no .filter() either
```

**Fix:** convert it to a real array first.

```js
const btnsArray = [...document.querySelectorAll('.btn')];   // spread
// or
const btnsArray = Array.from(document.querySelectorAll('.btn'));

btnsArray.map(...);   // ✅ now it works
```

**Why it matters:** This is a classic "why doesn't `.map()` work" bug. NodeList is an *array-like* object, and array-like is not array.

---

## Reading and Changing Elements

```js
// text content
document.querySelector('.message').textContent = 'Correct number!';
console.log(document.querySelector('.message').textContent);   // read it back

// input field values
document.querySelector('.guess').value = 23;
const guess = document.querySelector('.guess').value;
```

**Gotcha:** `.value` on an input is **always a string**, even when the user typed a number. Convert before comparing.

```js
const guess = Number(document.querySelector('.guess').value);   // ✅
```

---

## Changing CSS from JavaScript

```js
document.querySelector('body').style.backgroundColor = '#60b347';
document.querySelector('.number').style.width = '30rem';
```

Three things to know:

1. **It doesn't touch your CSS file.** It writes an **inline style** directly onto the element. Your stylesheet is untouched.
2. **Property names are camelCase.** CSS `background-color` becomes JS `backgroundColor`. CSS has hyphens; JS variables can't.
3. **The value is always a string.** `'30rem'`, not `30`. Units included.

```js
el.style.width = 30;        // ❌ nothing happens — no unit
el.style.width = '30rem';   // ✅
```

---

## Events

An **event** is something that happens on the page — a click, a keypress, a mouse move. You **listen** for it and run a function when it fires.

```js
document.querySelector('.check').addEventListener('click', function () {
  console.log('Button was clicked');
});
```

Two arguments:

1. **Event name** — `'click'`, `'keydown'`, `'submit'`, etc. A string.
2. **Handler function** — runs when the event fires.

**Gotcha:** You pass the function, you don't **call** it.

```js
btn.addEventListener('click', myFunc);     // ✅ passes the function
btn.addEventListener('click', myFunc());   // ❌ calls it immediately, passes the RESULT
```

This is subtle and produces a "why did my handler run on page load?" bug.

---

## Random Numbers

```js
Math.random();                          // 0 to 0.999... (a float, never 1)
Math.random() * 20;                     // 0 to 19.999...
Math.trunc(Math.random() * 20);         // 0 to 19  (integer)
Math.trunc(Math.random() * 20) + 1;     // 1 to 20  (integer)
```

`Math.trunc()` chops off the decimal — no rounding, just cuts.

**Why the `+ 1`:** `Math.trunc` always rounds *toward zero*, so `* 20` gives you `0–19`. Adding 1 shifts the range to `1–20`.
