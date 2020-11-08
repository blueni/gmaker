### 利用GMaker创建GitHub博客
GMaker是一键搭建静态网站的工具，由于项目数据全部使用文件存储，所以可以直接将项目当成GitHub Pages访问。

首先全局安装`GMaker`,`npm i gmaker -g`

#### 创建博客步骤
1. 创建git项目
如项目`blogs`

2. 设置项目GitHub Pages访问路径
	打开setting设置
	![](../public/images/gitpage1.png)
	设置访问的分支以及根目录
	![](../public/images/gitpage2.png)
	
3. 关联git项目到本地,在项目路径下使用`gmaker init`命令将项目初始化，按提示安装项目依赖

4. `npm start`，本地启动项目，访问（http://localhost:6688/#/admin） 添加个人博客

5. 博客添加完成，使用`npm run build`命令打包项目，并提交到git远程项目，这时访问GitHub Pages链接就能看到内容了

