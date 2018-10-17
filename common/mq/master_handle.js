var from_client = {
	login : async (swc, data)=>{

	},
	heart_break : async(swc, data)=>{

	},
	finished_task : async(swc, data)=>{

	}
}

var to_client = {
	distribute_task : async(swc, client, task)=>{

	}
}

function Worker(swc){
	this.status = "normal"; //normal working,
	this.id = "";
	this.task_id = ""; //正在进行的任务ID
	return this;
}

//唯一请求入口
async function server_create(swc, socket){
	console.log("connect");
	console.log(socket);
	socket.on("data", (msg)=>{
		msg = msg.toString();
		// console.log(msg);
		try{
			msg = JSON.parse(msg);
			console.info(msg);
		}catch(e){
			console.info(e);
		}
	})
}

async function init(swc){
	let master = {
		server_create : server_create
	}

	return master;
}
exports.init = init;