import './App.css';
import { useState, useEffect } from 'react';

function App() {
  function isTileInUse(grid, [row, col]) {
    // Out-of-bounds squares are always in use
    if (row < 0 || col < 0 || row >= 4 || col >= 4) {
      return true;
    }
    return grid[row][col] !== null;
  }

  function getTileValue(grid, [row, col]) {
    // Out-of-bounds squares have value null
    if (row < 0 || col < 0 || row >= 4 || col >= 4) {
      return null;
    }
    return grid[row][col];
  }

  function setTileValue(grid, [row, col], value) {
    // Out-of-bounds squares
    if (row < 0 || col < 0 || row >= 4 || col >= 4) {
      return;
    }
    grid[row][col] = value;
  }

  function getRandomSquare() {
    let cell = Math.floor(Math.random() * 16);
    if (cell === 16) {
      cell = 15;
    }
    return [Math.floor(cell / 4), cell % 4];
  }

  function spawnNewTile(grid) {
    // Check if there is no space
    if (isGameOver(grid)) return;

    // Find an empty square
    let target;
    while (isTileInUse(grid, target = getRandomSquare()));

    let [row, col] = target;
    grid[row][col] = 2;
    return grid;
  }

  function isGameOver(grid) {
    for (const row of [0, 1, 2, 3]) {
      for (const col of [0, 1, 2, 3]) {
        // Blank tiles means it's not over
        if (!isTileInUse(grid, [row, col])) {
          return false;
        }
        // Check if it can be combined with its neighbours
        for (const [rOff, cOff] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          if (
            getTileValue(grid, [row, col])
            === getTileValue(grid, [row + rOff, col + cOff])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function moveTiles(grid, rowOffset, colOffset) {
    // Change loop direction based on direction we're moving
    let loopDirection;
    if (rowOffset === -1 | colOffset === -1) {
      loopDirection = [0, 1, 2, 3];
    } else {
      loopDirection = [3, 2, 1, 0];
    }

    // Keep track of which tiles can be combined into
    const combineAllowed = [
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
    ]

    for (const col of loopDirection) {
      for (const row of loopDirection) {
        let startingSquare = [row, col];
        let resultSquare = startingSquare;

        while (true) {
          startingSquare = resultSquare;
          resultSquare = [startingSquare[0] + rowOffset, startingSquare[1] + colOffset];
          // If there is a tile to move
          if (isTileInUse(grid, startingSquare)) {
            // Try and move it to the result square
            if (isTileInUse(grid, resultSquare)) {
              // There's a tile in our way - try and combine
              const requiredValue = getTileValue(grid, resultSquare);
              if (getTileValue(grid, startingSquare) === requiredValue) {
                // Only allowed to combine each tile once
                // [- 2 2 4] => [- - 4 4], not [- - - 8]
                if (!combineAllowed[resultSquare[0]][resultSquare[1]]) {
                  break;
                }
                setTileValue(grid, resultSquare, requiredValue * 2);
                setTileValue(grid, startingSquare, null);
                // Prevent people from combining with us
                combineAllowed[resultSquare[0]][resultSquare[1]] = false;
              }
              // If we combined, we can't move this tile anymore
              break;
            } else {
              // No tile in our way - move it
              setTileValue(grid, resultSquare, getTileValue(grid, startingSquare));
              setTileValue(grid, startingSquare, null);
            }
          } else {
            // No tile, nothing to do
            break;
          }
        }

      }
    }
  }

  // Start with two tiles
  let [grid, setGrid] = useState(
    spawnNewTile(spawnNewTile([
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]))
  );

  let [numMoves, setNumMoves] = useState(0);

  const keyDownHandler = event => {
    switch (event.code) {
      case "ArrowUp":
        moveTiles(grid, -1, 0);
        break;
      case "ArrowDown":
        moveTiles(grid, 1, 0);
        break;
      case "ArrowLeft":
        moveTiles(grid, 0, -1);
        break;
      case "ArrowRight":
        moveTiles(grid, 0, 1);
        break;
      default:
        return;
    }
    spawnNewTile(grid);
    // https://stackoverflow.com/a/63092436/6335363
    setGrid([...grid]);
    setNumMoves(numMoves + 1);
  };

  // https://stackoverflow.com/a/46123962/6335363
  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler, false);

    return () => {
      document.removeEventListener("keydown", keyDownHandler, false);
    };
  });

  return (
    <div className="App">
      <h1>2048</h1>

      <table>
        {grid.map(
          row => <tr>{
            row.map(value => {
              return value === null
              ? <td width={50} height={50}>-</td>
              : <td width={50} height={50}>{value}</td>;
            })
          }</tr>
        )}
      </table>
      {isGameOver(grid) ? <h2>Game over</h2> : <></>}
      <p>Number of moves: {numMoves}</p>
    </div>
  );
}

export default App;
