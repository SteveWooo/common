var from_client = {
	login : async (swc, data)=>{

	},
	heart_break : async(swc, data)=>{

	}.
	finished_task : async(swc, data)=>{

	}
}

var to_client = {
	distribute_task : async(swc, client, task)=>{

	}
}

async function server_create(swc, socket){
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