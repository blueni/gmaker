import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import marked from 'marked'
import store from '../store/index'
import App from '../pages/app.page'
import sdk from './sdk'

window.marked = React.Component.prototype.$marked = marked
React.Component.prototype.$sdk = sdk
React.editormd = window.editormd

ReactDOM.render((
    <Provider store={store}>
        <App />
    </Provider>
), document.getElementById('docs-app'))
