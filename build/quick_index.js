const path = require('path')
const { createFile } = require('./utils')

const cwd = process.cwd()
const resolve = (...args) => path.resolve(cwd, ...args)
const quickIndexPath = resolve('data/quick_index.json')

async function getQuickIndex() {
    let res = {}

    try {
        res = require(quickIndexPath)
        delete require.cache[quickIndexPath]
    } catch(err) {
        await createFile(quickIndexPath, '{}')
    }

    return res
}

async function getCategories() {
    let quickIndex = await getQuickIndex()    
    let categories = Object.keys(quickIndex)
    return categories
}

async function updateCategory(newCategory, oldCategory) {
    let quickIndex = await getQuickIndex()
    if (quickIndex[newCategory]) {
        return
    }

    quickIndex[newCategory] = quickIndex[oldCategory] || []
    if (oldCategory && quickIndex[oldCategory]) {
        if (quickIndex[oldCategory].length) {
            throw new Error('该分类下还有文章，拒绝更新')
        }

        delete quickIndex[oldCategory]
    }
    return createFile(quickIndexPath, JSON.stringify(quickIndex))
}

async function updateDoc(doc = {}) {
    let quickIndex = await getQuickIndex()

    let oldCategory = doc.oldCategory
    let oldDocList = quickIndex[oldCategory]
    let docList = oldDocList || quickIndex[doc.category] || []
    let index = docList.indexOf(doc.id)

    if (index >= 0) {
        docList.splice(index, 1)
    }
    
    if (oldDocList) {
        docList = quickIndex[doc.category]
    }

    if (!docList) {
        throw new Error('该分类不存在，请先添加分类')
    }

    docList.unshift(doc.id)
    return createFile(quickIndexPath, JSON.stringify(quickIndex))
}

async function deleteDoc(doc = {}) {
    let quickIndex = await getQuickIndex()
    
    let docList =quickIndex[doc.category]
    let index = docList.indexOf(doc.id)

    if (index >= 0) {
        docList.splice(index, 1)
    }

    if (!quickIndex._) {
        quickIndex._ = []
    }

    quickIndex._.push(doc.id)

    return createFile(quickIndexPath, JSON.stringify(quickIndex))
}

module.exports = {
    getQuickIndex,
    updateCategory,
    updateDoc,
    getCategories,
    deleteDoc,
}
