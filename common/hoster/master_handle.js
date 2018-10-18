var from_master = {
	add_task_response : async (swc, data, socket)=>{
		console.log(data);
	}
}

async function connected(swc, socket){
	// console.log("connect");
	socket.on("data", (msg)=>{
		msg = msg.toString();
		// console.log(msg);
		try{
			msg = JSON.parse(msg);
			if(!(msg.type in swc.hoster.master.from_master)){
				throw {
					code : "4040",
					message : "unknow type"
				}
			}
			swc.hoster.master.from_master[msg.type](swc, msg, socket);
		}catch(e){
			console.info(e);
		}
	})
}


var to_master = {
	add_task : async (swc, task)=>{
		//此处需要签名
		global.swc.hoster.socket.write(JSON.stringify({
			type : "add_task",
			task : task,
			time : +new Date(),
			hoster_id : "",
			sign : ""
		}))
	}
}

async function init(swc){
	let master = {
		connected : connected,
		to_master : to_master,
		from_master : from_master
	}

	return master;
}
exports.init = init;