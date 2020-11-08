import React from 'react'
import { HashRouter, Route, Switch, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { setError } from '../store/actions'
import Loading from '../components/loading.component'
import './app.less'

// react pages...
import IndexPage from '../pages/index/index.page'
import AdminPage from '../pages/admin/admin.page'

const AppPage = connect(state => ({
    error: state.error,
    loading: state.loading,
}), dispatch => ({
    setError: (error = '') => dispatch(setError(error))
}))(App)

function App(props) {
    let { error, loading, setError } = props

    return (
        <HashRouter>
            <div className={`gmaker-app ${loading ? 'no-scroll' : ''}`}>
                <div className="page-header">
                    <Link to="/">
                        <strong className="v-log">GMaker</strong>
                    </Link>
                    <div className="description">
                        一键打造静态网站
                    </div>
    
                    <a className="header-link" href="https://www.github.com/blueni/gmaker" target="__blank">GitHub</a>
                    <Link className="header-link" to="/admin">Admin</Link>
                </div>
                
                <div className={`err-tip ${error ? 'show' : ''}`}>
                    <div className="err-content">
                        {error}
                    </div>
                    <span className="close-err" onClick={setError}>×</span>
                </div>
                {
                loading &&
                <div className="global-loading">
                    <Loading animate="scale"></Loading>
                </div>
                }
                <Switch>
                    <Route exact path="/admin" component={AdminPage}></Route>
                    <Route path="/" component={IndexPage}></Route>
                </Switch>
            </div>
        </HashRouter>
    )
}

export default AppPage