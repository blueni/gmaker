const fs = require('fs')
const path = require('path')
const { cb2promise, createFile } = require('./utils')
const { getQuickIndex, updateDoc: updateQuickDoc, deleteDoc: deleteQuickDoc } = require('./quick_index')
const { updateDoc: updateSummaryDoc, deleteDoc: deleteSummaryDoc } = require('./summary')

const cwd = process.cwd()
const stat = cb2promise(fs.stat)
const rename = cb2promise(fs.rename)
const resolve = (...args) => path.resolve(cwd, ...args)
const docPath = resolve('docs')
// 一个文件夹只存10篇文章
const TOTAL = 10

function getDocPath(doc, docName) {
    let page = Math.floor(doc.id / TOTAL)
    let docFilePath = resolve(docPath, `p${page}`, docName || doc.name)
    return docFilePath
}

async function saveDoc(doc = {}, content) {
    let docFilePath = getDocPath(doc)

    if (doc.oldName) {
        let oldFilePath = getDocPath(doc, doc.oldName)
        try {
            await rename(oldFilePath, docFilePath)
        } catch(err) {}
    }

    await createFile(docFilePath, content)
    const stats = await stat(docFilePath)
    doc = Object.assign({}, doc, {
        overview: content.substring(0, 50) + '...',
        stats,
    })

    return Promise.all([
        updateSummaryDoc(doc),
        updateQuickDoc(doc),
    ])
}

// 仅标记为删除状态
async function deleteDoc(doc = {}) {
    return Promise.all([
        deleteSummaryDoc(doc),
        deleteQuickDoc(doc),
    ])
}

// 物理删除
async function destroyDoc(doc) {
}

async function makeDocId() {
    let res = await getQuickIndex()
    let total = 0
    for (let key in res) {
        total += res[key].length
    }
    return total
}

module.exports = {
    getDocPath,
    saveDoc,
    makeDocId,
    deleteDoc,
}
