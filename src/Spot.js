export const Values = {
    NONE: 0,
    EMPTY: 1,
    WALL: 2,
    START: 3,
    END: 4,
};

class Spot {
    /*
	  State:
	    0 - Unvisited
		1 - Visited
		2 - Path
	  Label:
	  	Values enum
	*/
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.state = 0;
        this.label = Values.EMPTY;
        this.prev = null;
        this.gScore = Infinity;
        this.fScore = Infinity;
        this.sizeOffset = 0;
    }
}

export default Spot;
