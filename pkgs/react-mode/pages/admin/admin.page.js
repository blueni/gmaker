import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setCategories, setCurrentCategory } from '../../store/actions'
import './admin.less'

const blogTemplate = {
    id: '',
    name: '',
    title: '',
    category: '',
    labels: [],
}
let editor = null

@connect(state => ({
    categories: state.categories,
    currentCategory: state.currentCategory,
}), dispatch => bindActionCreators({
        setCategories,
        setCurrentCategory,
    }, dispatch)
)
export default class IndexPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            menu: null,
            blogList: [],
            labels: [],
            checkedLabels: {},
            blog: Object.assign({}, blogTemplate),
            oldCategory: '',
            detail: '',
            showDetail: false,
            collapse: false,
        }
        this.newCategory = this.newCategory.bind(this)
        this.newLabel = this.newLabel.bind(this)
        this.handleTitleChange = this.handleTitleChange.bind(this)
        this.handleCategoryChange = this.handleCategoryChange.bind(this)
        this.handleLabelChange = this.handleLabelChange.bind(this)
        this.submit = this.submit.bind(this)
        this.getLabels()
        this.getCategories().then((categories) => {
            this.props.setCategories(categories)
            this.getBlogList()
        })
    }

    componentDidUpdate(props, state) {
        if (this.state.collapse !== state.collapse && editor) {
            // 展开与收起左侧菜单有动画时间，动画结束后再重绘editor
            setTimeout(() => {
                editor.resize()
            }, 400)
        }

        if (!this.state.showDetail) {
            return
        }

        // 上一次未显示编辑器或者两次编辑器内容不同时重新渲染markdown
        if (!state.showDetail || this.state.detail !== state.detail) {
            setTimeout(() => {
                this.renderMarkdown()
            })
        }
    }

    componentWillUnmount() {
        // 手动清空md编辑器里面的内容,editormd没有提供销毁方法
        $('#id-editor').html('')
        editor = null
    }

    menuCollapse() {
        this.setState({
            collapse: !this.state.collapse,
        })
    }

    toggleSubMenu(category) {
        let menu = Object.assign({}, this.state.menu)
        menu[category].open = !menu[category].open
        this.setState({ menu })
    }

    handleCategoryChange(e) {
        let category = e.target.value
        let blog = Object.assign({}, this.state.blog, { category })
        this.setState({
            blog,
        })
    }

    handleLabelChange(e) {
        let value = e.target.value
        let checkedLabels = Object.assign({}, this.state.checkedLabels)
        checkedLabels[value] = true
        this.setState({ checkedLabels })
    }

    handleTitleChange(e) {
        let title = e.target.value
        let blog = Object.assign({}, this.state.blog, { title })
        this.setState({
            blog,
        })
    }

    // 不传withOldMenu参数时会创建一个不包含文章列表的空菜单，此处是为了重新加载文章列表
    // 当传递withOldMenu参数时，会在旧菜单上更新，此处用在新增分类后会加一个菜单项
    getMenu(categories = [], withOldMenu) {
        let menu = Object.assign({}, this.state.menu)
        categories.forEach((category, index) => {
            let oldSubMenu = menu[category] || {}
            let subMenu = {
                list: [],
                // 菜单展开与收起状态一直与旧菜单保持一致
                open: oldSubMenu.open || index === 0,
            }
            if (withOldMenu) {
                subMenu = Object.assign(subMenu, oldSubMenu)
            }
            menu[category] = subMenu
        })
        return menu
    }

    updateMenu(categories) {
        let menu = this.getMenu(categories, true)
        this.setState({ menu })
    }

    async getBlogList(query = {}) {
        query.pageSize = 1000000
        let list = await this.$sdk.getBlogList(query)
            
        let categories = this.props.categories
        let menu = this.getMenu(categories)
        list.forEach(blog => {
            menu[blog.category].list.push(blog)
        })
        this.setState({ menu })
    }

    getCategories() {
        return this.$sdk.getCategories()
    }

    async getLabels() {
        let labels = await this.$sdk.getLabels()

        let checkedLabels = {}
        labels.forEach(item => {
            checkedLabels[item] = false
        })
        
        this.setState({
            labels,
            checkedLabels,
        })
    }

    setCheckedLabels(list = []) {
        let checkedLabels = {}
        let labels = this.state.labels
        labels.forEach(item => {
            checkedLabels[item] = list.indexOf(item) >= 0
        })
        this.setState({
            checkedLabels,
        })
    }

    async getDetail(doc) {
        this.setCheckedLabels(doc.labels)
        let detail = await this.$sdk.getDetail(doc)
        this.setState({
            oldCategory: doc.category,
            blog: Object.assign({}, doc),
            detail,
            showDetail: true,
        })
    }

    renderMarkdown() {
        if (!editor) {
            editor = editormd({
                id: 'md-editor',
                markdown: this.state.detail,
                width: '100%',
                height: '73%',
                syncScrolling : 'single',
                path: '/public/editor.md/lib/',
            })
        } else {
            editor.setMarkdown(this.state.detail)
        }
    }

    newBlog() {
        let checkedLabels = {}
        let labels = this.state.labels
        labels.forEach(item => {
            checkedLabels[item] = false
        })
        this.setState({
            oldCategory: '',
            blog: Object.assign({}, blogTemplate),
            checkedLabels,
            showDetail: true,
            detail: ' ',
        })
    }

    async newCategory() {
        let categories = this.props.categories.slice()
        let category = prompt('请输入分类名：')

        if (!category || categories.indexOf(category) >= 0) {
            return
        }

        await this.$sdk.post('/category/submit', { category })
        categories.push(category)
        this.updateMenu(categories)
        this.props.setCategories(categories)
    }

    async newLabel() {
        let labels = this.state.labels
        let label = prompt('请输入标签名：')

        if (!label || labels.indexOf(label) >= 0) {
            return
        }

        await this.$sdk.post('/label/submit', { label })
        this.getLabels()
    }

    async deleteBlog(blog, event) {
        event.stopPropagation()
        let bool = confirm('确定删除这条博客吗？')
        if (!bool) {
            return
        }

        await this.$sdk.post('/blog/delete', blog)
        this.getBlogList()

        if (this.state.blog.id === blog.id) {
            this.setState({
                showDetail: false,
            })
        }
    }

    async submit() {
        let checkedLabels = this.state.checkedLabels
        let blog = Object.assign({}, this.state.blog)

        if (!blog.category) {
            alert('请选择文章分类')
            return
        }

        let labels = []
        for (let label in checkedLabels) {
            if (checkedLabels[label]) {
                labels.push(label)
            }
        }
        if (this.state.oldCategory !== blog.category) {
            blog.oldCategory = this.state.oldCategory
        }
        blog.labels = labels
        blog.content = editor.getMarkdown()
        await this.$sdk.post('/blog/submit', blog)
        this.getBlogList()
        alert((blog.id ? '修改' : '新增') + '博客成功!')

        if (!blog.id) {
            this.newBlog()
        } else {
            this.setState({
                oldCategory: blog.category,
                blog,
            })
        }
    }

    render() {
        let categories = this.props.categories
        let { 
            labels,
            menu,
            blog,
            showDetail,
            checkedLabels,
            detail,
        } = this.state

        return (
            <div className="doc-admin">
                <span className="menu-collapse" onClick={() => this.menuCollapse()}>☰</span>
                <div className={`doc-list-box ${this.state.collapse ? 'collapse' : ''}`}>
                    <div className="tool-box">
                        <button className="doc-button" onClick={() => this.newBlog()}>新增博客</button>
                    </div>
                    <div className="menu-box">
                    {
                    menu && categories.map(category => (
                        <ul 
                            className={`doc-list ${menu[category].open ? 'active' : ''}`}
                            key={category}
                            >
                            <li className="category-item" onClick={() => this.toggleSubMenu(category)}>{ category }</li>
                            <li className="sub-list">
                                <ul className="list">
                                    {
                                        menu[category].list.map(doc => (
                                            <li 
                                                className={`doc-item ${blog && blog.name === doc.name ? 'active' : ''}`}
                                                key={doc.id}
                                                onClick={() => this.getDetail(doc)}
                                            >
                                                { doc.title }
                                                <button className="doc-button delete" onClick={(e) => this.deleteBlog(doc, e)}>&times;</button>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </li>
                        </ul>
                    ))
                    }
                    </div>
                </div>

                <div className="form-content">
                    {
                    showDetail &&
                    <div className="md-detail">
                        <div className="form-item">
                            <span className="form-label">标题：</span>
                            <input type="text" value={blog.title} onChange={this.handleTitleChange} />
                        </div>

                        <div className="form-item">
                            <span className="form-label">分类：</span>
                            {
                                categories.map(category => (
                                    <label key={category}>
                                        <input
                                            type="radio"
                                            name="category"
                                            value={category}
                                            checked={blog.category === category}
                                            onChange={this.handleCategoryChange} />
                                        { category }
                                    </label>
                                ))
                            }
                            <button className="doc-button" onClick={this.newCategory}>新增分类</button>
                        </div>

                        <div className="form-item">
                            <span className="form-label">标签：</span>
                            {
                                labels.map(label => (
                                    <label key={label}>
                                        <input
                                            type="checkbox"
                                            name="label"
                                            value={label}
                                            checked={checkedLabels[label]}
                                            onChange={this.handleLabelChange} />
                                        { label }
                                    </label>
                                ))
                            }
                            <button className="doc-button" onClick={this.newLabel}>新增标签</button>
                        </div>

                        <div className="edit-doc" id="md-editor">
                        </div>

                        <div className="form-item">
                            <button className="doc-button" onClick={this.submit}>保 存</button>
                        </div>
                    </div>
                    }
                </div>
            </div>
        )
    }
}