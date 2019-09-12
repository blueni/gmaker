const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const os = require('os')

const access = cb2promise(fs.access)
const mkdir = cb2promise(fs.mkdir)
const readFile = cb2promise(fs.readFile)
const writeFile = cb2promise(fs.writeFile)
const stat = cb2promise(fs.stat)
const readdir = cb2promise(fs.readdir)

function cb2promise(fn) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
    }
}

async function mkdirp(dir) {
    let dirArr = dir.split(/[\\/]+/)
    let currentDir = dirArr[0]

    for (let i = 1; i < dirArr.length; i++) {
        currentDir = path.join(currentDir, dirArr[i])

        try {
            await access(currentDir)
        } catch (err) {
            await mkdir(currentDir)
        }
    }
}

async function createFile(file, content) {
    await mkdirp(path.dirname(file))

    try {
        await access(file)
    } catch (err) {
        await writeFile(file, content)
    }
}

async function copy(sourcePath, destPath) {
    return (async function _copy(sourcePath, destPath) {
        await mkdirp(destPath)
        let res = await readdir(sourcePath)
        
        if (!res.length) {
            return Promise.resolve()
        }

        let length = res.length
        let finished = 0

        return new Promise(resolve => {
            res.forEach(async item => {
                let fullPath = path.join(sourcePath, item)
                let fullDestPath = path.join(destPath, item)

                let stats = await stat(fullPath)
                if (stats.isDirectory()) {
                    await _copy(fullPath, fullDestPath)
                    finished++
                    if (finished == length) {
                        resolve()
                    }
                    return
                }

                fs.createReadStream(fullPath)
                    .pipe(fs.createWriteStream(fullDestPath))
                    .on('close', () => {
                        finished++
                        if (finished == length) {
                            resolve()
                        }
                    })
            })
        })
    })(sourcePath, destPath)
}

function runCommand(command, args = [], options) {
    let cmd = command
    if (os.platform() === 'win32') {
        args.unshift('/c', command)
        cmd = 'cmd.exe'
    }

    options = Object.assign({
        env: process.env,
        stdio: [0, 1, 2],
    }, options)
    
    return new Promise((resolve, reject) => {
        spawn(cmd, args, options)
            .on('exit', resolve)
            .on('close', resolve)
            .on('error', reject)
    })
}

async function copyHTML(dir = 'out/') {
    const cwd = process.cwd()
    let html = await readFile(path.join(__dirname, '../index.html'), 'utf-8')
    let files = await readdir(path.join(cwd, dir))

    let css = []
    let js = []
    files.forEach(file => {
        if (/\.js$/.test(file)) {
            js.push(file)
        } else if (/\.css$/.test(file)) {
            css.push(file)
        }
    })

    let cssTags = ''
    let jsTags = ''
    css.forEach(item => {
        cssTags += `<link rel="stylesheet" type="text/css" href="${dir}${item}" />`
    })
    js.forEach(item => {
        jsTags += `<script src="${dir}${item}"></script>`
    })
    html = html.replace(/<\/head>/, cssTags + '</head>')
                .replace(/<\/body>/, jsTags + '</body>')

    writeFile(path.join(cwd, `index.html`), html)
}

exports.cb2promise = cb2promise
exports.mkdirp = mkdirp
exports.createFile = createFile
exports.copy = copy
exports.runCommand = runCommand
exports.copyHTML = copyHTML
