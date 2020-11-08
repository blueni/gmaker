import React, { useEffect } from 'react'
import { useHistory } from 'react-router'
import { connect } from 'react-redux'
import { setBlog } from '../../store/actions'
import Loading from '../../components/loading.component'
import './list.page.less'

let scrollHandlers = []
let timer
let $win = $(window)
function onScroll(handler) {
    if (!scrollHandlers.length) {
        $win.on('scroll', onScrollHandler)
    }
    scrollHandlers.push(handler)
}

function offScroll() {
    scrollHandlers = []
    $win.off('scroll', onScrollHandler)
}

function onScrollHandler() {
    clearTimeout(timer)

    timer = setTimeout(() => {
        let htmlElem = document.documentElement
        let scrollTop = htmlElem.scrollTop || document.body.scrollTop
        let scrollHeight = htmlElem.scrollHeight
        let winHeight = $win.height()

        if (scrollHeight - scrollTop - winHeight <= 40) {
            scrollHandlers.forEach((handler) => {
                handler()
            })
        }
    }, 400)
}

@connect(state => ({
    currentCategory: state.currentCategory,
}))
class ListPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            page: 0,
            list: [],
            noMore: false,
            loading: false,
        }
        this.loadMore = this.loadMore.bind(this)
    }

    componentDidMount() {
        this.onCategoryChange(this.props.currentCategory)
        onScroll(this.loadMore)
    }

    componentDidUpdate(props) {
        let currentCategory = this.props.currentCategory
        if (currentCategory === props.currentCategory) {
            return
        }
        
        this.onCategoryChange(currentCategory)
    }

    componentWillUnmount() {
        offScroll()
    }

    async getBlogList(query = {}) {
        let params = {
            page: this.state.page,
            category: this.state.currentCategory,
        }
        params = Object.assign(params, query)
        
        this.setState({
            noMore: false,
            loading: true,
        })
        let list = await this.$sdk.getBlogList(params)
        this.setState({
            page: params.page,
            loading: false,
        })
        if (!list || !list.length) {
            this.setState({
                noMore: true,
            })
            return
        }

        let blogList = this.state.list || []
        let map = {}
        let ret = []
        blogList.forEach(blog => {
            map[blog.id] = blog
            blog.index = ret.length
            ret.push(blog)
        })
        list.forEach(blog => {
            let id = blog.id
            let originBlog = map[id]
            if (originBlog) {
                ret[originBlog.index] = blog
                blog.index = originBlog.index
            } else {
                ret.push(blog)
            }
        })

        this.setState({
            list: ret,
        })
    }

    loadMore() {
        if (this.state.noMore) {
            return
        }
        this.getBlogList({
            page: this.state.page + 1,
        })
    }

    onCategoryChange(category) {
        this.setState({
            list: [],
        })
        this.getBlogList({
            category,
            page: 0,
        })
    }

    render() {
        return (
            <ListWrapper
                list={this.state.list}
                noMore={this.state.noMore}
                loading={this.state.loading}
                loadMore={this.loadMore}
            ></ListWrapper>
        )
    }

}

const ListWrapper = connect(null, (dispatch) => {
    return {
        setBlog(blog) {
            dispatch(setBlog(blog))
        },
    }
})(List)

function List(props) {
    let { 
        list,
        noMore,
        loading,
        setBlog,
    } = props
    let history = useHistory()

    useEffect(() => {
        list.forEach(blog => {
            let elemId = `md-info-${blog.id}`
            let elem = $(`#${elemId}`)
            elem.html('')
            editormd.markdownToHTML(elemId, {
                markdown: blog.overview,
                previewCodeHighlight: false,
            })
        })
    })

    function jumpTo(doc) {
        setBlog(doc)
        history.push(`/detail/${doc.id}`)
    }

    return (
        <div className="list-component">
            <div className="page-content">
                <div className="blog-overview">
                    {
                    list.map(doc => (
                    <a className="blog-item" key={doc.id} onClick={() => jumpTo(doc)}>
                        <div className="blog-header">
                            <div className="blog-title">
                                <span className="title-text">{doc.title}</span>
                                {
                                doc.labels &&
                                <div className="label-list">
                                    {
                                    doc.labels.map(label => (
                                    <span className="blog-label" key={label}>
                                        {label}
                                    </span>
                                    ))
                                    }
                                </div>
                                }
                            </div>
                            <span className="blog-time">{doc.stats.mtimeMs}</span>
                        </div>

                        <div className="md-info" id={`md-info-${doc.id}`}></div>
                    </a>
                    ))
                    }
                </div>
                
                <div className="load-more">
                    {
                    noMore && <div className="no-more">就这么多了</div>
                    }
                    {
                    loading && <Loading animate="scale" width="5px" height="20px" className="load-more"></Loading>
                    }
                </div>
            </div>
        </div>
    )
}

export default ListPage