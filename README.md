# 数据库模型构建器（适用于特定框架）

### 基础环境  
- 开发环境安装： `sudo npm install electron -g`
- 打包工具： `sudo npm install asar -g`

## 步骤  
- 1.执行命令下载：`git clone git@github.com:muguang-lijing/model_builder.git`  
- 2.安装包：　　　`npm install`  
- 3.开发时启动，执行 `electron .`  
- 4.打包发布，确保pack.sh文件有执行权限，执行 `./pack.sh` 将生成的 `app.asar` 放到各个平台的electron环境中即可