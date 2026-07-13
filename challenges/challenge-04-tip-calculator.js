'use strict';

// CHALLENGE #4 — Tip calculator with the ternary operator
// 15% tip if bill is between 50 and 300, otherwise 20%

const bill = 275;

const tip = (bill < 300 && bill > 50) ? bill * 0.15 : bill * 0.2;

console.log(`The bill was ${bill}, the tip was ${tip}, and the total value ${bill + tip}`);
