import { parseTable, generateBytes, bitPatterns } from '../src/table2bytes.mjs';

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
    try {
      navigator.clipboard.writeText(bytes);
    } catch (error) {
      alert(error.message);
    }
    const b = [];
    for (const [state, entries] of Object.entries(states)) {
      for (const [symbol, [print, move, next, line, i]] of Object.entries(
        entries
      )) {
        const byte = bytes[b.length];
        b.push(
          `<tr>
            <td>${state}</td>
            <td>${symbol}</td>
            <td>${print}</td>
            <td>${move}</td>
            <td>${next}</td>
            <td>000 ${i.toString(2).padStart(6, '0')} ${symbol}</td>
            <td>${byte.toString(2).padStart(10, '0')}</td>
            <td>${byte & bitPatterns.dirLeft ? 1 : 0}</td>
            <td>${byte & bitPatterns.printOne ? 1 : 0}</td>
            <td>${byte & bitPatterns.move ? 1 : 0}</td>
            <td>${byte & bitPatterns.write ? 1 : 0}</td>
            <td>${(byte & bitPatterns.halt).toString(2).padStart(6, '0')}</td>
          </tr>`
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
