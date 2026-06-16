# A simple Turing machine.

This in an exercise to make an digital circuit that can show a Turing Machine in operation.
It includes the Turing Machine itself and an electronic *tape*.

It uses [CircuitVerse](https://circuitverse.org/), an online digital circuit emulation and can be found [here](https://circuitverse.org/users/393554/projects/turing-machine-68b18b14-174b-450a-bf01-8f8b94b983d0)

It should be possible to view it in the box right below, otherwise use the link above and go to CircuitVerse itself.

<iframe 
  src="https://circuitverse.org/simulator/embed/turing-machine-68b18b14-174b-450a-bf01-8f8b94b983d0?theme=&display_title=false&clock_time=true&fullscreen=true&zoom_in_out=true" 
  style="border-width:; border-style: ; border-color:;" 
  name="myiframe" 
  id="projectPreview" 
  scrolling="no" 
  frameborder="1" 
  marginheight="0px" 
  marginwidth="0px" 
  height="500" 
  width="500" 
  allowFullScreen
></iframe>

## Description

The tape is at the bottom made up of two sub-circuits, one for the main  cell (the one in the middle) called the Head since there is where the read/write head is and any number of extra cells at either side.   

There are two further cells, one at each end, that are the Overflow cells.  If a program pushes the 1s in the cells past the end, they will light and halt the machine.

Cells are designed so that they can be connected on its sides to its neighbors.  The cells, obviously don't move (like in a real tape) but its contents do.  Zeros are shifted in from the left and right as if the tape has no further marks at either end. 

An ideal Turing Machine should have and infinite tape, which is not realistically possible so, when the tapes moves, bits might spill over the ends.  If this happens, the LEDs at either end will light up and the whole machine will be halted so you can check what happened.  

There is a LED labeled Halted to the center left.  If it lights up it means the program is halted.  If the LEDs at either end of the tape are off, then it is a successful stop.  If either is lit, there was an overflow. 

Labeled boxes are all around showing the values at different points in the circuit.  They are for debugging purposes and do not affect the operation. 

There is a simple sequencer that pulses for each of the four steps for each cycle

1. Read the symbol at the head.
1. Print a new value, or leave it like it is.
1. Move the tape left or right
1. Jump to the new state

The states are stored in the EEPROM on the top-right.  It has plenty of memory for multiple programs.  The memory addresses are split like this:

* Program: 3 bits or 8 different programs that can be stored.
* States: 6 bits for a total of 64 machine states
* Symbol: 1 bit for the symbol, 0 or 1, under the head, which determines which operations to execute for the given state.
  
The output of the memory is used to command the actions of the machine,

* Next State: 6 bits, the state that follows the current one.  The state 0x3f or decimal 63 (all bits one) is reserved for HALT, which means the program has finished.
* Print: The symbol (0 or 1) to print on the tape at the current location
* DirL: Direction to move the tape.  0 means right, 1 means left
* Write: If 1, the value in Print is actually printed on the tape, if 0, it is left as-is.
* Move: Likewise, the tape is not always moved so this bit says if it moves and DirL tells which way.
  
## Operation

Select a program to run with the input box pointed at by the red arrow labeled  Program Select.

Select the initial values for the tape in the boxes at the bottom of the screen, pointed at by the arrow labeled Initial Values.

Press the Reset button to the bottom left.

Program has finished when the red Halted LED turns on.  Check the LEDs at both ends of the tape to make sure it hasn't overflowed.

You may restart the program at any time with the Reset button.

## Programs

* 000: Copy.  Set a pattern of up to four consecutive 1s from the central Head cell of the tape to the left.  The program will create a copy of the set. The limitation of 4 is because the tape is not infinite as it theoretically should.  With more than four 1s, it will overflow on the right.

* 001: Busy Beaver: Set all the initial values to 0.  The program will weave its way to produce 6 consecutive cells on.

* 010: An alternate copy, it allows 1s to be anywhere to the left of the Head.  It just has an extra state at the start that moves the tape to the right when it sees a 0 and goes to the same copy algorithm at 000 when it reaches the first 1.

* 011: Test that the machine detects an overflow on the right.  The machine will be halted with the rightmost LED on.

* 100: Test that the machine detects an overflow on the left.  The machine will be halted with the leftmost LED on.

The first two programs were taken from the Wikipedia article: [Turing machine examples](https://en.wikipedia.org/wiki/Turing_machine_examples)

It is better to go Full Screen and select a clock speed of about 50, with the default value of 500 it takes too long.

## Stretching the tape

To change the circuit you will have to clone the project as the original cannot be edited. 

To extend the tape, select and drag either end cell away to make space for the cells to be inserted.  Make sure to move it horizontally so the connecting wires don't get tangled.

Delete the wires on the side that connects it to its neighbor.  There is no need to delete the wires coming from above.

Select any of the intermediate cells by clicking on it (not the main one, nor the end ones) copy it and paste it in any empty space.  This is because it is hard to paste it in the right place at once.  Select that copy and the drag it until the edges of the added cell touch the existing tape.  You may paste and drag as many copies as you want.  Then, drag the end cell you moved aside so it touches the last added cell.   Once again, move it horizontally so the wires don't get messed up.

Draw the bus wires from above the new cells (DirL, Move and Reset) to the connecting points on the top edge.

Select any of the existing LEDs and copy and paste it anywhere empty.  Then select it again and drag it so it plugs into the connection labeled LED in the added cells.

If you want your cells to eventually get initial values set, copy the input boxes from anywhere.

There can only be one Main Cell and one of either type of end cells at the left and right edges. All the cells except for those are exactly the same.

As an alternative, you may do a multiple select by dragging a selection box starting from an empty space and with the shift key pressed, enclosing both the cell, the LED inside and the Initial Value box bellow so, when you paste the new cells into the circuit, the LED and the input box goes with it.  Likewise you may use the multiple select to pick more than one cell (and its LEDs and input boxes) and copy and paste them all at once. 