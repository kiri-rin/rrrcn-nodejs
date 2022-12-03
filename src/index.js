const ee = require('@google/earthengine');
const key = require('../.local/ee-key.json')
ee.data.authenticateViaPrivateKey(key,()=>{
    ee.initialize(null,null,()=>{
    });

},(r)=>{console.log(r)});
