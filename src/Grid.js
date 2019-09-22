import Spot from './Spot'

const sketch = (p) => {
	var canvas
	const width = p.windowWidth
	const height = p.windowHeight
	const boxSize = 16
	const numRows = Math.floor(height / boxSize)
	const numCols = Math.floor(width / boxSize)
	const startRow = Math.floor(numRows/2)
	const startCol = Math.floor(numCols/4)
	const endRow = startRow
	const endCol = 3*startCol
	const speed = 80
	// initialize grid of spots
	var grid = []
	var queue = []
	var anim = false
	var recalculate = false
	var type = ''

	var prevSpot = null
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

		queue.push(grid[startRow][startCol])
	}

	const resetGrid = () => {
		for(var i = 0; i < numRows; i++){
			for(var j = 0; j < numCols; j++){
				grid[i][j].state = 0
			}
		}
	}

	p.myCustomRedrawAccordingToNewPropsHandler = (newProps) => {
		if(canvas){
			prevSpot = null
			// clear out the old grid
			resetGrid()

			// start a new animation
			if(newProps.anim){
				queue = [grid[startRow][startCol]]
				type = newProps.type
				anim = true
			}
			else{
				anim = false
			}
			p.loop()
		}
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
			var row = Math.floor((p.mouseY-6)/boxSize)
			var col = Math.floor((p.mouseX-6)/boxSize)
			if(row < 0 || row >= numRows || col < 0 || col >= numCols){
				return
			}
			if(grid[row][col].label === 0 && p.mouseButton === 'left'){
				grid[row][col].label = -1
			}
			else if(grid[row][col].label === -1 && p.mouseButton === 'right'){
				grid[row][col].label = 0
			}
			recalculate = true
			p.draw()
		}
	}
	p.mousePressed = handleClick
	p.mouseDragged = handleClick
	p.draw = () => {
		p.background('#f5f5f5')
		p.noFill()
		p.stroke(0)
		p.strokeWeight(3)
		if(prevSpot !== null){
			highlightPath(prevSpot.row, prevSpot.col, 1)
			prevSpot = null
		}
		var spot = null
		for(var ii = 0; ii < speed && anim && queue.length > 0; ii++){
			spot = type === 'bfs' ? queue.shift() : queue.pop()
			if(spot.state === 0 && spot.label !== -1){
				if(spot.label === 2){
					anim = false
					highlightPath(endRow, endCol, 2)
					p.noLoop()
					break
				}
				spot.state = 1
				enqueue(spot.row+1, spot.col, spot)
				enqueue(spot.row-1, spot.col, spot)
				enqueue(spot.row, spot.col-1, spot)
				enqueue(spot.row, spot.col+1, spot)
			}
		}
		if(spot != null){
			highlightPath(spot.row, spot.col, 2)
			prevSpot = spot
		}
		if(recalculate){
			resetGrid()
			queue = [grid[startRow][startCol]]
			while(queue.length > 0){
				spot = type === 'bfs' ? queue.shift() : queue.pop()
				if(spot.state === 0 && spot.label !== -1){
					if(spot.label === 2){
						anim = false
						highlightPath(endRow, endCol, 2)
						p.noLoop()
						break
					}
					spot.state = 1
					enqueue(spot.row+1, spot.col, spot)
					enqueue(spot.row-1, spot.col, spot)
					enqueue(spot.row, spot.col-1, spot)
					enqueue(spot.row, spot.col+1, spot)
				}
			}
			recalculate = false
		}
		for(var i = 0; i < numRows; i++){
			for(var j = 0; j < numCols; j++){
				switch(grid[i][j].state){
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
				switch(grid[i][j].label){
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
				p.rect(6+j*boxSize, 6+i*boxSize, boxSize, boxSize)
			}
		}
	}
}

export default sketch
