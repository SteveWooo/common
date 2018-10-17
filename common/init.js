const config = require('./config');

module.exports = async ()=>{
	var swc = {
		config : config
	}

	swc.mq = await require("./mq/init_mq")(swc);

	return swc;
}