# Section 13 — Advanced DOM and Events

The section that makes you able to build real, interactive UI without a framework. Understanding **event propagation**, **delegation**, and the **Intersection Observer** here is exactly what React later hides from you — knowing it underneath is what separates copy-paste from actually understanding.

---

## The DOM Type Hierarchy

The DOM isn't flat — everything inherits from a chain of types. This is *why* `addEventListener` works on almost anything.

```
EventTarget
   └── Node
        ├── Element ──── HTMLElement ──── HTMLButtonElement, HTMLDivElement, ...
        ├── Text        (the text inside <p>hello</p>)
        ├── Comment     (<!-- ... -->)
        └── Document
```

**In my words:** Every node type inherits from `Node`, and `Node` inherits from `EventTarget`. `EventTarget` is where `addEventListener` lives — so *any* node can listen for events, including `document` and even `window`. This is inheritance (OOP, Section 14) working under the hood.

---

## Selecting Elements

```js
document.documentElement;   // the <html> element
document.head;
document.body;

document.querySelector('.header');       // first match
document.querySelectorAll('.section');   // ALL matches → NodeList
document.getElementById('id');           // no # needed
document.getElementsByTagName('button'); // HTMLCollection
document.getElementsByClassName('btn');  // HTMLCollection
```

### HTMLCollection vs NodeList — live vs static

**Gotcha, and it matters:**

| Returned by | Type | Live? |
|---|---|---|
| `getElementsByTagName`, `getElementsByClassName`, `.children` | **HTMLCollection** | **Live** — auto-updates when the DOM changes |
| `querySelectorAll` | **NodeList** | **Static** — a snapshot from the moment you called it |

**In my words:** An HTMLCollection *keeps updating itself* — if you delete an element from the page, it disappears from the collection automatically. A NodeList is frozen at the moment `querySelectorAll` ran; later DOM changes don't affect it.

Neither is a real array (Section 7) — spread to loop with array methods: `[...document.querySelectorAll('.x')].forEach(...)`.

---

## Creating and Inserting Elements

### `insertAdjacentHTML` — quick, string-based

Fastest way to inject HTML (used all over Bankist). Takes a position and an HTML string.

```js
container.insertAdjacentHTML('beforeend', '<div class="row">...</div>');
// positions: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
```

### `createElement` — programmatic, reusable

When you need a real element object to manipulate before inserting.

```js
const message = document.createElement('div');   // creates a DOM element (not on page yet)
message.classList.add('cookie-message');
message.textContent = 'We use cookies.';
message.innerHTML = 'We use cookies. <button>Got it</button>';

header.append(message);       // insert as last child
header.prepend(message);      // insert as first child
header.before(message);       // insert as a sibling, before
header.after(message);        // insert as a sibling, after
message.remove();             // remove it
```

**Gotcha:** An element created with `createElement` can only exist in **one** place. `append` then `prepend` *moves* it, not copies. Use `.cloneNode(true)` to duplicate.

---

## Styles, Attributes, Classes

### Styles

```js
message.style.backgroundColor = '#37383d';   // sets INLINE style
message.style.width = '120%';

// reading: only works for inline styles you set
message.style.color;                          // '' if not set inline
getComputedStyle(message).color;              // the ACTUAL rendered value
getComputedStyle(message).height;             // works even from CSS file
```

**Gotcha:** `element.style.x` only reads styles set **inline**. To read a value that comes from your CSS file, use `getComputedStyle(el).property`.

### CSS Custom Properties (variables)

You can read and change CSS variables (the `--name` ones defined in `:root`) from JS:

```js
document.documentElement.style.setProperty('--color-primary', 'orangered');
```

**Why it matters:** change one root variable and every element using it updates — theming, dark mode, etc.

### Attributes

```js
logo.src;                       // works for STANDARD attributes
logo.getAttribute('src');       // relative path as written
logo.getAttribute('designer');  // custom/non-standard attributes
logo.setAttribute('company', 'Bankist');
logo.dataset.versionNumber;     // data-version-number="..." → dataset
```

### Classes

```js
el.classList.add('c');
el.classList.remove('c');
el.classList.toggle('c');
el.classList.contains('c');   // note: contains, NOT includes
```

---

## Scrolling

### Old way — manual coordinates

```js
const s1coords = section1.getBoundingClientRect();
// returns position/size RELATIVE to the visible viewport

window.scrollTo({
  left: s1coords.left + window.pageXOffset,   // + current scroll = absolute position
  top: s1coords.top + window.pageYOffset,
  behavior: 'smooth',
});
```

`getBoundingClientRect()` gives an element's position **relative to the viewport** (the visible area). Adding the current scroll offset (`pageYOffset`) converts it to an absolute page position.

### Modern way — one line

```js
section1.scrollIntoView({ behavior: 'smooth' });
```

**Why it matters:** replaces the whole coordinate calculation above. This is what you actually use now.

---

## Events

**In my words:** An event is a **signal generated by a DOM node** that something happened — a click, a hover, a keypress. The most important ones are mouse and keyboard events.

```js
'click'         // clicked
'mouseenter'    // pointer moved onto the element (like hover)
'mouseleave'    // pointer left the element
'keydown', 'keyup', 'keypress'
```

### `addEventListener` vs `onclick` (old way)

```js
// old, avoid
h1.onclick = function () { ... };

// modern, preferred
h1.addEventListener('click', function () { ... });
```

**Why `addEventListener` is better:**
1. You can attach **multiple listeners** to the same event (assigning `onclick` twice overwrites).
2. You can **remove** a listener later with `removeEventListener` (needs a named function):

```js
const greet = () => console.log('hi');
h1.addEventListener('click', greet);
h1.removeEventListener('click', greet);   // must be the same function reference
```

---

## Event Propagation — Capturing, Target, Bubbling

This is the conceptual core of the section. When you click an element, the event doesn't just fire there — it travels through the DOM tree in **three phases**:

```
1. CAPTURING PHASE   — event travels DOWN from document → target
                       (document → html → body → section → p → a)

2. TARGET PHASE      — event reaches the actual clicked element

3. BUBBLING PHASE    — event travels back UP from target → document
                       (a → p → section → body → html → document)
```

**In my words:** click a link deep in the page, and the event is "born" at the document, travels *down* to the link (capturing), fires *on* the link (target), then bubbles *back up* through every ancestor (bubbling). By default, listeners fire during the **bubbling** phase.

**Why it matters:** because the event bubbles up, a listener on a **parent** also fires when you click a **child**. This is what makes delegation (below) possible.

**Note:** not all events bubble or capture — but the important ones (`click`, etc.) do.

### `e.target` vs `e.currentTarget`

```js
element.addEventListener('click', function (e) {
  e.target;         // where the event ORIGINATED (the actual clicked element)
  e.currentTarget;  // the element the LISTENER is attached to (=== this)
});
```

**Gotcha:** these are often different. If a listener is on a parent and you click a child, `e.target` is the child, `e.currentTarget` is the parent.

### `e.stopPropagation()`

Stops the event from travelling further up the tree — the event fires only on the targeted element, not its parents.

```js
e.stopPropagation();
```

**In my words:** it kills bubbling so ancestors never hear about the event. **Generally a bad idea** — it breaks delegation and hides events from code that legitimately needs them. Use it rarely.

---

## Event Delegation

**In my words:** Instead of adding an event handler to *every* element (say, every link in a nav), you add **one** handler to their common **parent**. Because events bubble up, the parent hears every child's click. Inside the handler you check `e.target` to see which child was actually clicked, and act only on the ones you care about.

```js
// ❌ without delegation — one listener per link (wasteful)
document.querySelectorAll('.nav__link').forEach(el =>
  el.addEventListener('click', handler)
);

// ✅ with delegation — ONE listener on the parent
document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();

  // "matching strategy" — only react to actual link clicks
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});
```

**Why it matters — two big wins:**
1. **Performance** — one listener instead of hundreds.
2. **Dynamic elements** — it works for elements added to the page *later*, which a per-element listener can't (the listener wouldn't exist yet).

The `if (e.target.classList.contains(...))` check is called the **matching strategy** — it filters bubbled events down to just the ones you want.

---

## DOM Traversal

Moving through the tree relative to an element — down to children, up to parents, sideways to siblings.

### Going down (children)

```js
el.childNodes;              // NodeList — EVERYTHING, incl. text & comment nodes
el.children;                // HTMLCollection — only ELEMENT children (live)
el.firstElementChild;       // first element child
el.lastElementChild;        // last element child

el.firstElementChild.style.color = 'blue';
```

**Gotcha:** `childNodes` includes text nodes (whitespace, line breaks) and comments — usually not what you want. `children` gives just the elements.

### Going up (parents)

```js
el.parentNode;              // direct parent
el.parentElement;           // direct parent element

el.closest('.parent');      // nearest ANCESTOR matching a selector — very useful
```

**`closest` is the opposite of `querySelector`:** `querySelector` searches *down* into descendants, `closest` searches *up* through ancestors. Huge for delegation — "find the card this button lives in."

### Going sideways (siblings)

```js
el.previousElementSibling;
el.nextElementSibling;

// all siblings: go to the parent, then loop its children
[...el.parentElement.children].forEach(function (child) {
  if (child !== el) child.style.transform = 'scale(0.5)';
});
```

`parentElement.children` returns an HTMLCollection you spread and loop with `forEach`.

---

## The Intersection Observer API

**In my words:** Lets you run code when an element **enters or leaves** the viewport (or a defined margin around it) — without listening to the `scroll` event on every pixel. The browser watches for you and calls your callback only when the intersection state changes.

**Why it matters:** the old way — listening to `scroll` and checking coordinates constantly — is a performance killer (fires hundreds of times a second). Intersection Observer is the modern, efficient replacement. It powers **lazy loading images**, **sticky navs**, and **reveal-on-scroll** animations.

### The pattern

```js
const obsCallback = function (entries, observer) {
  entries.forEach(entry => {
    // entry.isIntersecting → is the target currently in view?
  });
};

const obsOptions = {
  root: null,          // null = the viewport
  threshold: 0.1,      // fire when 10% of the target is visible
};

const observer = new IntersectionObserver(obsCallback, obsOptions);
observer.observe(document.querySelector('.section'));
```

### Real example — sticky navigation

Make the nav sticky once the header scrolls out of view:

```js
const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;   // destructure the single entry

  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,                     // fire the moment header fully leaves
  rootMargin: `-${navHeight}px`,    // trigger navHeight px early, so nav appears on time
});

headerObserver.observe(header);
```

**The key options:**
- **`root: null`** — observe intersection with the **viewport**.
- **`threshold`** — how much of the target must be visible to fire (0 = any pixel, 1 = fully visible; can be an array like `[0, 0.2]`).
- **`rootMargin`** — a margin around the root that shifts *when* the callback fires. Negative values fire early — here `-navHeight` makes the nav stick exactly when the header's bottom reaches the nav's height, so there's no jump.

**`entry.isIntersecting`** is the boolean you branch on — `true` when the target is in the observed area, `false` when it's not.

---

## Lifecycle DOM Events

Fire at key moments in page load:

```js
// HTML parsed & DOM tree built (doesn't wait for images/css)
document.addEventListener('DOMContentLoaded', function (e) { ... });

// everything loaded, including images and stylesheets
window.addEventListener('load', function (e) { ... });

// fires just before the user leaves — use sparingly (confirmation dialogs)
window.addEventListener('beforeunload', function (e) { ... });
```

---

## How Scripts Are Loaded — regular vs `async` vs `defer`

Where and how you load your `<script>` changes when the browser fetches and runs it relative to parsing the HTML. Three strategies:

### Regular (no attribute)

```html
<script src="script.js"></script>
```

**In my words:** HTML parsing **stops** when it hits the script, waits for it to fetch and execute, then resumes. If placed in `<head>`, the page is blocked while the script downloads — bad. The old fix was to put it at the **end of `<body>`**, so the HTML is already parsed by the time the script runs.

- In `<head>`: parsing pauses → fetch → execute → resume. Blocks rendering.
- End of `<body>`: HTML fully parsed first, then fetch + execute. Better, but fetching only *starts* late.

### `async`

```html
<script async src="script.js"></script>
```

- Script is **fetched asynchronously** (in parallel with HTML parsing) and **executed immediately** when it arrives — parsing **pauses** during execution.
- **Scripts are NOT guaranteed to run in order** — whichever downloads first runs first.
- `DOMContentLoaded` does **not** wait for async scripts.

**Use for:** independent third-party scripts where order doesn't matter (analytics, ads).

### `defer`

```html
<script defer src="script.js"></script>
```

- Fetched asynchronously (parallel with parsing), but **execution waits until the HTML is completely parsed**.
- Scripts **execute in order**.
- `DOMContentLoaded` fires **after** defer scripts finish.

**In my words:** `defer` is the best of both — download happens in parallel so nothing blocks, but the script doesn't run until the DOM is fully built and runs in the order you wrote. **`defer` is the overall best solution** — use it for your own scripts and whenever order matters (like including a library before code that uses it).

### Summary

```
Load-time ranking:  regular(head) worst  <  regular(body-end)  <  async ≈ defer  best
```

| | fetch | execute | order kept? | DOMContentLoaded waits? |
|---|---|---|---|---|
| regular (head) | blocks | blocks | yes | yes |
| regular (body end) | late | after parse | yes | yes |
| `async` | parallel | on arrival, blocks | **no** | no |
| `defer` | parallel | after parse | **yes** | yes |
