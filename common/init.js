const config = require('./config');

module.exports = async ()=>{
	var swc = {
		config : config
	}
	swc = await require("./mq/init_mq")(swc);

	return swc;
}