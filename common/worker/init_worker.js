const net = require("net");
const fs = require("fs");

/*
* worker节点初始化
*/
module.exports = async(swc)=>{
	global.swc = {
		worker : {
			socket : undefined
		},
		master : {
			update : 0,
		}
	}

	var worker = {
		modules : require('../../modules/init_modules'),
		master : undefined,
	}
	swc.worker = worker;

	try{
		swc.worker.master = await require('./master_handle').init(swc);
		global.swc.worker.socket = await require('./server_handle')(swc);
	}catch(e){
		console.log(e);
	}

	return swc;
}