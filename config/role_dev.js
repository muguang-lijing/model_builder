/**
 *  用户角色配置
 */
'use strict';

const public_api = { // 所有角色都可以访问的api
    des: '公共api',
    cons: [
        {
            method: ['POST','GET'],
            include: /.*/
        }
    ]
};

const unknown = {
    des: '游客用户',
    cons: [
        {
            method: ['POST','GET'],
            include: /.*/
        }
    ]
};

const usr_normal = {
    des: '普通用户',
    cons: [
    ]
};

module.exports = {
    public_api,
    unknown,
    usr_normal,
    find_role_des: function(role_name){
        for(let k in this){
            if (typeof this[k]=="object"){
                if (k==role_name){
                    return this[k].des;
                }
            }
        }
    }
};