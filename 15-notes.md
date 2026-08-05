# Section 15 — Mapty (OOP Project)

Not new syntax — this is the **project** where Section 14's OOP becomes real. Class inheritance, private fields, geolocation, a third-party map library (Leaflet), and localStorage, all in one app. The value of these notes is the **architecture**: how the classes are split and how control flows.

App: log running/cycling workouts by clicking on a map. Live location, custom markers, persistent storage.

Source: `mapty.js` alongside this note.

---

## Architecture — Two Class Families

The app splits cleanly into **data classes** (the workouts) and one **application class** (the controller).

### The Workout hierarchy (data)

```
Workout (parent)
  ├── id, distance, duration, coords, date, clicks
  ├── constructor(coords, distance, duration)
  ├── _setDescription()
  └── click()
        │  extends
        ├──────────────┬──────────────┐
   Running                        Cycling
   type='running'                 type='cycling'
   cadence, pace                  elevationGain, speed
   calcPace()                     calcSpeed()
```

`Running` and `Cycling` both `extend Workout`, inheriting the shared fields (distance, duration, coords) and adding their own (cadence/pace vs elevation/speed). This is **inheritance + polymorphism** from Section 14, applied for real.

### The App class (controller)

One class holds the whole app: the map, the workout list, and every handler. Private fields (`#map`, `#workouts`, `#mapEvent`, `#mapZoomLevel`) keep the internal state hidden — **encapsulation**.

The `constructor` runs everything on page load: get the user's position, load saved workouts, and attach event listeners.

---

## Control Flow (from the flowchart)

The order things happen, triggered by user actions:

1. **Load page** → `constructor()` runs automatically
2. → `_getPosition()` asks the browser for geolocation
3. **Receive position** → `_loadMap(position)` renders the Leaflet map centred on the user
4. **Click on map** → `_showForm()` reveals the workout form
5. **Change input** (running/cycling) → `_toggleElevationField()` swaps cadence ↔ elevation
6. **Submit form** → `_newWorkout()` validates, creates a `Running`/`Cycling` object, renders it, saves it
7. → `_renderWorkoutMarker()` + `_renderWorkout()` draw the marker and list item
8. → `_setLocalStorage()` persists
9. **Click a workout** in the list → `_moveToPopup()` pans the map to it

---

## Key Techniques Used

### `this` binding in event handlers

**Gotcha (the big one in this project):** in a regular event handler, `this` is the **DOM element**, not the class instance. Every handler passed to `addEventListener` must be bound:

```js
form.addEventListener('submit', this._newWorkout.bind(this));
```

Without `.bind(this)`, `this.#workouts` inside `_newWorkout` would fail — `this` would be the form. This is the Section 10 `bind` material becoming essential.

Same reason `_loadMap` is bound inside the geolocation callback:

```js
navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), errorFn);
```

### Geolocation API

```js
navigator.geolocation.getCurrentPosition(
  successCallback,   // receives a position object
  errorCallback
);
// position.coords.latitude / .longitude
```

Browser API (like the DOM — not part of JS itself). Takes success + error callbacks.

### Leaflet (third-party library)

Loaded via `<script defer>` (Section 13 — order matters, so `defer` not `async`). Exposes a global `L`.

```js
this.#map = L.map('map').setView(coords, zoom);
L.tileLayer(url, options).addTo(this.#map);
this.#map.on('click', this._showForm.bind(this));   // Leaflet's own event, not addEventListener
```

**Note:** Leaflet has its own `.on('click', ...)` event system, separate from the DOM's `addEventListener`.

### Validation with helper functions

Clean guard clauses inside `_newWorkout`:

```js
const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
const allPositive = (...inputs) => inputs.every(inp => inp > 0);

if (!validInputs(distance, duration, cadence) || !allPositive(...))
  return alert('Inputs have to be positive numbers!');
```

Rest parameters + `every` (Section 11) to check any number of inputs at once. `Number.isFinite` (Section 12) as the proper number check.

### Event delegation for workout clicks

Can't attach a listener to each workout (they're created dynamically), so delegate to the parent container and use `closest` (Section 13):

```js
containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));

_moveToPopup(e) {
  const workoutEl = e.target.closest('.workout');
  if (!workoutEl) return;   // matching strategy — clicked outside a workout
  const workout = this.#workouts.find(w => w.id === workoutEl.dataset.id);
  ...
}
```

Uses `dataset.id` to link the clicked DOM element back to its data object.

### localStorage (persistence)

```js
// save — objects must be stringified
localStorage.setItem('workouts', JSON.stringify(this.#workouts));

// load
const data = JSON.parse(localStorage.getItem('workouts'));
```

**Gotcha the course flags:** objects restored from localStorage **lose their prototype chain**. After `JSON.parse`, the workout objects are plain objects again — they are no longer `Running`/`Cycling` instances, so their methods (`calcPace`, `click`) are gone. This is why `workout.click()` is commented out in `_moveToPopup` — it would throw on restored data.

localStorage is also **blocking** (synchronous) and only suitable for small amounts of data.

---

## What This Project Demonstrates

Everything from Section 14 in a real context:
- **Inheritance** — `Running`/`Cycling extends Workout`
- **Polymorphism** — each child has its own calc method and `type`
- **Encapsulation** — `#private` fields on `App`
- **Class fields** — `id`, `date`, `clicks` as public fields; `type` set on the child

Plus DOM (delegation, `closest`, dataset), `this`/`bind`, geolocation, a third-party library, and persistence. It's the first app that ties multiple sections together — worth being able to walk through the architecture out loud.
