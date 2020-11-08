import React from 'react'
import { Switch, Route } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { setCurrentCategory, setCategories } from '../../store/actions'
import ListPage from '../list/list.page'
import DetailPage from '../detail/detail.page'
import { qs2params } from '../../scripts/utils'
import './index.less'

@connect(state => ({
    categories: state.categories,
    currentCategory: state.currentCategory,
    blog: state.blog,
}), dispatch => bindActionCreators({
        setCategories,
        setCurrentCategory,
    }, dispatch)
)
export default class IndexPage extends React.Component {
    constructor(props) {
        super(props)

        // 加载类型列表
        this.$sdk.getCategories().then(categories => {
            this.props.setCategories(categories)
        })

        let params = qs2params(this.props.location.search)
        let category = params.category || ''
        this.props.setCurrentCategory(category)
    }

    categoryChangeHandler(category) {
        this.props.setCurrentCategory(category)
        this.props.history.replace(`/?category=${category}`)
    }

    render() {
        let { categories, currentCategory } = this.props

        return (
            <div className="index-page">
                <div className="page-categories">
                    <div className="page-content">
                        <div className="nav-box">
                            <a
                                className={`nav-item ${currentCategory === '' ? 'active' : ''}`}
                                onClick={() => this.categoryChangeHandler('')}
                            >
                                Home
                            </a>
                            {categories.map(category => (
                                <span
                                    className={`nav-item ${currentCategory === category ? 'active' : ''}`}
                                    key={category}
                                    onClick={() => this.categoryChangeHandler(category)}
                                >
                                    {category}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <Switch>
                    <Route exact path="/">
                        <ListPage></ListPage>
                    </Route>
                    <Route path="/detail/:id">
                        <DetailPage blog={this.props.blog}>
                        </DetailPage>
                    </Route>
                </Switch>
                
                <div className="page-footer">By Blueni</div>
            </div>
        )
    }
}