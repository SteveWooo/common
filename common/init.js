const config = require('./config');

module.exports = async (type)=>{
	var swc = {
		config : config
	}

	if(swc.config.mode == "local"){
		swc.config.mq_server.host = "127.0.0.1";
		swc.config.worker.mq_server_host = "127.0.0.1";
		swc.config.hoster.mq_server_host = "127.0.0.1";
	}

	if(type == "master"){
		swc = await require("./mq/init_mq")(swc);
	} else if (type == "hoster"){
		swc = await require("./hoster/init_hoster")(swc);
	} else {
		swc = await require("./worker/init_worker")(swc);
	}

	return swc;
}