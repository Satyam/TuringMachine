export const bitPatterns = {
  write: 1 << 6,
  move: 1 << 7,
  printOne: 1 << 8,
  printZero: 0,
  dirRight: 0,
  dirLeft: 1 << 9,
  halt: 0b111111,
};

const rxSep = /\s+/;
const rxSymbol = /^[01]$/;
const rxPrint = /^[01\-]$/;
const rxMove = /^[lr\-]$/i;

/**
 * Parses and validates a States Table
 * and returns an array of objects with the values of those entries.
 *
 * @param {String} statesTable - States table as a string
 * @returns {Array} The parsed table as an array of objects.
 * @throws {Error} Various syntax errors.
 */
export function parseTable(statesTable) {
  // A Map is used because it ensures the first item in the states table goes into the very first position in memory.
  // It also allows for all the entries for a state to be together and ordered in memory.
  const statesMap = new Map();

  statesTable
    .split('\n') // Break table into lines
    .map((line) => line.split('#')[0].trim()) // discard comments
    .filter((line) => line.length) // discard empty lines
    .forEach((line, lineNum) => {
      try {
        const [state, sbl, print, move, next] = line // pick up the parts of the line
          .trim() // which has been trimmed
          .toLowerCase() // all entries turned into lower case
          .split(/\s+/); // line split into fields at blank spaces

        // Turn the strings '0' and '1' into actual numbers.
        const symbol = parseInt(sbl, 10);

        // some validations using regular expressions above
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

        // If no entries array exists in the `statesMap`, create one
        if (!statesMap.has(state)) {
          statesMap.set(state, []);
        }

        const stateEntries = statesMap.get(state);

        // Eventually, those lines can be replaced by a single
        //  const stateEntries = statesMap.getOrInsert(state,[]);
        // But it is not yet fully supported

        // Check there is not already an entry for the symbol read
        // Duplicates are not allowed
        if (stateEntries[symbol]) {
          throw new Error(`duplicate symbol ${symbol} for state ${state}`);
        }

        // Enter all the information for that entry in the states table.
        stateEntries[symbol] = {
          state,
          symbol,
          print,
          move,
          next,
          // The following two are added for reference in error messages
          line,
          lineNum,
        };
      } catch (err) {
        // Re-throw the error with extra info
        throw new Error(`${err.message}  in line \n[${lineNum + 1}]: ${line}`);
      }
    });

  // Checks that can only be done once the full table is collected
  statesMap.forEach((entries) => {
    // Ensure there are always two symbols per state
    if (entries.length !== 2) {
      const { line, lineNum } = entries[0];
      throw new Error(
        `There must always be two entries per symbol, found only this: \n[${lineNum + 1}]: ${line} `
      );
    }

    // Ensure that all `next` entries point to declared states
    // Skip on `halt`.
    for (const { next, line, lineNum } of entries) {
      if (next !== 'halt' && !statesMap.has(next)) {
        throw new Error(
          `Next state ${next} not found in table in\n[${lineNum + 1}]: ${line} `
        );
      }
    }
  });

  // No further need for a Map from here on
  // It can be returned as an array
  return Array.from(statesMap.values()).flat();
}

/**
 * Converts the states table into a string of byte codes to upload to the emulator
 * @param {Array} statesArray - As produced by `parseTable`
 * @returns {String} Byte codes to upload to the emulator
 */
export function generateBytes(statesArray) {
  return statesArray.map(({ state, symbol, print, move, next }) => {
    // This is where it will be assembled
    let byte = 0;

    // If the new state is a halt, the other bits don't really matter
    if (next === 'halt') {
      byte = bitPatterns.halt;
    } else {
      // Process the pint part
      // Only order to write the new symbol if it is different from the existing one
      switch (print) {
        case '0':
          if (symbol == 1) byte += bitPatterns.printZero + bitPatterns.write;
          break;
        case '1':
          if (symbol == 0) byte += bitPatterns.printOne + bitPatterns.write;
          break;
        case '-':
          break;
        // default:  no need to contemplate any other alternative since the table has already been validated.
      }

      // Do the moving, if it needs to
      switch (move) {
        case 'l':
          byte += bitPatterns.dirLeft + bitPatterns.move;
          break;
        case 'r':
          byte += bitPatterns.dirRight + bitPatterns.move;
          break;
        case '-':
          break;
        // default:  no need to contemplate any other alternative since the table has already been validated.
      }

      // This searches the `statesArray` for a `state` matching the `next` state
      // It tries to find the index, which corresponds to the memory address in program memory,
      // Since there are two addresses for each `state`, one for each of two `symbol`s
      // it divides the index by two.
      byte += statesArray.findIndex(({ state }) => state === next) / 2;
    }

    return byte;
  });
}
