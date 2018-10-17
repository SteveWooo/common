const config = require('./config')

module.exports = async ()=>{
	var swc = {
		config : config
	}

	return swc;
}