# Section 14 — Object-Oriented Programming (OOP)

One of the two heavy sections (async is the other). The core mental shift: JS's OOP is **prototype-based**, not class-based like Java or C++. The `class` keyword is real, but underneath it's still prototypes. Understanding that layer is what makes this section click.

---

## What OOP Is

**In my words:** A programming **paradigm** — a way of structuring code — based on **objects**, used to model real-world or abstract features. Objects are the building blocks of an application; they hold data and the code that acts on that data together.

- Objects **interact with one another** through a **public interface** (API) — the methods you're allowed to call from outside.
- This keeps code organized, reusable, and easier to maintain than a pile of loose functions and variables.

### Class and Instance

- **Class** = a **blueprint** — the template describing what objects of this type look like and can do.
- **Instance** = an actual object **created from** a class. Making one is called **instantiation**.

```
Class (blueprint)  ──instantiation──▶  Instance (real object)
```

---

## The 4 Fundamental Principles of OOP

1. **Abstraction** — ignore or hide details that don't matter, so you work with a simpler higher-level view. (You call `phone.turnOn()` without caring how the circuits work.)

2. **Encapsulation** — keep some properties and methods **private** inside the class, not accessible from outside. Only a controlled public interface is exposed. Prevents outside code from breaking internal state.

3. **Inheritance** — a **child** class **inherits** all properties and methods from a **parent** class, then adds its own. Avoids duplicating shared logic.

4. **Polymorphism** — a child class can **overwrite** a method it inherited from the parent, giving its own version.

---

## OOP in JavaScript — Prototypes

**In my words:** JS doesn't do classical OOP. Instead of a class defining an instance directly, JS uses **prototypes**:

```
Classical OOP:   Class  ──instantiation──▶  Instance

JS (prototypal): Prototype  ◀──delegation──  Object
```

- Objects are **linked to a prototype object**.
- The prototype contains methods that are **accessible to all objects** linked to it.
- Objects **delegate** behaviour to their prototype — this is called **prototypal inheritance**.

**In my words:** instead of every object carrying its own copy of a method, the method lives **once** on the prototype, and all linked objects reach up to it when they need it. That "reaching up" is delegation.

---

## Three Ways to Create Objects (with prototypes)

1. **Constructor functions** — the old way. What ES6 classes do under the hood.
2. **ES6 classes** — modern syntax, "syntactic sugar" over constructor functions.
3. **`Object.create()`** — the most direct way to link an object to a prototype (rarely used).

---

## Constructor Functions

**In my words:** A normal function, but **called with `new`**. By convention its name is **capitalized**. Arrow functions can't be constructors (no `this`).

```js
const Person = function (firstName, birthYear) {
  // instance properties
  this.firstName = firstName;
  this.birthYear = birthYear;

  // ❌ NEVER create methods inside the constructor
  // this.calcAge = function () {...}  // copies the method onto EVERY instance
};

const jonas = new Person('Jonas', 1991);
```

### What `new` actually does — 4 steps

```
1. A new empty object {} is created
2. The function is called; `this` = that new object
3. The new object is LINKED to the constructor's prototype
4. The function automatically RETURNS the new object
```

**In my words:** `new` is what makes `this` point to a fresh object and links it to the prototype. Without `new`, `this` would be undefined (strict mode) and nothing gets created.

### Checking instances

```js
jonas instanceof Person;   // true — is jonas built from Person?
```

---

## Prototypes and the Prototype Chain

**Never put methods in the constructor** (that copies them onto every instance, wasting memory). Put them on the **prototype** — one shared copy.

```js
Person.prototype.calcAge = function () {
  console.log(2037 - this.birthYear);
};

jonas.calcAge();   // works — jonas delegates to Person.prototype
```

**In my words:** `Person.prototype` is **not** Person's own prototype — it's the prototype **of the objects created by** `Person`. This naming trips everyone up.

```js
Person.prototype.isPrototypeOf(jonas);   // true
Person.prototype.isPrototypeOf(Person);  // false — it's the instances' prototype, not Person's
```

Every object has a hidden `__proto__` pointing to its prototype:

```js
jonas.__proto__ === Person.prototype;   // true
```

### Prototype properties (not just methods)

```js
Person.prototype.species = 'Homo sapiens';
jonas.species;                       // 'Homo sapiens' — inherited from prototype
jonas.hasOwnProperty('species');     // false — it's on the prototype, not jonas itself
jonas.hasOwnProperty('firstName');   // true  — set directly on jonas in the constructor
```

**`hasOwnProperty`** tells you whether a property lives on the object *itself* vs somewhere up its prototype chain.

### The Prototype Chain

**In my words:** A series of links between objects, connected through prototypes — similar to the scope chain from Section 8. When you access a property/method, JS looks on the object; if not found, it looks on the object's prototype; then that prototype's prototype; and so on until it hits `null`.

```
jonas
  └─ __proto__ ──▶ Person.prototype
                     └─ __proto__ ──▶ Object.prototype   (has hasOwnProperty, etc.)
                                        └─ __proto__ ──▶ null   (top of the chain)
```

**Example:** `jonas.hasOwnProperty('name')` — `hasOwnProperty` isn't on `jonas`, isn't on `Person.prototype`, but IS on `Object.prototype`, so JS finds it there by walking up the chain.

**Key fact:** `Object.prototype` is the top; its `__proto__` is `null`. Every object literal `{}` is really `new Object(...)`, which is why every object has access to `Object.prototype`'s methods.

**Arrays too:** an array's chain goes `arr → Array.prototype → Object.prototype → null`. That's *why* every array has `map`, `filter`, etc. — they live on `Array.prototype`. You could even add your own: `Array.prototype.myMethod = function() {...}` — though that's **bad practice** and should be avoided (it pollutes every array).

---

## ES6 Classes

**In my words:** The modern way to do exactly what constructor functions do — the class is **syntactic sugar** over the constructor-function + prototype pattern. Under the hood, classes still ARE functions.

### Declaration and expression

```js
// class expression
const PersonCl = class { ... };

// class declaration (more common)
class PersonCl {
  constructor(firstName, birthYear) {
    this.firstName = firstName;
    this.birthYear = birthYear;
  }

  // methods written here go AUTOMATICALLY on the prototype — not on each instance
  calcAge() {
    console.log(2037 - this.birthYear);
  }
}

const jessica = new PersonCl('Jessica', 1996);
jessica.calcAge();
```

**In my words:** the `constructor` method is what runs when you call `new` — it sets up instance properties. Every **other** method you write inside the class body automatically ends up on the prototype, so it's shared, not copied. This is the whole point — you don't have to write `Person.prototype.method = ...` separately anymore.

### Three important facts about classes

1. **Classes are NOT hoisted** — you must declare a class before you use it (unlike function declarations, which are hoisted).
2. **Classes are first-class citizens** — they're a special kind of function, so you can pass them into functions and return them.
3. **Class bodies always run in strict mode** — automatically, no need to write `'use strict'`.
