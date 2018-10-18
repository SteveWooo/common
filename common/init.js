const config = require('./config');

module.exports = async (type)=>{
	var swc = {
		config : config
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