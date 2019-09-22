import Spot from './Spot'

const sketch = (p) => {
	var canvas
	const border = 6
	const width = p.windowWidth
	const height = p.windowHeight
	const boxSize = 16
	const numRows = Math.floor(height / boxSize)
	const numCols = Math.floor(width / boxSize)
	const startRow = Math.floor(numRows/2)
	const startCol = Math.floor(numCols/4)
	const endRow = startRow
	const endCol = 3*startCol
	const speed = 150
	var grid = []
	var queue = []
	var anim = false
	var recalculate = false
	var type = ''
	var clear = true
	var prevSpot = null
	var currSpot = null
	var openSet = new Set()
	var closedSet = new Set()

	document.oncontextmenu = () => {
	    return false;
	}

	p.setup = () => {
		canvas = p.createCanvas(width, height)
		for(var i = 0; i < numRows; i++){
			var newRow = []
			for(var j = 0; j < numCols; j++){
				newRow.push(new Spot(i, j))
			}
			grid.push(newRow)
		}

		grid[startRow][startCol].label = 1
		grid[endRow][endCol].label = 2

		grid[startRow][startCol].gScore = 0
		grid[startRow][startCol].fScore = h(startRow, startCol)
		queue.push(grid[startRow][startCol])
		openSet.add(grid[startRow][startCol])
	}

	const resetGrid = () => {
		for(var i = 0; i < numRows; i++){
			for(var j = 0; j < numCols; j++){
				grid[i][j].state = 0
				grid[i][j].prev = null
				grid[i][j].gScore = Infinity
				grid[i][j].fScore = Infinity
			}
		}

		grid[startRow][startCol].gScore = 0
		grid[startRow][startCol].fScore = h(startRow, startCol)
	}

	const searchIter = () => {
		if(type === 'dfs' || type === 'bfs'){
			currSpot = type === 'bfs' ? queue.shift() : queue.pop()
			if(currSpot.state === 0 && currSpot.label !== -1){
				if(currSpot.label === 2){
					anim = false
					highlightPath(currSpot.row, currSpot.col, 2)
					// p.noLoop()
					return true
				}
				currSpot.state = 1
				enqueue(currSpot.row+1, currSpot.col, currSpot)
				enqueue(currSpot.row-1, currSpot.col, currSpot)
				enqueue(currSpot.row, currSpot.col-1, currSpot)
				enqueue(currSpot.row, currSpot.col+1, currSpot)
			}
		}
		else if(type === 'a*' || true){
			currSpot = [...openSet].reduce((val, candidate) => {
				if(val === null || candidate.fScore < val.fScore){
					return candidate
				}
				return val
			}, null)
			if(currSpot.label === 2){
				anim = false
				highlightPath(currSpot.row, currSpot.col, 2)
				// p.noLoop()
				return true
			}
			currSpot.state = 1
			openSet.delete(currSpot)
			closedSet.add(currSpot)
			for(var [rowDir, colDir] of [[-1,0],[1,0],[0,-1],[0,1]]){
				var r = currSpot.row+rowDir
				var c = currSpot.col+colDir
				if(r < 0 || r >= numRows || c < 0 || c >= numCols || grid[r][c].label === -1) continue
				var neighbor = grid[r][c]
				if(closedSet.has(neighbor)) continue
				var tentativeScore = currSpot.gScore + 1
				if(tentativeScore < neighbor.gScore){
					neighbor.prev = currSpot
					neighbor.gScore = tentativeScore
					neighbor.fScore = tentativeScore + h(neighbor.row, neighbor.col)
					openSet.add(neighbor)
				}
			}
		}
		return false
	}

	p.myCustomRedrawAccordingToNewPropsHandler = (newProps) => {
		if(canvas){
			prevSpot = null
			// clear out the old grid
			resetGrid()

			// start a new animation
			if(newProps.anim){
				queue = [grid[startRow][startCol]]
				openSet = new Set(queue)
				closedSet.clear()
				type = newProps.type
				anim = true
				clear = false
			}
			else{
				anim = false
				clear = true
				if(newProps.type === 'clearAll'){
					for(var i = 0; i < numRows; i++){
						for(var j = 0; j < numCols; j++){
							if(grid[i][j].label === -1){
								grid[i][j].label = 0
							}
						}
					}
				}
			}
			// p.loop()
		}
	}
	// heuristic function, currently Manhattan distance
	const h = (row, col) => {
		return Math.abs(row - endRow) + Math.abs(col - endCol)
	}

	const enqueue = (row, col, prev) => {
		if(row < 0 || row >= numRows || col < 0 || col >= numCols || grid[row][col].state !== 0){
			return
		}
		queue.push(grid[row][col])
		// grid[row][col].state = 1
		grid[row][col].prev = prev
	}
	const highlightPath = (row, col, state) => {
		var spot = grid[row][col]
		while(spot !== null){
			spot.state = state
			spot = spot.prev
		}
	}
	const handleClick = () => {
		if(!anim){
			var row = Math.floor((p.mouseY-border)/boxSize)
			var col = Math.floor((p.mouseX-border)/boxSize)
			if(row < 0 || row >= numRows || col < 0 || col >= numCols){
				return
			}
			if(grid[row][col].label === 0 && p.mouseButton === 'left'){
				grid[row][col].label = -1
				grid[row][col].sizeOffset = 4
			}
			else if(grid[row][col].label === -1 && p.mouseButton === 'right'){
				grid[row][col].label = 0
			}
			if(!clear){
				recalculate = true
			}
			// p.loop()
		}
	}
	p.mousePressed = handleClick
	p.mouseDragged = handleClick
	p.draw = () => {
		p.background('#f5f5f5')
		p.noFill()
		p.stroke(0)
		p.strokeWeight(2)
		// get rid of previous path's highlighting
		if(prevSpot !== null){
			highlightPath(prevSpot.row, prevSpot.col, 1)
			prevSpot = null
		}
		// iterate `speed` number of times if possible
		for(var ii = 0; ii < speed && anim && queue.length > 0 && openSet.size > 0; ii++){
			if(searchIter()) break
		}
		// highlight the current path being explored
		if(currSpot != null){
			highlightPath(currSpot.row, currSpot.col, 2)
			prevSpot = currSpot
		}

		// fully calculate a search, don't animate it
		if(recalculate){
			resetGrid()
			queue = [grid[startRow][startCol]]
			openSet = new Set(queue)
			closedSet.clear()
			while(queue.length > 0 && openSet.size > 0){
				if(searchIter()) break
			}
			recalculate = false
		}
		// draw the grid
		var spot
		for(var i = 0; i < numRows; i++){
			for(var j = 0; j < numCols; j++){
				spot = grid[i][j]
				switch(spot.state){
					case 0:
						p.fill(150,150,150)
						break
					case 1:
						p.fill(255, 255, 0)
						break
					case 2:
						p.fill(0, 0, 255)
						break
					case 3:
						p.fill(255, 150, 0)
						break
					default:
						p.fill(255)
						break
				}
				switch(spot.label){
					case -1:
						p.fill(0)
						break
					case 1:
						p.fill(0, 255, 0)
						break
					case 2:
						p.fill(255, 0, 0)
						break
					default:
						break
				}
				p.rect(border+j*boxSize, border+i*boxSize, boxSize, boxSize)
			}
		}
		for(i = 0; i < numRows; i++){
			for(j = 0; j < numCols; j++){
				spot = grid[i][j]
				switch(spot.state){
					case 0:
						p.fill(150,150,150)
						break
					case 1:
						p.fill(255, 255, 0)
						break
					case 2:
						p.fill(0, 0, 255)
						break
					case 3:
						p.fill(255, 150, 0)
						break
					default:
						p.fill(255)
						break
				}
				switch(spot.label){
					case -1:
						p.fill(0)
						break
					case 1:
						p.fill(0, 255, 0)
						break
					case 2:
						p.fill(255, 0, 0)
						break
					default:
						break
				}
				if(spot.sizeOffset > 0){
					p.rect(border+j*boxSize-(spot.sizeOffset/2), border+i*boxSize-(spot.sizeOffset/2), boxSize+spot.sizeOffset, boxSize+spot.sizeOffset)
					spot.sizeOffset -= 1
					if(spot.sizeOffset < 0){
						spot.sizeOffset = 0
					}
				}
			}
		}
	}
}

export default sketch
