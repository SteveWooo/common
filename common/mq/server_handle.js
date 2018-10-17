const net = require("net");
const fs = require("fs");

function init(swc){
	return new Promise(resolve=>{
		const server = net.createServer((socket)=>{
			swc.mq.master.server_create(swc, socket);
			socket.on("error", (err)=>{
				//ECONNRESET worker强制关闭
				console.log(err.code);
			})
		}).listen(swc.config.mq_server, (info)=>{
			console.info("server listen:" + swc.config.mq_server.port);
			resolve(server);
		});
	})
}

exports.init = init;