const fs = require('fs')
const path = require('path')
const { cb2promise } = require('./utils')

const cwd = process.cwd()
const readdir = cb2promise(fs.readdir)
const writeFile = cb2promise(fs.writeFile)
const stat = cb2promise(fs.stat)
const resolve = (...args) => path.resolve(cwd, ...args)
const docsPath = resolve('docs')
const summaryFilePath = resolve('data/summary.json')

async function buildSummary(blog = {}) {
    let res = await readdir(docsPath)
    let originJson = {}

    try {
        originJson = require(summaryFilePath)
        delete require.cache[summaryFilePath]
    } catch(err) {}
    
    let originDocs = originJson.docs || []
    let docs = []
    let json = { docs, }
    
    for (let i = 0; i < res.length; i++) {
        let doc = res[i]
        let stats = await stat(path.join(docsPath, doc))
        let originStats = originDocs.filter(item => item.name === doc)[0]

        if (blog.name === doc) {
            stats.title = blog.title
            stats.labels = blog.labels
        }

        let docDescriptor = Object.assign({
            title: '',
            labels: [],
        },{
            name: doc,
        }, originStats, stats)

        docs.push(docDescriptor)
    }
    
    writeFile(summaryFilePath, JSON.stringify(json))
}

module.exports = buildSummary
