#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const os = require('os')
const inquirer = require('inquirer')
const { cb2promise, copy, mkdirp, runCommand, copyHTML } = require('../build/utils')
const package = require('../pkg/package.json')

const writeFile = cb2promise(fs.writeFile)
const readdir = cb2promise(fs.readdir)
const cwd = process.cwd()
const [, , cmd] = process.argv

async function init() {
    let res = await readdir(cwd)
    if (res.indexOf('data') >= 0 || res.indexOf('docs') >= 0) {
        console.log('已经是一个gitpage博客项目了~')
        return
    }
    // 初始化项目包文件
    package.name = path.basename(cwd)
    await writeFile(path.join(cwd, 'package.json'), JSON.stringify(package, null, 4))
    await writeFile(path.join(cwd, '.gitignore'), 'node_modules\ndist\n.cache\n')

    // 拷贝项目文件
    await copy(path.join(__dirname, '../pkg'), cwd)
    await mkdirp(path.join(cwd, 'docs'))

    // 是否安装项目依赖
    await installDependencies()
    console.log('初始化gitpage博客项目完成~')
}

async function installDependencies() {
    let res = await inquirer.prompt([
        {
            name: 'install',
            type: 'confirm',
            message: '是否马上安装项目依赖？',
        }        
    ])

    if (!res.install) {
        return
    }

    return runCommand('npm', ['install'], {
        cwd,
    })
}

;(async () => {
    const parcel = path.join(cwd, `node_modules/.bin/parcel`)
    switch (cmd) {
        case 'init':
        init()
        break
        
        case 'start':
        require('../boot.js')
        break
    
        case 'build':
        await runCommand(parcel, `build scripts${path.sep}index.js --no-content-hash --no-source-maps --out-dir out`.split(' '), {
            cwd
        })
        await copyHTML()
        console.log('build success...')
    }    
})()
