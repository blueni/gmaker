#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const git = require('simple-git/promise')
const inquirer = require('inquirer')
const { cb2promise, copy, mkdirp, runCommand, copyHTML, createFile } = require('../build/utils')
// const package = require('../pkg/package.json')

const readdir = cb2promise(fs.readdir)
const cwd = process.cwd()
const [, , cmd] = process.argv

async function init() {
    let res = await readdir(cwd)
    if (res.indexOf('data') >= 0 && res.indexOf('docs') >= 0) {
        console.log('已经是一个GMaker项目了~')
        return
    }

    let mode = await selectProjectMode()
    let projectPath = `../pkgs/${mode}-mode`
    let package = require(path.join(projectPath, 'package.json'))

    // 初始化项目包文件
    package.name = path.basename(cwd)
    await createFile(path.join(cwd, 'package.json'), JSON.stringify(package, null, 4))
    await createFile(path.join(cwd, '.gitignore'), 'node_modules\ndist\n.cache\n')

    // 拷贝项目文件
    let reg = /node_modules|dist|cache|package|yarn-|\.git/
    await copy(path.join(__dirname, projectPath), cwd, (destPath) => {
        return reg.test(destPath)
    })
    await mkdirp(path.join(cwd, 'docs'))

    // 是否安装项目依赖
    await installDependencies()
    console.log('初始化GMaker项目完成~')
}

async function selectProjectMode() {
    let res = await inquirer.prompt([
        {
            name: 'mode',
            type: 'list',
            choices: ['react', 'vue'],
            message: '请选择框架来搭建项目',
        }        
    ])
    return res.mode
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

async function buildProject() {
    const parcel = path.join(cwd, `node_modules/.bin/parcel`)
    await runCommand(parcel, `build scripts${path.sep}index.js --no-content-hash --no-source-maps --out-dir out`.split(' '), {
        cwd
    })
    await copyHTML()
}

async function publishProject() {    
    await buildProject()

    const repo = git(cwd)
    await repo.add('./*')
    
    let { commit } = await inquirer.prompt([
        {
            name: 'commit',
            type: 'edit',
            message: '提交信息:',
        }
    ])
    await repo.commit(commit)

    let { remote } = require(path.join(cwd, 'config.json'))
    await repo.push(...remote)
}

;(async () => {
    switch (cmd) {
        case 'init':
        init()
        break
        
        case 'start':
        require('../boot.js')
        break
    
        case 'build':
        await buildProject()
        console.log('build success...')
        break

        case 'publish':
        await publishProject()
        console.log('publish success...')
    }
})()
