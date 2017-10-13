'use strict';

const Router = require('koa-router');
const router = new Router();
const log = require('../libs/logger').tag('main');
const common = require('../libs/common');
const fs = require('fs');
const converter = require('../libs/converter_of_model');
const path = require('path');
const utils = require('../libs/utils');
const beautify = require('js-beautify').js_beautify;

let models_dir = ''; // 模型的目录

/**
 * @api {post} /main/set_models_dir 设置模型操作的目录  
 * @apiDescription 作者：李静  
 * 
 * @apiVersion 0.0.1
 * @apiName set_models_dir
 * @apiGroup Main
 * 
 * @apiParam {String} models_dir 模型目录 
 * 
 * @apiSuccess {Object} err ${错误信息}
 * @apiSuccess {Object} out ${成功信息}
 * @apiSuccessExample {json} 成功时返回的结果：
 * {
 * 	err: { code: 0 },
 * 	out: {
 * 		status: true
 * 	}
 * }
 */
router.post('/set_models_dir', async (ctx,next) => {
    let rbody = ctx.request.body;
    models_dir = rbody.models_dir;
    converter.models_dir = models_dir;
    ctx.body = { err: {code: 0}, out: {status: true} };
});

/**
 * @api {get} /main/model_list 获取当前模型目录下的所有模型名称  
 * @apiDescription 作者：李静  
 * 
 * @apiVersion 0.0.1
 * @apiName model_list
 * @apiGroup Main
 * 
 * @apiSuccess {Object} err ${错误信息}
 * @apiSuccess {Object} out ${成功信息}
 * @apiSuccessExample {json} 成功时返回的结果：
 * {
 * 	err: { code: 0 },
 * 	out: {
 * 		datas: [ ... ]
 * 	}
 * }
 */
router.get('/model_list', async (ctx,next) => {
    let query = ctx.query;
    if (!models_dir){ ctx.throw("模型目录必须先设置", 200); return; }
    let fileList = fs.readdirSync(models_dir);
    let datas = [];
    fileList.forEach(function(fileName) { // 除了index.js之外的所有文件都被认为是数据库模型文件
      if (fileName !== 'index.js' && fileName.indexOf('.js') !== -1) {
          datas.push(fileName.replace('.js',''));
      }
    });
    ctx.body = {
        err: { code: 0 },
        out: { datas }
    };
});

/**
 * @api {post} /main/add_model 添加一个新的模型  
 * @apiDescription 作者：李静  
 * 
 * @apiVersion 0.0.1
 * @apiName add_model
 * @apiGroup Main
 * 
 * @apiParam {String} model_name 模型名称 
 * @apiParam {String} model_desc 模型简介 
 * 
 * @apiSuccess {Object} err ${错误信息}
 * @apiSuccess {Object} out ${成功信息}
 * @apiSuccessExample {json} 成功时返回的结果：
 * {
 * 	err: { code: 0 },
 * 	out: {
 * 		status: true
 * 	}
 * }
 */
router.post('/add_model', async (ctx,next) => {
    let rbody = ctx.request.body;
    let model_name = rbody.model_name;
    // #region
    let model_str = `"use strict";
    /**
     * ${ rbody.model_desc }
     */
    const Sequelize = require('sequelize');
    const tableName = '${model_name}';
    const log = require('../libs/logger').tag('models-'+tableName);
    const util = require('util');
    
    module.exports = {
        tableName: tableName,
        cols: {
            id: {
                type: Sequelize.CHAR(36),
                defaultValue: Sequelize.UUIDV1,
                primaryKey: true,
                comment: 'uuid'
            }
        },
        sets: {
            timestamps: false,
            underscored: true,
            freezeTableName: false,
            tableName: tableName,
            indexes: [{
                fields: []
            }],
            classMethods: {
            },
            hooks: {
            }
        }
    };`;
    // #endregion
    const fpath = path.join(models_dir,model_name+'.js');
    fs.writeFileSync(fpath,model_str);
    ctx.body = { err: {code: 0}, out: {status: true} };
});

/**
 * @api {get} /main/model_info 根据模型名称获取某个模型的信息 
 * @apiDescription 作者：李静  
 * 
 * @apiVersion 0.0.1
 * @apiName model_info
 * @apiGroup Main
 * 
 * @apiParam {String} model_name 模型名称 
 * 
 * @apiSuccess {Object} err ${错误信息}
 * @apiSuccess {Object} out ${成功信息}
 * @apiSuccessExample {json} 成功时返回的结果：
 * {
 * 	err: { code: 0 },
 * 	out: {
 * 		data
 * 	}
 * }
 */
router.get('/model_info', async (ctx,next) => {
    let query = ctx.query;
    let infos = converter.str2obj(query.model_name);
    ctx.body = {
        err: { code: 0 },
        out: { infos }
    };
});

/**
 * @api {post} /main/save_model 保存模型  
 * @apiDescription 作者：李静  
 * 
 * @apiVersion 0.0.1
 * @apiName save_model
 * @apiGroup Main
 * 
 * @apiParam {String} model_name 模型名称 
 * @apiParam {Object} model_obj 模型信息对象 
 * 
 * @apiSuccess {Object} err ${错误信息}
 * @apiSuccess {Object} out ${成功信息}
 * @apiSuccessExample {json} 成功时返回的结果：
 * {
 * 	err: { code: 0 },
 * 	out: {
 * 		status: true
 * 	}
 * }
 */
router.post('/save_model', async (ctx,next) => {
    let rbody = ctx.request.body;
    let model_str = converter.obj2str(rbody.model_obj);
    replace_and_format(rbody.model_name,model_str);
    ctx.body = { err: {code: 0}, out: {status: true} };
});

/**
 * 将新设置的模型信息替换进去，并格式化整个文件
 * @param {string} model_name 模型名称
 * @param {string} model_str 新的模型结构信息字符串
 */
function replace_and_format(model_name,model_str){
    const fpath = path.join(models_dir,model_name+'.js');
    let fs_str = fs.readFileSync(fpath,'utf8');
    let start_n = fs_str.search(/cols.*:.*{/);
    let end_n = fs_str.indexOf('{',start_n);
    let set_end_n = utils.find_right_flag(fs_str,'{}',end_n);
    let out_str = fs_str.slice(end_n+1,set_end_n);
    fs_str = fs_str.replace(out_str,model_str);
    fs_str = beautify(fs_str, { indent_size: 4 }); // 格式化
    fs.writeFileSync(fpath,fs_str);
}

module.exports = router;