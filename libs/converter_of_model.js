'use strict';
/**
 * 模型转换器
 */

const fs = require('fs');
const path = require('path');
const utils = require('../libs/utils');

module.exports = {
    models_dir: '',
    str2obj: function(routes_file_name){
        const ph = path.join(this.models_dir,routes_file_name+'.js');
        const fs_str = fs.readFileSync(ph,'utf8');
        
        const str_replace_out = utils.code_replace_str(fs_str); // 先替换掉字符串
        let cur_str = str_replace_out.str;
        
        const zs_replace_out = utils.code_replace_zs(cur_str);　// 再替换掉注释
        cur_str = zs_replace_out.str;
        
        // console.log("replace out str: \n"+cur_str);
        
        const start_n = cur_str.search(/cols.*:.*{/);
        const end_n = cur_str.indexOf('{',start_n);
        const set_end_n = utils.find_right_flag(cur_str,'{}',end_n);
        let out_str = cur_str.slice(end_n+1,set_end_n);
        // console.log("out_str:\n"+out_str);
        let out_objs = [];
        
        function fx_iteminfo(str){ // 分解单个字符串到一个对象
            let mh_n = str.indexOf(':');
            let field_name = str.slice(0,mh_n).trim();
            let out = {key: field_name};
            // 下面需要一次提取各个属性，包括：类型，默认值，是否允许为空，是否主键，备注描述，Getter 和 Setter，验证器
            // 提取 Getter / Setter 
            let field_setter_0 = str.search(/set *: *function/);
            if (~field_setter_0){ // 有set属性
                let field_setter_01 = str.indexOf(':',field_setter_0);
                let field_setter_1 = str.indexOf('{',field_setter_0);
                let field_setter_2 = utils.find_right_flag(str,'{}',field_setter_1);
                out.set = str.slice(field_setter_01+1,field_setter_2+1);
                str = str.replace(str.slice(field_setter_0,field_setter_2+1),'');
            }
            let field_getter_0 = str.search(/get *: *function/);
            if (~field_getter_0){ // 有get属性
                let field_getter_01 = str.indexOf(':',field_getter_0);
                let field_getter_1 = str.indexOf('{',field_getter_0);
                let field_getter_2 = utils.find_right_flag(str,'{}',field_getter_1);
                out.get = str.slice(field_getter_01+1,field_getter_2+1);
                str = str.replace(str.slice(field_getter_0,field_getter_2+1),'');
            }
            let field_validate_0 = str.search(/validate *: *{/);
            if (~field_validate_0){ // 有　validate 属性
                let field_validate_01 = str.indexOf(':',field_validate_0);
                let field_validate_1 = str.indexOf('{',field_validate_0);
                let field_validate_2 = utils.find_right_flag(str,'{}',field_validate_1);
                out.validate = str.slice(field_validate_01+1,field_validate_2+1);
                str = str.replace(str.slice(field_validate_0,field_validate_2+1),'');
            }
            /**
             * 将类型字符串转化为类型对象
             * @param {string} typestr　类型字符串，如：Sequelize.ARRAY(Sequelize.STRING(255)) 
             */
            function typestr_2_obj(typestr){
                // 去掉注释标记，将字符串替换回来
                typestr = utils.code_remove_zs(typestr);
                typestr = utils.code_unreplace_str({str: typestr,map_obj: str_replace_out.map_obj});
                let out = {
                    ps: []
                };
                let n_ = typestr.indexOf('.');
                let n_0 = typestr.indexOf('(');
                if (n_0==-1){
                    out.name = typestr.slice(n_+1);
                }else{
                    out.name = typestr.slice(n_+1,n_0);
                    let n_1 = utils.find_right_flag(typestr,'()',n_0);
                    let ps_str = typestr.slice(n_0+1,n_1);
                    if (~ps_str.indexOf('Sequelize')){ // 参数是子类型
                        out.ps.push(typestr_2_obj(ps_str)); // 此处假定：如果参数是子类型，则只有一个参数
                    }else{ // 参数是普通的基础类型
                        out.ps = eval(`[${ps_str}]`);
                    }
                }
                return out;
            }
            let field_type_0 = str.search(/type *: *Sequelize/);
            if (field_type_0==-1){
                throw new Error(`${field_name}列缺少 type 属性`);
            }
            let field_type_1 = str.indexOf('Sequelize',field_type_0);
            let field_type_2 = str.indexOf('\n',field_type_1);
            let field_type_bk0 = str.slice(field_type_1,field_type_2);
            field_type_bk0 = field_type_bk0.replace(/ /g,'');
            field_type_bk0 = utils.code_remove_zs(field_type_bk0);
            let field_type_bk9 = field_type_bk0.slice(-1);
            if (field_type_bk9==','){
                field_type_bk0 = field_type_bk0.slice(0,-1);
            }
            out.type = typestr_2_obj(field_type_bk0);
            let field_comment_0 = str.search(/comment *: */);
            if (field_comment_0!==-1){
                let field_comment_1 = str.indexOf('\n',field_comment_0);
                let field_comment_bk0 = str.slice(field_comment_0,field_comment_1);
                field_comment_bk0 = utils.code_remove_zs(field_comment_bk0);
                field_comment_bk0 = field_comment_bk0.replace(/ /g,'');
                field_comment_bk0 = field_comment_bk0.match(/##zfc[0-9]*?##/)[0];
                out.comment = eval(str_replace_out.map_obj[field_comment_bk0]);
            }
            let field_defaultValue_0 = str.search(/defaultValue *: */);
            if (field_defaultValue_0!==-1){
                let field_defaultValue_1 = str.indexOf('\n',field_defaultValue_0);
                let field_defaultValue_bk0 = str.slice(field_defaultValue_0,field_defaultValue_1);
                field_defaultValue_bk0 = utils.code_remove_zs(field_defaultValue_bk0);
                field_defaultValue_bk0 = field_defaultValue_bk0.replace(/ /g,'');
                let field_defaultValue_bk0_0 = field_defaultValue_bk0.indexOf(':');
                field_defaultValue_bk0 = field_defaultValue_bk0.slice(field_defaultValue_bk0_0+1).replace(',','');
                if (/##zfc[0-9]*?##/.test(field_defaultValue_bk0)){
                    field_defaultValue_bk0 = str_replace_out.map_obj[field_defaultValue_bk0];
                }
                if (field_defaultValue_bk0.indexOf('Sequelize')!==-1){
                    out.defaultValue = typestr_2_obj(field_defaultValue_bk0);
                }else{
                    out.defaultValue = eval(field_defaultValue_bk0);
                }
            }
            let field_allowNull_0 = str.search(/allowNull *: */);
            if (field_allowNull_0!==-1){
                let field_allowNull_1 = str.indexOf('\n',field_allowNull_0);
                let field_allowNull_bk0 = str.slice(field_allowNull_0,field_allowNull_1);
                field_allowNull_bk0 = utils.code_remove_zs(field_allowNull_bk0);
                field_allowNull_bk0 = field_allowNull_bk0.replace(/ /g,'');
                let field_allowNull_bk0_0 = field_allowNull_bk0.indexOf(':');
                field_allowNull_bk0 = field_allowNull_bk0.slice(field_allowNull_bk0_0+1).replace(',','');
                out.allowNull = eval(field_allowNull_bk0);
            }
            let field_primaryKey_0 = str.search(/primaryKey *: */);
            if (field_primaryKey_0!==-1){
                let field_primaryKey_1 = str.indexOf('\n',field_primaryKey_0);
                let field_primaryKey_bk0 = str.slice(field_primaryKey_0,field_primaryKey_1);
                field_primaryKey_bk0 = utils.code_remove_zs(field_primaryKey_bk0);
                field_primaryKey_bk0 = field_primaryKey_bk0.replace(/ /g,'');
                let field_primaryKey_bk0_0 = field_primaryKey_bk0.indexOf(':');
                field_primaryKey_bk0 = field_primaryKey_bk0.slice(field_primaryKey_bk0_0+1).replace(',','');
                out.primaryKey = eval(field_primaryKey_bk0);
            }
            let field_unique_0 = str.search(/unique *: */);
            if (field_unique_0!==-1){
                let field_unique_1 = str.indexOf('\n',field_unique_0);
                let field_unique_bk0 = str.slice(field_unique_0,field_unique_1);
                field_unique_bk0 = utils.code_remove_zs(field_unique_bk0);
                field_unique_bk0 = field_unique_bk0.replace(/ /g,'');
                let field_unique_bk0_0 = field_unique_bk0.indexOf(':');
                field_unique_bk0 = field_unique_bk0.slice(field_unique_bk0_0+1).replace(',','');
                out.unique = eval(field_unique_bk0);
            }
            return out;
        }
        
        while(out_str.length){
            let bk1 = out_str.search(/\w*:.*{/);
            let bk2 = out_str.indexOf('{',bk1);
            let bk3 = utils.find_right_flag(out_str,'{}',bk2);
            let item_str = out_str.slice(bk1,bk3+1);
            let item_obj = fx_iteminfo(item_str);
            out_objs.push(item_obj);
            out_str = out_str.slice(bk3+1);
            out_str = out_str.trim();
        }
    
        console.log("out_objs: \n"+JSON.stringify(out_objs,null,4));
        return out_objs;
    },
    obj2str: function(fields){
        function typeobj_2_str(type_obj){
            let pstr = '';
            let psarr = type_obj.ps.map(v=>{
                let v_type = typeof v;
                if (v_type=='string'){
                    return `"${v}"`;
                }
                if (v_type == "object"){
                    return typeobj_2_str(v);
                }
                return v;
            });
            pstr += psarr;
            let out_str = `Sequelize.${type_obj.name}`;
            if (pstr){
                out_str += `(${pstr})`;
            }
            return out_str;
        }
        function unfx_iteminfo(field){
            let typestr = typeobj_2_str(field.type);
            let str = `type: ${typestr},\n`;
            if (field.defaultValue!==undefined){
                // 分几种情况：字符串（外面需要加引号），数字，布尔值，json对象（需要JSON.stringify）
                let dv_type = typeof field.defaultValue;
                if (dv_type == 'string'){
                    str += `defaultValue: '${field.defaultValue}',\n`;
                }
                if (dv_type == 'object'){
                    let dvl = JSON.stringify(field.defaultValue);
                    if (field.defaultValue.ps){
                        dvl = typeobj_2_str(field.defaultValue);
                    }
                    str += `defaultValue: ${dvl},\n`;
                }
                if (dv_type == 'number' || dv_type == 'boolean'){
                    str += `defaultValue: ${field.defaultValue},\n`;
                }
            }
            if (field.allowNull!==undefined){
                str += `allowNull: ${field.allowNull},\n`;
            }
            if (field.primaryKey!==undefined){
                str += `primaryKey: ${field.primaryKey},\n`;
            }
            if (field.unique!==undefined){
                str += `unique: ${field.unique},\n`;
            }
            str += 'comment: `'+field.comment+'`';
            str = `
            ${field.key}: {
                ${str}
            },
            `;
            return str;
        }
        let out_str = '';
        for (let f of fields){
            out_str += unfx_iteminfo(f);
        }
        out_str = out_str.slice(0,-1);
        console.log("\nout_str:\n"+out_str);
        return out_str;
    }
};