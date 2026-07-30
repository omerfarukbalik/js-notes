# Section 12 — Numbers, Dates, Intl and Timers

Mostly small, practical tools. The two that matter most for real apps are **`Intl`** (formatting numbers/dates for any country) and **timers** (`setTimeout` / `setInterval`).

---

## Numbers Are All Floats

**In my words:** JavaScript has **one** number type, and it represents everything as a **decimal (floating point)** internally. There's no separate integer type.

```js
console.log(23 === 23.0);   // true — same thing
```

### The Floating-Point Problem

**Gotcha:** Numbers are stored in **binary (base 2)**, and some base-10 decimals can't be represented exactly in binary — just like `1/3` can't be written exactly in base 10.

```js
console.log(0.1 + 0.2);          // 0.30000000000000004  ← not exactly 0.3
console.log(0.1 + 0.2 === 0.3);  // false
```

**Why it matters:** Never do precise financial math with floats directly. This isn't a JS bug — every language using the IEEE 754 standard has it.

---

## Converting Strings to Numbers

```js
Number('23');   // 23
+'23';          // 23 — the + operator coerces, shorter
```

### Parsing — pull a number out of a messier string

```js
Number.parseInt('30px', 10);    // 30   — reads until it hits a non-number
Number.parseInt('e23', 10);     // NaN  — must START with a number
Number.parseInt('2.5rem');      // 2    — integer only
Number.parseFloat('2.5rem');    // 2.5  — reads the decimal too
```

**`parseInt` takes a second argument, the base (radix).** Always pass `10` for normal decimal numbers — it avoids weird edge cases with strings that look like other bases.

```js
Number.parseInt('30px', 10);   // base 10 → 30
Number.parseInt('30px', 2);    // base 2 (binary) → different result
```

**In my words:** `parseInt` is what you use to strip a unit off a CSS value like `'30px'`. `Number()` can't do that — it needs a clean numeric string.

---

## Checking Numbers

| Method | Checks | Note |
|---|---|---|
| `Number.isNaN(x)` | is it `NaN`? | not a great "is number" test |
| `Number.isFinite(x)` | is it a real, finite number? | **the best way to check for a number** |
| `Number.isInteger(x)` | is it a whole number? | |

```js
Number.isFinite(20);       // true
Number.isFinite('20');     // false — a string, not a number
Number.isFinite(+'20X');   // false — that's NaN
Number.isFinite(23 / 0);   // false — Infinity isn't finite

Number.isInteger(23);      // true
Number.isInteger(23.0);    // true
Number.isInteger(23 / 0);  // false — Infinity
```

**In my words:** Use `Number.isFinite()` when you want to confirm something is genuinely a usable number. `isNaN` is narrower — it only tells you if a value *is* `NaN`.

---

## Math and Rounding

### Math methods

```js
Math.sqrt(25);          // 5
25 ** (1 / 2);          // 5 — square root the operator way
8 ** (1 / 3);           // 2 — cube root

Math.max(5, 18, 23, 11, 2);     // 23 — does type coercion
Math.max(5, 18, '23', 11, 2);   // 23 — '23' coerced
Math.max(5, 18, '23px', 11, 2); // NaN — can't coerce '23px'
Math.min(5, 18, 23, 11, 2);     // 2

Math.PI;                // 3.14159...
Math.random();          // 0 to <1
```

**Random integer in a range** — worth memorizing:

```js
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
```

### Rounding

```js
Math.round(23.9);    // 24 — nearest
Math.ceil(23.3);     // 24 — always up
Math.floor(23.9);    // 23 — always down
Math.trunc(23.9);    // 23 — just chops the decimal
```

**Gotcha — `floor` vs `trunc` differ on negatives:**

```js
Math.trunc(-23.3);   // -23 — chops toward zero
Math.floor(-23.3);   // -24 — rounds DOWN (more negative)
```

`Math.floor` is safer than `trunc` in a random-int formula because it handles negatives predictably.

### Rounding decimals — `toFixed`

**Gotcha:** `toFixed` returns a **string**, not a number. Add `+` to convert back.

```js
(2.7).toFixed(0);     // '3'    — string
(2.345).toFixed(2);   // '2.35' — string
+(2.345).toFixed(2);  // 2.35   — number
```

Note the syntax: `(2.7).toFixed(0)` — the number is wrapped in parens because JS boxes the primitive into a Number object to call the method (same boxing idea as strings in Section 9).

---

## The Remainder Operator `%`

Returns what's left over after division.

```js
5 % 2;   // 1   — 5 = 2*2 + 1
8 % 3;   // 2   — 8 = 2*3 + 2
6 % 2;   // 0   — divides evenly
```

**Main use — even/odd:**

```js
const isEven = n => n % 2 === 0;
```

**Common pattern — do something every Nth time:**

```js
rows.forEach((row, i) => {
  if (i % 2 === 0) row.style.background = 'grey';   // every 2nd row
  if (i % 3 === 0) row.style.background = 'blue';   // every 3rd row
});
```

---

## Numeric Separators `_`

Underscores make big number literals readable. JS ignores them.

```js
const diameter = 287_460_000_000;   // reads as 287,460,000,000
const price = 345_99;               // 34599 (you can place them anywhere)
```

**Gotcha:** They only work in number **literals** written in code. You **cannot** parse a string with them:

```js
Number('230_000');     // NaN
parseInt('230_000');   // 230 — stops at the underscore
```

---

## BigInt

For integers larger than JS can safely represent. The safe limit is:

```js
Number.MAX_SAFE_INTEGER;   // 9007199254740991  (2**53 - 1)
```

Beyond that, normal numbers lose precision. **BigInt** (add `n`) fixes it:

```js
console.log(4838430248342043823408394839483204n);   // exact
console.log(BigInt(48384302));                       // convert a number
console.log(10000n + 10000n);                        // 20000n
```

**Gotchas:**
- **Can't mix** BigInt with regular numbers in math — convert first: `huge * BigInt(num)`.
- Comparison operators DO work across types: `20n > 15` is `true`, `20n === 20` is `false` (different types), `20n == 20` is `true` (loose).
- `Math` methods don't work on BigInt.
- Division cuts off the decimal: `11n / 3n` is `3n`.

---

## Dates

### Creating a date

```js
const now = new Date();                          // right now
new Date('Aug 02 2020 18:05:41');                // parse a string (unreliable)
new Date('December 24, 2015');
new Date(2037, 10, 19, 15, 23, 5);               // year, MONTH, day, h, m, s
new Date(0);                                     // Unix epoch: Jan 1 1970
new Date(3 * 24 * 60 * 60 * 1000);               // 3 days after epoch (in ms)
```

**Gotcha:** The **month is zero-based**. `10` is **November**, not October. Days and years are normal. This catches everyone.

### Getting parts of a date

```js
const future = new Date(2037, 10, 19, 15, 23);

future.getFullYear();   // 2037  (never use getYear())
future.getMonth();      // 10    (zero-based!)
future.getDate();       // 19    (day of month)
future.getDay();        // day of WEEK (0 = Sunday)
future.getHours();      // 15
future.getMinutes();    // 23
future.getSeconds();
future.toISOString();   // standard string, good for storage/DB
future.getTime();       // timestamp: ms since 1970
Date.now();             // current timestamp
```

**Gotcha:** `getDate()` is day-of-**month**; `getDay()` is day-of-**week**. Names are backwards from intuition.

There are matching **`set`** methods: `future.setFullYear(2040)`, etc.

### Date math

**In my words:** When you subtract two dates, JS converts them to timestamps (ms since 1970), so you get the difference **in milliseconds**. Convert to days by dividing.

```js
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);   // ms → days
```

`+future` also gives the timestamp — the `+` coerces the date to a number.

---

## Internationalization (`Intl`)

The browser's built-in formatting for numbers and dates, per-country. You pass a **locale** (a language/region code like `'en-US'`, `'de-DE'`, `'pt-PT'`) and it formats correctly for that place — commas vs dots, currency symbols, date order.

Locale reference: browsers use standard codes; `navigator.language` gives the user's current locale.

### Numbers

```js
const num = 3884764.23;

const options = { style: 'currency', currency: 'EUR' };

new Intl.NumberFormat('en-US', options).format(num);   // €3,884,764.23
new Intl.NumberFormat('de-DE', options).format(num);   // 3.884.764,23 €
new Intl.NumberFormat('ar-SY', options).format(num);   // Arabic numerals
new Intl.NumberFormat(navigator.language, options).format(num);  // user's locale
```

`style` can be `'currency'`, `'unit'`, `'percent'`, or `'decimal'`. Currency needs the `currency` option.

### Dates

```js
const options = {
  hour: 'numeric', minute: 'numeric',
  day: 'numeric', month: 'numeric', year: 'numeric',
  // weekday: 'long',
};

new Intl.DateTimeFormat('en-US', options).format(now);
```

**Why it matters:** Instead of manually building `${day}/${month}/${year}` with `padStart`, `Intl` does it correctly for every country's conventions. This is what real apps use.

---

## Timers

### `setTimeout` — run once, after a delay

```js
const timer = setTimeout(
  (ing1, ing2) => console.log(`Pizza with ${ing1} and ${ing2}`),
  3000,              // delay in ms
  'olives', 'spinach'  // args passed into the callback
);
console.log('Waiting...');   // runs FIRST — setTimeout is async
```

Arguments after the delay get passed into the callback. The code does **not** pause — `'Waiting...'` logs first (the event-loop behaviour from Section 8).

**`clearTimeout`** cancels a scheduled timeout before it fires:

```js
if (someCondition) clearTimeout(timer);
```

### `setInterval` — run repeatedly, every N ms

```js
setInterval(function () {
  console.log(new Date());
}, 1000);   // fires every second, forever
```

**`clearInterval(timer)`** stops it. This is how you build a countdown — tick every second, and `clearInterval` when it hits zero (exactly what the Bankist logout timer does).
