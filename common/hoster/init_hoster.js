const net = require("net");
function connect(swc){
	return new Promise(resolve=>{
		let client = new net.Socket();
		client.connect(swc.config.hoster.mq_server_port, swc.config.hoster.mq_server_host, async ()=>{
			swc.hoster.master.connected(swc, client);
			client.on("error", (err)=>{
				//ECONNRESET master强制关闭
				console.log(err.code);
			})
			resolve(client);
		})
	})
}

module.exports = async(swc)=>{
	try{
		global.swc = {
			hoster : {
				socket : undefined
			}
		}
		var hoster = {
			master : await require("./master_handle").init(swc)
		}
		
		swc.hoster = hoster;
		global.swc.hoster.socket = await connect(swc);
	}catch(e){
		console.log(e);
	}

	return swc;
}