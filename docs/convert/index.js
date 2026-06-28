import { parseTable, generateBytes } from '../src/table2bytes.mjs';

const $ta = document.getElementById('ta');
const $btn = document.getElementById('convert');
const $bytes = document.getElementById('out');
const $results = document.getElementById('results');
const $body = document.getElementById('tbody');
$btn.addEventListener('click', (ev) => {
  const table = $ta.value;
  if (table.length === 0) {
    alert('Nothing to convert');
  }
  try {
    const states = parseTable(table);
    console.dir(states);
    const bytes = generateBytes(states);
    $bytes.innerHTML = bytes;
    const b = [];
    for (const [state, entries] of Object.entries(states)) {
      for (const [symbol, [print, move, next, line, i]] of Object.entries(
        entries
      )) {
        b.push(
          `<tr><td>${state}</td><td>${symbol}</td><td>${print}</td><td>${move}</td><td>${next}</td></tr>`
        );
      }
    }
    $body.innerHTML = b.join('\n');
    $results.hidden = false;
  } catch (err) {
    $bytes.innerHTML = '';
    alert(err);
  }
});

$ta.addEventListener('keypress', (ev) => {
  $btn.disabled = $ta.value == 0;
});
// const table = `
// ##State  Symbol   Print Operation Next State
//    s1      0        -       -            Halt
//    s1      1        0       R            s2
//    s2      0        0       R            s3
//    s2      1        1       R            s2
//    s3      0        1       L            s4
//    s3      1        1       R            s3
//    s4      0        0       L            s5
//    s4      1        1       L            s4
//    s5      0        1       R            s1
//    s5      1        1       L            s5
//    `;
// const states = parseTable(table);
// console.dir(states);
// const bytes = generateBytes(states);
// console.log(bytes);

// button.addEventListener("click", () => writeClipboardText("<empty clipboard>"));

// async function writeClipboardText(text) {
//   try {
//     await navigator.clipboard.writeText(text);
//   } catch (error) {
//     console.error(error.message);
//   }
// }
