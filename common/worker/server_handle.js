const net = require("net");

function connect(swc){
	return new Promise(resolve=>{
		let client = new net.Socket();
		client.connect(swc.config.worker.mq_server_port, swc.config.worker.mq_server_host, async ()=>{
			swc.worker.master.connected(swc, client);
			client.on("error", (err)=>{
				//ECONNRESET master强制关闭
				console.log(err.code);
			})
			console.log("connected");
			resolve(client);
		})
	})
}

module.exports = async (swc)=>{
	let socket = await connect(swc);
	return socket;
}