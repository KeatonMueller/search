import React from 'react'
import P5Wrapper from 'react-p5-wrapper'
import Grid from './Grid'

class App extends React.Component {
    constructor(){
        super()
        this.state = { anim: false, type: '' }
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick = (type) => () => {
        if(type !== 'clearSearch' && type !== 'clearAll'){
            this.setState({ anim: true, type: type })
        }
        else{
            this.setState({ anim: false, type: type })
        }
    }


    render() {
        return (
            <div>
                <button onClick={this.handleClick('dfs')}>DFS</button>
                <button onClick={this.handleClick('bfs')}>BFS</button>
                <button onClick={this.handleClick('a*')}>A*</button>
                <button onClick={this.handleClick('clearSearch')}>Clear Search</button>
                <button onClick={this.handleClick('clearAll')}>Clear All</button>
                <P5Wrapper
                    sketch={Grid}
                    anim={this.state.anim}
                    type={this.state.type}
                >
                </P5Wrapper>
            </div>
        )
    }
}

export default App
