'use strict';

const models = require('../models');

(async ()=>{
    let out = await models.banner.add_xx_num();
    console.log("out: "+ out);  
})().catch(e=>{
    console.error(e);
})