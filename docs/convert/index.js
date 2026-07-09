import { parseTable, generateBytes, bitPatterns } from '../src/table2bytes.mjs';

const $ta = document.getElementById('ta');
const $btn = document.getElementById('convert');
const $bytes = document.getElementById('out');
const $results = document.getElementById('results');
const $body = document.getElementById('tbody');
const $showEmulator = document.getElementById('showEmulator');
const $emulator = document.getElementById('emulator');

const iframeSrc =
  'https://circuitverse.org/simulator/embed/turing-machine-68b18b14-174b-450a-bf01-8f8b94b983d0?theme=default&display_title=false&clock_time=true&fullscreen=true&zoom_in_out=true';

$btn.addEventListener('click', (ev) => {
  const table = $ta.value;
  if (table.length === 0) {
    alert('Nothing to convert');
  }
  try {
    const states = parseTable(table);
    // console.dir(states);
    const bytes = generateBytes(states);
    $bytes.innerHTML = bytes;
    try {
      navigator.clipboard.writeText(bytes);
    } catch (error) {
      alert(error.message);
    }
    const b = [];
    states.forEach(
      ({ state, symbol, print, move, next, line, lineNum }, addr) => {
        const byte = bytes[addr];
        b.push(
          `<tr>
            <td>${state}</td>
            <td>${symbol}</td>
            <td>${print}</td>
            <td>${move}</td>
            <td>${next}</td>

            <td>000</td>
            <td>${(addr >> 1).toString(2).padStart(6, '0')}</td>
            <td>${symbol}</td>

            <td>${byte.toString(2).padStart(10, '0')}</td>
            
            <td>${byte & bitPatterns.write ? 1 : 0}</td>
            <td>${byte & bitPatterns.symbolOne ? 1 : 0}</td>
            <td>${byte & bitPatterns.move ? 1 : 0}</td>
            <td>${byte & bitPatterns.Left ? 1 : 0}</td>
            <td>${(byte & bitPatterns.halt).toString(2).padStart(6, '0')}</td>
          </tr>`
        );
      }
    );

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

$showEmulator.addEventListener('change', (ev) => {
  if (ev.target.checked) {
    $emulator.removeAttribute('srcDoc');
    $emulator.setAttribute('src', iframeSrc);
  } else {
    $emulator.setAttribute(
      'srcdoc',
      'Emulator can be activated with the check box above'
    );
    $emulator.removeAttribute('src');
  }
});
