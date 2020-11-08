const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const { copyHTML } = require('./build/utils')
const { updateCategory } = require('./build/quick_index')
const { saveDoc, makeDocId, deleteDoc } = require('./build/doc')
const { saveLabels } = require('./build/label')

const cwd = process.cwd()
const resolve = (...args) => path.join(cwd, ...args)
process.chdir(cwd)

let firstBuilding = true
const app = express()
let Bundler
try{
    Bundler = require(path.join(cwd, 'node_modules/parcel-bundler'))
} catch(err){
    Bundler = require('parcel-bundler')
}

const bundler = new Bundler(path.join(cwd, 'scripts/index.js'), {
    contentHash: false,
    sourceMaps: true,
})
bundler.on('bundled', () => {
    if (firstBuilding) {
        firstBuilding = false
        console.log('请打开 http://localhost:6688 访问项目')
    }
    
    copyHTML('dist/')
})

app.use('/public', express.static(resolve('./public')))
app.use('/docs', express.static(resolve('./docs')))
app.use('/data', express.static(resolve('./data')))
app.use('/dist', express.static(resolve('./dist')))
app.use(bundler.middleware())
app.use(bodyParser.json())

// 提交博客
app.post('/blog/submit', async (req, res, next) => {
    let body = req.body
    let doc = {
        id: body.id,
        name: body.name,
        title: body.title,
        category: body.category,
        oldCategory: body.oldCategory,
        labels: body.labels,
    }

    // 新增
    if (doc.id === '' || isNaN(doc.id)) {
        doc.id = await makeDocId()
        doc.name = `blog${doc.id}.md`
    }
    
    await saveDoc(doc, body.content)
    res.end('success')
})

// 删除博客
app.post('/blog/delete', async (req, res, next) => {
    let body = req.body
    let doc = {
        id: body.id,
        category: body.category,
    }
    await deleteDoc(doc)

    res.end('success')
})

// 新增文章分类
app.post('/category/submit', async (req, res, next) => {
    let category = req.body.category
    if (!category || category === 'null') {
        res.end('请设置分类名...')
        return
    }

    await updateCategory(category)
    res.end('success')
})

// 新增标签
app.post('/label/submit', async (req, res, next) => {
    let label = req.body.label
    if (!label || label === 'null') {
        res.end('请设置标签名...')
        return
    }

    await saveLabels(label)
    res.end('success')
})

app.get('/', (req, res) => {
    res.sendFile(resolve('index.html'))
})

app.listen(6688)
