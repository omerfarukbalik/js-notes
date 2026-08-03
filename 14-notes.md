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

---

## Getters and Setters

**In my words:** Special methods that **get** and **set** a value, but you access them like a **property** (no parentheses). Every object can have them. Prefix with `get` / `set`.

```js
class Account {
  constructor(owner, movements) {
    this.owner = owner;
    this.movements = movements;
  }

  get latest() {
    return this.movements.slice(-1).pop();   // last movement
  }

  set latest(mov) {
    this.movements.push(mov);
  }
}

const acc = new Account('Jonas', [200, 530, 120, 300]);

acc.latest;        // 300   — GET, accessed like a property (no ())
acc.latest = 50;   // SET, looks like assignment but runs the setter
```

**Why it matters:** getters/setters let you run validation or computation behind what looks like a plain property access. Common use — a setter that validates data before storing it.

**Gotcha:** if you have a setter for a property that's *also* set in the constructor, name the underlying property with a leading `_` (`this._movements`) to avoid an infinite loop.

---

## Static Methods

**In my words:** A method attached to the **class itself**, not to the instances. Instances can **not** access it. Prefix with `static`.

```js
class Person {
  constructor(name) { this.name = name; }

  // instance method — every instance has it
  greet() { console.log(`Hi ${this.name}`); }

  // static method — lives on the class, NOT on instances
  static hey() { console.log('Hey there 👋'); }
}

Person.hey();          // ✅ called on the CLASS
const p = new Person('Ömer');
p.hey();               // ❌ TypeError — instances can't access static methods
```

**Real example you already know:** `Array.from()`, `Number.parseFloat()`, `Object.keys()` — all **static**. That's why you call `Array.from(...)`, not `[1,2,3].from(...)`. They belong to the constructor, not the instances.

**In my words:** static methods aren't inherited by instances because they're not on the prototype — they're on the constructor itself. Useful for helpers/factories related to the class but not tied to a specific object.

---

## `Object.create`

**In my words:** The third way to make objects with a prototype. It directly links a new object to a prototype object you specify — no constructor function, no `new`, no prototype property. **Not very commonly used**, but it's the most direct demonstration of prototypal inheritance.

```js
const PersonProto = {
  calcAge() {
    console.log(2037 - this.birthYear);
  },

  init(firstName, birthYear) {   // manual "constructor"
    this.firstName = firstName;
    this.birthYear = birthYear;
  },
};

const steven = Object.create(PersonProto);   // steven's prototype IS PersonProto
steven.name = 'Steven';
steven.birthYear = 2002;
steven.calcAge();                            // delegates up to PersonProto

// or with the init pattern
const sarah = Object.create(PersonProto);
sarah.init('Sarah', 1979);
```

**Why it matters:** it's the clearest picture of "an object linked to a prototype" with none of the `new`/constructor machinery in the way. `Object.create` is also used **between classes** to set up inheritance (below).

---

## Inheritance Between Classes

Three ways, matching the three ways to make objects. All model a **child** class (Student) inheriting from a **parent** (Person).

### 1. Constructor functions + `Object.create`

```js
const Person = function (firstName, birthYear) {
  this.firstName = firstName;
  this.birthYear = birthYear;
};
Person.prototype.calcAge = function () {
  console.log(2037 - this.birthYear);
};

const Student = function (firstName, birthYear, course) {
  Person.call(this, firstName, birthYear);   // borrow the parent constructor
  this.course = course;
};

// link Student's prototype to Person's prototype — MUST be before adding methods
Student.prototype = Object.create(Person.prototype);

Student.prototype.introduce = function () {
  console.log(`I'm ${this.firstName}, studying ${this.course}`);
};

const mike = new Student('Mike', 2000, 'CS');
mike.introduce();
mike.calcAge();   // inherited from Person.prototype via the chain
```

**Two key moves:**
- **`Person.call(this, ...)`** — runs the parent constructor with the child's `this`, so the parent's properties get set on the child.
- **`Student.prototype = Object.create(Person.prototype)`** — links the prototype chain so the child can reach the parent's methods. This line must come **before** you add methods to `Student.prototype`, or you'll overwrite them.

### 2. ES6 classes — `extends` and `super`

Much cleaner. `extends` links the prototype chain automatically; `super` calls the parent constructor.

```js
class Person {
  constructor(fullName, birthYear) {
    this.fullName = fullName;
    this.birthYear = birthYear;
  }
  calcAge() { console.log(2037 - this.birthYear); }
}

class Student extends Person {
  constructor(fullName, birthYear, course) {
    super(fullName, birthYear);   // parent constructor — MUST come first
    this.course = course;         // child-specific property
  }

  introduce() {
    console.log(`I'm ${this.fullName}, studying ${this.course}`);
  }

  // POLYMORPHISM — overwrite an inherited method
  calcAge() {
    console.log(`I'm ${2037 - this.birthYear}, but feel younger`);
  }
}

const martha = new Student('Martha Jones', 2012, 'CS');
```

**Gotchas:**
- `super()` must be called **before** using `this` in the child constructor — `this` doesn't exist until the parent constructor runs.
- Overwriting `calcAge()` in the child is **polymorphism** — the child's version wins for child instances.
- If the child adds no new properties, you can omit the constructor entirely.

### 3. `Object.create` between objects

The `PersonProto` / `StudentProto` version — link `StudentProto`'s prototype to `PersonProto` with `Object.create`. Same idea as method 1 without constructor functions.

---

## Encapsulation — Private Fields (`#`)

**In my words:** Truly hide data so outside code can't touch it. Modern classes support real private fields and methods with the `#` prefix.

```js
class Account {
  // public fields
  locale = navigator.language;

  // PRIVATE fields — # prefix, not accessible outside the class
  #movements = [];
  #pin;

  constructor(owner, currency, pin) {
    this.owner = owner;
    this.currency = currency;
    this.#pin = pin;             // set the private field
  }

  // PUBLIC method — the interface
  getMovements() {
    return this.#movements;
  }

  deposit(val) {
    this.#movements.push(val);
    return this;                 // return `this` to enable CHAINING
  }

  // PRIVATE method — # prefix
  #approveLoan(val) {
    return true;
  }
}

const acc = new Account('Jonas', 'EUR', 1111);
acc.getMovements();     // ✅ public interface
acc.#movements;         // ❌ SyntaxError — private, invisible outside the class
```

**The four field types:**
- **public fields** — `locale = ...` (on instances)
- **private fields** — `#movements = []` (on instances, hidden)
- **public methods** — normal methods (the interface)
- **private methods** — `#approveLoan()` (hidden helpers)

**Why it matters:** this is real **encapsulation** — the whole reason it's a core OOP principle. Before `#`, people faked privacy with a `_` naming convention (`this._pin`), but that only signals "don't touch," it doesn't enforce it. `#` actually enforces it.

### Method Chaining

**In my words:** if a method **returns `this`**, you can call another method right after it, chaining them. This is why `deposit()` above ends with `return this`.

```js
acc.deposit(300).deposit(500).withdraw(35).requestLoan(25000);
```

Each method returns the account object, so the next method has something to be called on. Same pattern as array chaining (`filter().map().reduce()`), but for your own class.

---

## Worked Example — Constructor Inheritance (Car → Ev)

An electric car (`Ev`) inheriting from a base `Car`, using the constructor-function + `Object.create` pattern. Standalone file: `challenge-01-car-ev.js`.

```js
const Car = function (brandName, speed) {
  this.brandName = brandName;
  this.speed = speed;
};
Car.prototype.accelerate = function () { this.speed += 10; };
Car.prototype.brake = function () { this.speed -= 5; };

const Ev = function (brandName, speed, charge) {
  Car.call(this, brandName, speed);          // borrow parent constructor
  this.charge = charge;
};
Ev.prototype = Object.create(Car.prototype);  // link the chain BEFORE adding methods

Ev.prototype.chargeTo = function (charge) { this.charge = charge; };
Ev.prototype.accelerate = function () { this.speed += 20; };   // polymorphism
Ev.prototype.brake = function () { this.speed *= 0.99; };      // polymorphism

const tesla = new Ev('Tesla', 120, 30);
tesla.accelerate();   // Ev's version → speed 140
tesla.brake();        // Ev's version → 138.6
```

**The point:** the two load-bearing lines are `Car.call(this, ...)` (runs the parent constructor so `brandName`/`speed` get set on the Ev) and `Ev.prototype = Object.create(Car.prototype)` (links the chain so an Ev can reach Car's methods). `Ev`'s own `accelerate`/`brake` **override** the inherited ones — polymorphism.

**Note:** `chargeTo` here just re-does what the constructor already set (`this.charge`). That's fine as a setter-style method, but a cleaner version would either use a real setter or validate the value before assigning — a bare reassignment doesn't add anything over `tesla.charge = 90`.
