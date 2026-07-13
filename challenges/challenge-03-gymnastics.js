'use strict';

// CHALLENGE #3 — Dolphins vs Koalas, average score
// TEST DATA: Dolphins 96, 108, 89 | Koalas 88, 91, 110

const scoreDolphins = (96 + 108 + 89) / 3;
const scoreKoalas = (88 + 91 + 110) / 3;

if (scoreKoalas > scoreDolphins) {
  console.log('Koalas win the trophy');
} else if (scoreDolphins > scoreKoalas) {
  console.log('Dolphins win the trophy');
} else {
  console.log('Both win the trophy');
}
