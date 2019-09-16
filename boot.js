const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const { cb2promise, copyHTML } = require('./build/utils')
const buildSummary = require('./build/summary')

const cwd = process.cwd()
process.chdir(cwd)

const readdir = cb2promise(fs.readdir)
const writeFile = cb2promise(fs.writeFile)
const unlink = cb2promise(fs.unlink)
const docPath = path.join(cwd, 'docs')
let id = 1
let firstBuilding = true

async function makeBlogName() {
    let docs = await readdir(docPath)
    let docName = `blog${id}.md`
    while (docs.indexOf(docName) >= 0) {
        docName = `blog${++id}.md`
    }
    return docName
}

const app = express()
const Bundler = require(path.join(cwd, 'node_modules/parcel-bundler'))
const bundler = new Bundler(path.join(cwd, 'scripts/index.js'), {
    contentHash: false,
    sourceMaps: false,
})
bundler.on('bundled', () => {
    if (firstBuilding) {
        firstBuilding = false
        console.log('请打开 http://localhost:6688 访问项目')
    }
    
    copyHTML('dist/')
})

app.use('/public', express.static(path.join(cwd, './public')))
app.use('/docs', express.static(path.join(cwd, './docs')))
app.use('/data', express.static(path.join(cwd, './data')))
app.use('/dist', express.static(path.join(cwd, './dist')))
app.use(bundler.middleware())
app.use(bodyParser.json())

// 提交博客
app.post('/blog/submit', async (req, res, next) => {
    let body = req.body
    if (!body.name) {
        body.name = await makeBlogName()
    }
    await writeFile(path.join(docPath, body.name), body.content)
    await buildSummary(body)

    res.end('success')
})

// 删除博客
app.post('/blog/delete', async (req, res, next) => {
    await unlink(path.join(docPath, req.body.name))
    await buildSummary()

    res.end('success')
})

// 新增标签
app.post('/label/submit', async (req, res, next) => {
    let label = req.body.label
    let labelPath = path.join(cwd, 'data/labels.json')

    let json = require(labelPath)
    delete require.cache[labelPath]

    json.labels.push(label)
    await writeFile(labelPath, JSON.stringify(json))

    res.end('success')
})

app.get('/', (req, res) => {
    res.sendFile(path.join(cwd, 'index.html'))
})

app.listen(6688)

buildSummary()
