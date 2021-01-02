let canvas;
const border = 0;
let width, height;
const boxSize = 16;
let numRows, numCols;
let startSpot, endSpot;
let startRow, startCol;
let endRow, endCol;
const speed = 150;
let grid = [];
let queue = [];
let animateSearch = false;
let recalculate = false;
let type = "";
let clear = true;
let prevSpot = null;
let currSpot = null;
let openSet = new Set();
let closedSet = new Set();

const Values = {
    NONE: 0,
    EMPTY: 1,
    WALL: 2,
    START: 3,
    END: 4,
};

const State = {
    UNVISITED: 0,
    VISITED: 1,
    PATH: 2,
};

class Spot {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.state = State.UNVISITED;
        this.label = Values.EMPTY;
        this.prev = null;
        this.gScore = Infinity;
        this.fScore = Infinity;
        this.sizeOffset = 0;
    }
}

/**
 * Function to get the height of the sketch.
 * Modify this if embedding this somewhere
 */
const getHeight = () => {
    return window.innerHeight;
};

function setup() {
    noLoop();
    width = window.innerWidth;
    height = getHeight();

    numRows = Math.floor(height / boxSize);
    numCols = Math.floor(width / boxSize);

    startRow = Math.floor(numRows / 2);
    startCol = Math.floor(numCols / 4);
    endRow = startRow;
    endCol = 3 * startCol;

    canvas = createCanvas(width, height);
    for (let i = 0; i < numRows; i++) {
        let newRow = [];
        for (let j = 0; j < numCols; j++) {
            newRow.push(new Spot(i, j));
        }
        grid.push(newRow);
    }

    startSpot = grid[startRow][startCol];
    endSpot = grid[endRow][endCol];

    startSpot.label = Values.START;
    endSpot.label = Values.END;
    startSpot.gScore = 0;
    startSpot.fScore = h(startRow, startCol);
    queue.push(startSpot);
    openSet.add(startSpot);
}

function windowResized() {
    grid = [];
    width = window.innerWidth;
    height = getHeight();

    numRows = Math.floor(height / boxSize);
    numCols = Math.floor(width / boxSize);

    startRow = Math.floor(numRows / 2);
    startCol = Math.floor(numCols / 4);
    endRow = startRow;
    endCol = 3 * startCol;

    for (let i = 0; i < numRows; i++) {
        let newRow = [];
        for (let j = 0; j < numCols; j++) {
            newRow.push(new Spot(i, j));
        }
        grid.push(newRow);
    }

    clear = true;
    animateSearch = false;
    recalculate = false;
    clicked = [];

    startSpot = grid[startRow][startCol];
    endSpot = grid[endRow][endCol];

    startSpot.label = Values.START;
    endSpot.label = Values.END;
    startSpot.gScore = 0;
    startSpot.fScore = h(startRow, startCol);
    queue.push(startSpot);
    openSet.add(startSpot);
    closedSet.clear();
    resizeCanvas(width, height);
}

const resetGrid = () => {
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            grid[i][j].state = State.UNVISITED;
            grid[i][j].prev = null;
            grid[i][j].gScore = Infinity;
            grid[i][j].fScore = Infinity;
        }
    }

    startSpot.gScore = 0;
    startSpot.fScore = h(startRow, startCol);
};

const searchIter = () => {
    if (type === "dfs" || type === "bfs") {
        currSpot = type === "bfs" ? queue.shift() : queue.pop();
        if (
            currSpot.state === State.UNVISITED &&
            currSpot.label !== Values.WALL
        ) {
            if (currSpot.label === Values.END) {
                animateSearch = false;
                highlightPath(currSpot.row, currSpot.col, State.PATH);
                if (!recalculate) {
                    noLoop();
                }
                return true;
            }
            currSpot.state = State.VISITED;
            enqueue(currSpot.row + 1, currSpot.col, currSpot);
            enqueue(currSpot.row - 1, currSpot.col, currSpot);
            enqueue(currSpot.row, currSpot.col - 1, currSpot);
            enqueue(currSpot.row, currSpot.col + 1, currSpot);
        }
    } else if (type === "a*" || true) {
        currSpot = [...openSet].reduce((val, candidate) => {
            if (val === null || candidate.fScore < val.fScore) {
                return candidate;
            }
            return val;
        }, null);
        if (currSpot.label === Values.END) {
            animateSearch = false;
            highlightPath(currSpot.row, currSpot.col, State.PATH);
            if (!recalculate) {
                noLoop();
            }
            return true;
        }
        currSpot.state = State.VISITED;
        openSet.delete(currSpot);
        closedSet.add(currSpot);
        for (let [rowDir, colDir] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ]) {
            let r = currSpot.row + rowDir;
            let c = currSpot.col + colDir;
            if (
                r < 0 ||
                r >= numRows ||
                c < 0 ||
                c >= numCols ||
                grid[r][c].label === Values.WALL
            )
                continue;
            let neighbor = grid[r][c];
            if (closedSet.has(neighbor)) continue;
            let tentativeScore = currSpot.gScore + 1;
            if (tentativeScore < neighbor.gScore) {
                neighbor.prev = currSpot;
                neighbor.gScore = tentativeScore;
                neighbor.fScore =
                    tentativeScore + h(neighbor.row, neighbor.col);
                openSet.add(neighbor);
            }
        }
    }
    return false;
};

// heuristic function, currently just Manhattan distance
const h = (row, col) => {
    return Math.abs(row - endRow) + Math.abs(col - endCol);
};

const enqueue = (row, col, prev) => {
    if (
        row < 0 ||
        row >= numRows ||
        col < 0 ||
        col >= numCols ||
        grid[row][col].state !== State.UNVISITED
    ) {
        return;
    }
    queue.push(grid[row][col]);
    grid[row][col].prev = prev;
};
const highlightPath = (row, col, state) => {
    let spot = grid[row][col];
    while (spot !== null) {
        spot.state = state;
        spot = spot.prev;
    }
};

let dragging = Values.NONE;
let clicked = [];
const handleClick = (e) => {
    // do nothing if animating, a right click, or non-canvas element clicked
    if (animateSearch || mouseButton === "right" || e.target !== canvas.canvas)
        return;
    // validate click location
    let row = Math.floor((mouseY - border) / boxSize);
    let col = Math.floor((mouseX - border) / boxSize);
    if (row < 0 || row >= numRows || col < 0 || col >= numCols) {
        return;
    }
    if (dragging === Values.NONE) {
        // if not currently dragging
        if (grid[row][col].label === Values.EMPTY) {
            // click an empty space => place wall
            dragging = Values.WALL;
            grid[row][col].label = Values.WALL;
            grid[row][col].sizeOffset = 4;
            clicked.push(grid[row][col]);
        } else if (grid[row][col].label === Values.WALL) {
            // click a wall => remove wall
            dragging = Values.EMPTY;
            grid[row][col].label = Values.EMPTY;
            draw();
        } else {
            // click start or end => do nothing for now
            dragging = grid[row][col].label;
        }
    } else if (dragging === Values.WALL) {
        // if dragging walls
        if (grid[row][col].label === Values.EMPTY) {
            // dragged over empty square => place wall
            grid[row][col].label = Values.WALL;
            grid[row][col].sizeOffset = 4;
            clicked.push(grid[row][col]);
        }
    } else if (dragging === Values.EMPTY) {
        // if clearing walls
        if (grid[row][col].label === Values.WALL) {
            // dragged over a wall => remove wall
            grid[row][col].label = Values.EMPTY;
            draw();
        }
    } else {
        // if moving the start/end
        if (grid[row][col].label === Values.EMPTY) {
            // dragged over empty square => move start/end
            grid[row][col].label = dragging;
            if (dragging === Values.START) {
                // dragging the start
                grid[startRow][startCol].label = Values.EMPTY;
                startRow = row;
                startCol = col;
                startSpot = grid[row][col];
            } else if (dragging === Values.END) {
                // dragging the end
                grid[endRow][endCol].label = Values.EMPTY;
                endRow = row;
                endCol = col;
                endSpot = grid[row][col];
            }
            draw();
        }
    }

    if (!clear) {
        recalculate = true;
        draw();
    }
    if (clicked.length > 0) {
        loop();
    }
};

function mousePressed(e) {
    handleClick(e);
}
function mouseDragged(e) {
    handleClick(e);
}
function mouseReleased() {
    dragging = Values.NONE;
}

/**
 * Setup the button controls
 */

const newAnimation = (newType) => () => {
    if (!canvas) return;
    prevSpot = null;
    resetGrid();
    queue = [startSpot];
    openSet = new Set(queue);
    closedSet.clear();
    type = newType;
    animateSearch = true;
    clear = false;
    loop();
};

const clearGrid = (clearAll) => () => {
    if (!canvas) return;
    prevSpot = null;
    resetGrid();
    animateSearch = false;
    clear = true;
    if (clearAll) {
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                if (grid[i][j].label === Values.WALL) {
                    grid[i][j].label = Values.EMPTY;
                }
            }
        }
    }
    draw();
};

const buttonDiv = document.querySelector(".buttons");
const dfsBtn = document.getElementById("dfs");
const bfsBtn = document.getElementById("bfs");
const aStarBtn = document.getElementById("a*");
const clearSearchBtn = document.getElementById("clearSearch");
const clearAllBtn = document.getElementById("clearAll");

dfsBtn.onclick = newAnimation("dfs");
bfsBtn.onclick = newAnimation("bfs");
aStarBtn.onclick = newAnimation("a*");
clearSearchBtn.onclick = clearGrid(false);
clearAllBtn.onclick = clearGrid(true);

function draw() {
    background("#f5f5f5");
    noFill();
    stroke(0);
    strokeWeight(2);

    if (animateSearch) {
        // get rid of previous path's highlighting
        if (prevSpot !== null) {
            highlightPath(prevSpot.row, prevSpot.col, State.VISITED);
            prevSpot = null;
        }
        // iterate `speed` number of times if possible
        for (
            let ii = 0;
            ii < speed && queue.length > 0 && openSet.size > 0;
            ii++
        ) {
            if (searchIter()) break;
        }
        // if the finish is unreachable
        if (animateSearch && (queue.length === 0 || openSet.size === 0)) {
            animateSearch = false;
            noLoop();
            currSpot = null;
        }
        // highlight the current path being explored
        if (currSpot != null) {
            highlightPath(currSpot.row, currSpot.col, State.PATH);
            prevSpot = currSpot;
        }
    }
    // fully calculate a search, don't animate it
    else if (recalculate) {
        resetGrid();
        queue = [startSpot];
        openSet = new Set(queue);
        closedSet.clear();
        while (queue.length > 0 && openSet.size > 0) {
            if (searchIter()) break;
        }
        recalculate = false;
    }
    // draw the grid
    let spot;
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            spot = grid[i][j];
            switch (spot.state) {
                case State.UNVISITED:
                    fill(150, 150, 150);
                    break;
                case State.VISITED:
                    fill("#f5dd42");
                    break;
                case State.PATH:
                    fill("#4842f5");
                    break;
                default:
                    fill(255);
                    break;
            }
            switch (spot.label) {
                case Values.WALL:
                    fill(0);
                    break;
                case Values.START:
                    fill("#42f563");
                    break;
                case Values.END:
                    fill("#f54242");
                    break;
                default:
                    break;
            }
            rect(border + j * boxSize, border + i * boxSize, boxSize, boxSize);
        }
    }
    // draw clicked spots enlarged
    let next = [];
    while (clicked.length > 0) {
        spot = clicked.pop();
        fill(0);
        rect(
            border + spot.col * boxSize - spot.sizeOffset / 2,
            border + spot.row * boxSize - spot.sizeOffset / 2,
            boxSize + spot.sizeOffset,
            boxSize + spot.sizeOffset
        );
        spot.sizeOffset -= 2.5;
        if (spot.sizeOffset > -2.5) {
            next.push(spot);
        }
    }
    clicked = next;
    if (clicked.length === 0 && !animateSearch) {
        noLoop();
    }
}
