# 数据库模型构建器（适用于特定框架）
## 需求描述：  
- 首先选择model目录，选择之后如果有模型文件则可以加载该目录下的模型到界面
- 对于每个模型，会列出每列的详细信息，包括：名称，备注描述，类型，默认值，是否允许为空，是否是主键
- 对于每列的信息，都可以设置，也可以增加新的列，删除列
- 可以展示整个模型的简略信息：每个列显示名称和备注，可以同时肯到所有的模型信息

### 基础环境   
- 开发环境安装： `sudo npm install electron -g`
- 打包工具： `sudo npm install asar -g`

## 步骤  
- 1.执行命令下载：`git clone git@github.com:muguang-lijing/model_builder.git`  
- 2.安装包：　　　`npm install`  
- 3.开发时启动，执行 `electron .`  　
- 4.打包发布，确保pack.sh文件有执行权限，执行 `./pack.sh` 将生成的 `app.asar` 放到各个平台的electron环境中即可
- 5.下载各个平台下的可执行包[https://github.com/electron/electron/releases]，然后将第４步打包的app.asar放到各个平台可执行包的资源文件夹下就可以了，放到各个平台，就可以点击可执行文件直接使用了