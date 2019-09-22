class Spot {
	/*
	  State:
	    0 - Unvisited
		1 - Visited
		2 - Path
	  Label:
	   -1 - Blocked
	    0 - No Label
		1 - Start
		2 - Goal
	*/
	constructor(row, col){
		this.row = row
		this.col = col
		this.state = 0
		this.label = 0
		this.prev = null
		this.gScore = Infinity
		this.fScore = Infinity
		this.sizeOffset = 0
	}
}

export default Spot
