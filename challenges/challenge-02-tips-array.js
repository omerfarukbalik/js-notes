'use strict';

// CHALLENGE #2 — Tip calculator as a function, then applied to an array
// TEST DATA: 125, 555, 44

function calcTip(bill) {
  let tip;

  if (bill > 50 && bill < 300) {
    tip = bill * 0.15;
  } else {
    tip = bill * 0.2;
  }

  return tip;
}

console.log(calcTip(100));

const bills = [125, 555, 44];
const tips = [calcTip(bills[0]), calcTip(bills[1]), calcTip(bills[2])];
const totals = [bills[0] + tips[0], bills[1] + tips[1], bills[2] + tips[2]];

console.log(bills, tips, totals);
