import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core'
import { indigo } from '@material-ui/core/colors'

const theme = createMuiTheme({
	palette: {
		primary: {
			main: indigo[900]
		},
		secondary: {
			main: indigo[900]
		},
		background: {
			default: '#F5F5F5'
		}
	},
	typography: {
		fontFamily: [
			'"Avenir Next"',
			'"Segoe UI"',
			'Roboto',
			'-apple-system',
			'sans-serif',
			'BlinkMacSystemFont',
			'"Helvetica Neue"',
			'Arial',
			].join(',')
		}
})

ReactDOM.render(
	<MuiThemeProvider theme={theme}>
		<CssBaseline />
		<App />
	</MuiThemeProvider>, document.getElementById('root'));
