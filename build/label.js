const path = require('path')
const { createFile } = require('./utils')

const cwd = process.cwd()
const resolve = (...args) => path.resolve(cwd, ...args)
const labelPath = resolve('data/labels.json')

async function getLabels() {
    let res = []

    try {
        res = require(labelPath)
        delete require.cache[labelPath]
    } catch(err) {
        await createFile(labelPath, '[]')
    }

    return res
}

async function saveLabels(...arr) {
    let labels = await getLabels()
    arr.forEach(label => {
        if (labels.indexOf(label) < 0) {
            labels.push(label)
        }
    })

    return createFile(labelPath, JSON.stringify(labels))
}

module.exports = {
    getLabels,
    saveLabels,
}
