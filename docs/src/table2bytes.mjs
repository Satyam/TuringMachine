const bitPatterns = {
  write: 1 << 6,
  move: 1 << 7,
  dataOne: 1 << 8,
  dataZero: 0,
  dirRight: 0,
  dirLeft: 1 << 9,
  halt: 0b111111,
};

const rxSep = /\s+/;
const rxSymbol = /^[01]$/;
const rxPrint = /^[01\-]$/;
const rxMove = /^[lr\-]$/i;
export function parseTable(statesTable) {
  const states = {};

  statesTable
    .split('\n')
    .map((line) => line.split('#')[0].trim())
    .filter((line) => line.length)
    .forEach((line, i) => {
      try {
        const [state, symbol, print, move, next] = line
          .trim()
          .toLowerCase()
          .split(/\s+/);
        if (!rxSymbol.test(symbol)) {
          throw new Error(`Symbol must be either 0 or 1, found ${symbol}`);
        }
        if (!rxPrint.test(print)) {
          throw new Error(`Print must be either 0,  1 or - , found ${print}`);
        }
        if (!rxMove.test(move)) {
          throw new Error(
            `Move must be either L, R  or - either upper or lowercase, found ${print}`
          );
        }

        if (!(state in states)) {
          states[state] = [];
        }
        const sts = states[state];
        if (sts[parseInt(symbol)]) {
          throw new Error(`duplicate symbol ${symbol} for state ${state}`);
        }
        sts[parseInt(symbol)] = [print, move, next, line, i];
      } catch (err) {
        throw new Error(`${err.message}  in line \n[${i + 1}]: ${line}`);
      }
    });
  for (const [state, entries] of Object.entries(states)) {
    if (entries.length !== 2) {
      const [print, move, next, line, i] = entries.pop();
      throw new Error(
        `There must always be two entries per symbol, found only this: \n[${i + 1}]: ${line} `
      );
    }
    for (const [print, move, next, line, i] of entries) {
      if (next !== 'halt' && !(next in states)) {
        throw new Error(
          `Next state ${next} not found in table in\n[${i + 1}]: ${line} `
        );
      }
    }
  }
  return states;
}

export function generateBytes(states) {
  const keys = Object.keys(states);
  return keys
    .map((k) => {
      return states[k].map(([print, move, next, line], symbol) => {
        let byte = 0;
        if (next === 'halt') {
          byte = bitPatterns.halt;
        } else {
          switch (print) {
            case '0':
              byte += bitPatterns.dataZero + bitPatterns.write;
              break;
            case '1':
              byte += bitPatterns.dataOne + bitPatterns.write;
              break;
            case '-':
              break;
          }
          switch (move) {
            case 'l':
              byte += bitPatterns.dirLeft + bitPatterns.move;
              break;
            case 'r':
              byte += bitPatterns.dirRight + bitPatterns.move;
              break;
            case '-':
              break;
          }
          byte += keys.indexOf(next);
        }

        return byte;
      });
    })
    .flat();
}
