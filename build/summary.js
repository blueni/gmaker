const path = require('path')
const { createFile } = require('./utils')

const cwd = process.cwd()
const resolve = (...args) => path.resolve(cwd, ...args)
const summaryPath = resolve('data/summary')
// 一个列表文件只存储200篇博客摘要信息
const TOTAL = 200

function getSummaryPath(docLiker) {
    let fileIndex = Math.floor(docLiker.id / TOTAL)
    let fileName = `list${fileIndex}.json`
    let filePath = resolve(summaryPath, fileName)
    return filePath
}

async function getSummary(doc) {
    let res = []
    let filePath = getSummaryPath(doc)

    try {
        res = require(filePath)
        delete require.cache[filePath]
    } catch(err) {
        await createFile(filePath, '[]')
    }

    return res
}

async function updateDoc(doc = {}) {
    let summary = await getSummary(doc)
    let index =  doc.id % TOTAL
    summary[index] = doc

    return createFile(getSummaryPath(doc), JSON.stringify(summary))
}

async function deleteDoc(doc = {}) {
    let summary = await getSummary(doc)
    let index =  doc.id % TOTAL
    summary[index].deleted = true

    return createFile(getSummaryPath(doc), JSON.stringify(summary))
}

module.exports = {
    getSummaryPath,
    getSummary,
    updateDoc,
    deleteDoc,
}
