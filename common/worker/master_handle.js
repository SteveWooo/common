var from_master = {
	heart_break : async (swc, data, socket)=>{
		if(!global.swc.worker.worker_id){
			return ;
		}
		global.swc.worker.socket.write(JSON.stringify({
			type : "heart_break",
			worker_id : global.swc.worker.worker_id
		}))

		global.swc.master.update = +new Date();
	},
	login_response : async(swc, data, socket)=>{
		global.swc.worker.worker_id = data.worker_id;
	},
	need_login : async(swc, data, socket)=>{
		console.log("need login");
		//直接终止进程比较好
		// swc.worker.master.to_master.login(swc, socket);
	},
	/*
	* 重点：任务处理：
	*/
	do_task : async(swc, data, socket)=>{
		//1、接受任务
		let task = data.task;
		if(!(task.module in swc.worker.modules)){
			global.swc.worker.socket.write(JSON.stringify({
				type : "finish_task",
				task_id : task.task_id,
				status : "faile",
				message : "WORKER_MODULE_NOT_FOUND"
			}));
			return ;
		}

		//2、开工
		var res = await swc.worker.modules[task.module][task.callback](swc, task);

		//3、反馈工作
		global.swc.worker.socket.write(JSON.stringify({
			type : "finish_task",
			task_id : res.task_id,
			status : res.status,
			error_message : res.error_message
		}))
	}
}

async function connected(swc, socket){
	socket.on("data", (msg)=>{
		msg = msg.toString();
		// console.log(msg);
		try{
			msg = JSON.parse(msg);
			if(!(msg.type in from_master)){
				throw {
					code : "4040",
					message : "unknow type"
				}
			}
			from_master[msg.type](swc, msg, socket);
		}catch(e){
			console.log(e);
		}
	})
}

var to_master = {
	login : require("./c_login")
}

async function run(swc){
	swc.worker.master.to_master.login(swc);
}

async function init(swc){
	let master = {
		connected : connected,
		to_master : to_master,
		from_master : from_master,
		run : run
	}

	return master;
}
exports.init = init;