import Spot from './Spot'

const sketch = (p) => {
	var canvas
	const border = 0
	var width
	var height
	const boxSize = 16
	var numRows
	var numCols
	var startRow
	var startCol
	var endRow
	var endCol
	const speed = 150
	var grid = []
	var queue = []
	var clicked = []
	var animateSearch = false
	var dragging = 0
	var recalculate = false
	var type = ''
	var clear = true
	var prevSpot = null
	var currSpot = null
	var openSet = new Set()
	var closedSet = new Set()
	var startSpot
	var endSpot

	document.oncontextmenu = () => {
	    return false;
	}

	p.setup = () => {
		p.noLoop()
		width = p.windowWidth
		height = p.windowHeight

		numRows = Math.floor(height / boxSize)
		numCols = Math.floor(width / boxSize)

		startRow = Math.floor(numRows/2)
		startCol = Math.floor(numCols/4)
		endRow = startRow
		endCol = 3*startCol

		canvas = p.createCanvas(width, height)
		for(var i = 0; i < numRows; i++){
			var newRow = []
			for(var j = 0; j < numCols; j++){
				newRow.push(new Spot(i, j))
			}
			grid.push(newRow)
		}

		startSpot = grid[startRow][startCol]
		endSpot = grid[endRow][endCol]

		startSpot.label = 1
		endSpot.label = 2
		startSpot.gScore = 0
		startSpot.fScore = h(startRow, startCol)
		queue.push(startSpot)
		openSet.add(startSpot)
	}
	p.windowResized = () => {
		grid = []
		width = p.windowWidth
		height = p.windowHeight

		numRows = Math.floor(height / boxSize)
		numCols = Math.floor(width / boxSize)

		startRow = Math.floor(numRows/2)
		startCol = Math.floor(numCols/4)
		endRow = startRow
		endCol = 3*startCol

		for(var i = 0; i < numRows; i++){
			var newRow = []
			for(var j = 0; j < numCols; j++){
				newRow.push(new Spot(i, j))
			}
			grid.push(newRow)
		}

		clear = true
		animateSearch = false
		recalculate = false
		clicked = []

		startSpot = grid[startRow][startCol]
		endSpot = grid[endRow][endCol]

		startSpot.label = 1
		endSpot.label = 2
		startSpot.gScore = 0
		startSpot.fScore = h(startRow, startCol)
		queue.push(startSpot)
		openSet.add(startSpot)
		closedSet.clear()
		p.resizeCanvas(width, height)
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

		startSpot.gScore = 0
		startSpot.fScore = h(startRow, startCol)
	}

	const searchIter = () => {
		if(type === 'dfs' || type === 'bfs'){
			currSpot = type === 'bfs' ? queue.shift() : queue.pop()
			if(currSpot.state === 0 && currSpot.label !== -1){
				if(currSpot.label === 2){
					animateSearch = false
					highlightPath(currSpot.row, currSpot.col, 2)
					if(!recalculate){
						p.noLoop()
					}
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
				animateSearch = false
				highlightPath(currSpot.row, currSpot.col, 2)
				if(!recalculate){
					p.noLoop()
				}
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
				queue = [startSpot]
				openSet = new Set(queue)
				closedSet.clear()
				type = newProps.type
				animateSearch = true
				clear = false
				p.loop()
			}
			else{
				animateSearch = false
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
				p.draw()
			}
		}
	}
	// heuristic function, currently just Manhattan distance
	const h = (row, col) => {
		return Math.abs(row - endRow) + Math.abs(col - endCol)
	}

	const enqueue = (row, col, prev) => {
		if(row < 0 || row >= numRows || col < 0 || col >= numCols || grid[row][col].state !== 0){
			return
		}
		queue.push(grid[row][col])
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
		if(!animateSearch && (dragging === 0 || dragging === -1)){
			var row = Math.floor((p.mouseY-border)/boxSize)
			var col = Math.floor((p.mouseX-border)/boxSize)
			if(row < 0 || row >= numRows || col < 0 || col >= numCols){
				return
			}
			if(grid[row][col].label === 0 && p.mouseButton === 'left'){
				grid[row][col].label = -1
				grid[row][col].sizeOffset = 4
				dragging = -1
				clicked.push(grid[row][col])
			}
			else if(grid[row][col].label === -1 && p.mouseButton === 'right'){
				grid[row][col].label = 0
				p.draw()
			}
			else if((grid[row][col].label === 1 || grid[row][col].label === 2) && p.mouseButton === 'left' && dragging === 0){
				dragging = grid[row][col].label
			}
			if(!clear){
				recalculate = true
			}
			if(clicked.length > 0){
				p.loop()
			}
		}
		else if(!animateSearch && dragging !== 0){
			// eslint-disable-next-line
			var row = Math.floor((p.mouseY-border)/boxSize)
			// eslint-disable-next-line
			var col = Math.floor((p.mouseX-border)/boxSize)
			if(row < 0 || row >= numRows || col < 0 || col >= numCols || grid[row][col].label !== 0){
				return
			}
			if(dragging === 1){
				grid[startRow][startCol].label = 0
				grid[row][col].label = 1
				startRow = row
				startCol = col
				startSpot = grid[row][col]
				p.draw()
			}
			else if(dragging === 2){
				grid[endRow][endCol].label = 0
				grid[row][col].label = 2
				endRow = row
				endCol = col
				endSpot = grid[row][col]
				p.draw()
			}
			if(!clear){
				recalculate = true
				p.loop()
			}
		}
	}
	const handleRelease = () => {
		dragging = 0
	}
	p.mousePressed = handleClick
	p.mouseDragged = handleClick
	p.mouseReleased = handleRelease
	p.draw = () => {
		p.background('#f5f5f5')
		p.noFill()
		p.stroke(0)
		p.strokeWeight(2)

		if(animateSearch){
			// get rid of previous path's highlighting
			if(prevSpot !== null){
				highlightPath(prevSpot.row, prevSpot.col, 1)
				prevSpot = null
			}
			// iterate `speed` number of times if possible
			for(var ii = 0; ii < speed && queue.length > 0 && openSet.size > 0; ii++){
				if(searchIter()) break
			}
			// if the finish is unreachable
			if(animateSearch && (queue.length === 0 || openSet.size === 0)){
				animateSearch = false
				p.noLoop()
				currSpot = null
			}
			// highlight the current path being explored
			if(currSpot != null){
				highlightPath(currSpot.row, currSpot.col, 2)
				prevSpot = currSpot
			}
		}
		// fully calculate a search, don't animate it
		else if(recalculate){
			resetGrid()
			queue = [startSpot]
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
						p.fill('#f5dd42')
						break
					case 2:
						p.fill('#4842f5')
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
						p.fill('#42f563')
						break
					case 2:
						p.fill('#f54242')
						break
					default:
						break
				}
				p.rect(border+j*boxSize, border+i*boxSize, boxSize, boxSize)
			}
		}
		// draw clicked spots enlarged
		var next = []
		while(clicked.length > 0){
			spot = clicked.pop()
			p.fill(0)
			p.rect(border+spot.col*boxSize-(spot.sizeOffset/2), border+spot.row*boxSize-(spot.sizeOffset/2), boxSize+spot.sizeOffset, boxSize+spot.sizeOffset)
			spot.sizeOffset -= 2.5
			if(spot.sizeOffset > -2.5){
				next.push(spot)
			}
		}
		clicked = next
		if(clicked.length === 0 && !animateSearch){
			p.noLoop()
		}
	}
}

export default sketch
