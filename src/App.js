import React from 'react'
import P5Wrapper from 'react-p5-wrapper'
import SearchGrid from './SearchGrid'

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

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
            <Grid container spacing={8} justify='center'>
                <Grid item xs={6} container spacing={1} justify='center'>
                    <Grid item>
                        <Button variant='contained' onClick={this.handleClick('dfs')}>DFS</Button>
                    </Grid>
                    <Grid item>
                        <Button variant='contained' onClick={this.handleClick('bfs')}>BFS</Button>
                    </Grid>
                    <Grid item>
                        <Button variant='contained' onClick={this.handleClick('a*')}>A*</Button>
                    </Grid>
                </Grid>
                <Grid item xs={6} container spacing={1} justify='center'>
                    <Grid item>
                        <Button variant='contained' onClick={this.handleClick('clearSearch')}>Clear Search</Button>
                    </Grid>
                    <Grid item>
                        <Button variant='contained' onClick={this.handleClick('clearAll')}>Clear All</Button>
                    </Grid>
                </Grid>
            </Grid>
                <P5Wrapper
                    sketch={SearchGrid}
                    anim={this.state.anim}
                    type={this.state.type}
                >
                </P5Wrapper>
            </div>
        )
    }
}

export default App
