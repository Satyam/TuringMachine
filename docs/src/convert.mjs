#!/usr/bin/env zx
import { parseTable, generateBytes } from './table2bytes.mjs';

const PROGRAMS_SIZE = 128;
const TABLE_NAME = 'turing.program';
const IN_FILE_EXT = '.txt';
const OUT_FILE_EXT = '.bytes';

const [inFileName, outFileName] = processArgs();

const programs = await fs.readFile(inFileName, 'utf8');

let hasError = false;

const rxSeparator = /^\s*-{3,}\s*$/;
const rxInternalComment = /^\s*##/;
const rxEchoedComment = /^\s*#(?!#)\s*(.*)$/;
const rxState =
  /(?<state>\w+)\s+(?<symbol>0|1)\s+(?<print>-|0|1)\s+(?<op>-|L|R)\s+(?<next>\w+)$/i;

const stateTable = [];
const comments = [];
let outputBytes = [];
let programNumber = 0;

programs
  .split('\n')
  .map((line) => line.trim())
  .forEach((line, lineNum) => {
    try {
      if (line.length === 0) return;
      if (rxSeparator.test(line)) {
        processProgram();
        return;
      }
      if (rxInternalComment.test(line)) {
        // Ignore
        return;
      }
      const m = rxEchoedComment.exec(line);
      if (m) {
        comments.push(m[1]);
        return;
      }
      const s = rxState.exec(line);
      if (s) {
        stateTable.push(line);
      }
    } catch (err) {
      console.error(chalk.red(`${err} in:\n[${lineNum}]: ${line}`));
      hasError = true;
    }
  });
processProgram();

if (hasError) {
  console.error('No output due to errors');
  process.exit(1);
}

echo(`
================
Output file: ${outFileName}`);

await fs.writeFile(
  outFileName,
  outputBytes.map((byte) => `0x${byte.toString(16)}`).join(' ')
);

process.exit(0);

function processProgram() {
  if (stateTable.length)
    echo(`
-----------
Program Selector: ${programNumber.toString(2).padStart(3, 0)}
${comments.join('\n')}`);
  if (stateTable.length === 0) {
    throw new Error('State table empty');
  }
  const bytes = generateBytes(parseTable(stateTable.join('\n')));

  outputBytes = outputBytes.concat(
    bytes,
    Array(PROGRAMS_SIZE - bytes.length).fill(0)
  );
  stateTable.length = 0;
  comments.length = 0;
  programNumber++;
}

function processArgs() {
  if (argv.h) {
    showHelp();
    process.exit(0);
  }

  const fileName = argv._[0] || TABLE_NAME + IN_FILE_EXT;

  let inFile;
  let outFile;

  if (path.extname(fileName)) {
    inFile = fileName;
    outFile = path.basename(fileName, path.extname(fileName)) + OUT_FILE_EXT;
  } else {
    inFile = fileName + IN_FILE_EXT;
    outFile = fileName + OUT_FILE_EXT;
  }

  if (argv.o) {
    outFile = argv.o;
    if (!path.extname(outFile)) outFile = outFile + OUT_FILE_EXT;
  }
  return [inFile, outFile];
}

function showHelp() {
  echo(`Usage
  convert [source] [options]
    
    Converts a file with one or more programs in the source file into 
    a sequence of bytes that can be loaded into EEPROM of the Turing Machine emulator

  [source]  Name of the file containing the programs.
            If omitted "${TABLE_NAME}${IN_FILE_EXT}" will be used.
            If the extension is omitted, "${IN_FILE_EXT}" will be appended to the given base name

  Options:
    -h            Shows this message and exits.
    -o <filename> Name of the file to receive the string of bytes for the EEPROM.
                  If omitted, the base name of the source file will be used.
                  If no extension is given "${OUT_FILE_EXT}" will be appended.

  Programs file format

    The file should contain one or more programs in the form of States Tables separated 
    from one another by a line of at least three dashes.
    Lines with a hash sign # as the first non-blank character are echoed to the console
    Lines with two hash signs ## as the first non-blank character are skipped.
    Hash signs can also be used to add comments after a state line.

      # this line will be echoed to the console
      ## this line will be ignored.
          # This line will be echoed to the console without the spaces before the #
      s0 0 1 L s2  #   this line represents a state, but anything after the # is ignored.

    A program is represented as a table of states and their actions
    State lines should contain the following information with each individual part separated by one or more spaces.
    All lines are converted to lowercase when read.

    state:      A label to identify this state.  The first line will be the initial state of the program.
    symbol:     The symbol read from the tape, a 1 representing a Mark and a 0 representing a blank.
                There must be two lines per state, one for 0 and another for 1. They can be in any order.
    print:      Either a 0, 1 or - indicating what symbols should be written into the tape, 
                can be a 0 (blank) a 1 (mark) or a - meaning don't change what is already in that cell.
    move:       Either an L, R or - indicating in which direction, ie.: left (L), right (R) it should move the tape
                or a dash (-) when it shouldn't move.
    nextState:  A label for the next state it should jump to.  Must be one declared in the first column,
                or the keyword HALT (either upper or lower case), signalling the end of the program

  Sample program file:
  
      # name: Copy
      # Initial values: xX[x]
      ##State  Symbol   Print   Move     Next State
      s1      0        -       -            Halt
      s1      1        0       R            s2
      s2      0        0       R            s3
      s2      1        1       R            s2
      s3      0        1       L            s4
      s3      1        1       R            s3
      s4      0        0       L            s5
      s4      1        1       L            s4
      s5      0        1       R            s1
      s5      1        1       L            s5
      ----
      # name: Busy_Beaver
      # No initial values
      ##State  Symbol   Print   Move    Next State
      A        0       1       L         B
      A        1       1       R         C
      B        0       1       R         A
      B        1       1       L         B
      C        0       1       R         B
      C        1       1       -         Halt

        
  Usage Examples:

    ./convert

      It will convert the file "${TABLE_NAME}${IN_FILE_EXT}" and sends the string 
      of bytes "${TABLE_NAME}${OUT_FILE_EXT}"

    ./convert test

      Converts "test${IN_FILE_EXT}" and sends the output to "test${OUT_FILE_EXT}"

    ./convert test${IN_FILE_EXT} -o plain

      Converts "test${IN_FILE_EXT}" and sends the output to "plain${OUT_FILE_EXT}"

    ./convert test.txt -o plain.txt

      Converts "test.txt" and sends the output to "plain.txt"

`);
}
