const crypto = require("crypto");

var from_client = {
	login : async (swc, data, socket)=>{
		/*
		status : 
			normal : 等待任务
			working : 任务中
		net :
			connect : 在线
			disconnect : 离线
		*/
		let worker_id = crypto.createHash("sha1").update(new Date() + Math.random().toString()).digest("hex");
		global.swc.mq.workers.push({
			worker_id : worker_id,
			socket : socket,
			status : "normal",
			net : "connect",
			task_id : "",
			update : +new Date()
		})
		socket.write(JSON.stringify({
			type : "login_response",
			worker_id : worker_id
		}))
	},
	heart_break : async(swc, data, socket)=>{
		let now = +new Date();
		let has_worker = false;
		for(var i=0;i<global.swc.mq.workers.length;i++){
			if(global.swc.mq.workers[i].worker_id == data.worker_id){
				has_worker = true;
				global.swc.mq.workers[i].update = +new Date();
			}
		}

		//socket未断线，但worker被排除的情况
		if(!has_worker){
			socket.write(JSON.stringify({
				type : "need_login"
			}))
		}
	},
	/*
	* 添加任务
	*/
	add_task : async(swc, data, socket)=>{
		let task = data.task;
		//0、生成任务ID（重）
		task.task_id = crypto.createHash("sha1").update(new Date() + Math.random().toString() + JSON.stringify(data.task)).digest("hex");
		//1、添加任务
		swc.mq.add_task(swc, task);
		//2、响应
		socket.write(JSON.stringify({
			type : "add_task_response",
			status : "success"
		}))
	},
	/*
	* 任务结束：从processing中拿出来
	* {taskid, status, message}
	*/
	finish_task : async(swc, data)=>{
		if(!data.task_id){
			return ;
		}
		var task = swc.mq.get_process_task(swc, data.task_id);
		if(data.status == "success"){
			//finished;
			console.log("done");
		} 

		if(data.status == "faile"){
			//放入失败队列中
			task.error_message = data.error_message;
			task.error_time = +new Date();
			swc.mq.error_task(swc, task);
		}
	}
}

//唯一请求入口
/*
{
	type : "login, finish"
}
*/
async function server_create(swc, socket){
	// console.log("connect");
	socket.on("data", (msg)=>{
		msg = msg.toString();
		// console.log(msg);
		try{
			msg = JSON.parse(msg);
			if(msg.message){
				console.log(msg.message);
			}
			if(!(msg.type in swc.mq.master.from_client)){
				throw {
					code : "4040",
					message : "unknow type"
				}
			}
			swc.mq.master.from_client[msg.type](swc, msg, socket);
		}catch(e){
			console.info(e);
		}
	})
}

var to_client = {
	/*
	* 任务调度
	*/
	distribute_task : async(swc)=>{
		for(var i = 0;i<global.swc.mq.workers.length;i++){
			//1、寻找嗷嗷待哺的节点
			if(global.swc.mq.workers[i].status == "normal" && 
				global.swc.mq.workers[i].net == "connect"){
				//2、拿任务
				let task = swc.mq.get_task(swc);
				if(!task){ //没任务 粮仓嗷嗷待哺
					break;
				}
				//3、投食 [0 .0]~ [foods]
				global.swc.mq.workers[i].socket.write(JSON.stringify({
					type : "do_task",
					task : task
				}));
			}
		}
	},
	/*
	* 心跳联系
	*/
	heart_break : async(swc)=>{
		for(var i = 0;i<global.swc.mq.workers.length;i++){
			global.swc.mq.workers[i].socket.write(JSON.stringify({
				type : "heart_break",
				time : +new Date()
			}))
		}
	}
}

var handle = {
	/*
	* 清理去世客户端（离线
	*/
	clean_client : async(swc)=>{
		let now = +new Date();
		for(var i = 0;i<global.swc.mq.workers.length;i++){
			if(now - global.swc.mq.workers[i].update >= swc.config.mq.span * 4){
				global.swc.mq.workers[i].net = "disconnect"; //状态改成离线
			} else {
				global.swc.mq.workers[i].net = "connect"; //状态为在线
			}

			/*
			* 任务列表为空+离线节点清理掉
			*/
			if(global.swc.mq.workers[i].net == "disconnect" &&
				global.swc.mq.workers[i].status == "normal"){
				global.swc.mq.workers.splice(i, 1);
				i --;
			}
		}
	}
}

/*
* （主）任务调度中心
*/
async function run(swc){
	console.log('\033[2J');
	try{
		//1、心跳
		swc.mq.master.to_client.heart_break(swc);
		//2、清理节点
		handle.clean_client(swc);
		//3、调度
		to_client.distribute_task(swc);
		//4、检查processing任务是否超时
		//TODO

		//日志：
		console.log("worker count: " + global.swc.mq.workers.length);

		setTimeout(()=>{
			run(swc);
		}, swc.config.mq.span)
	}catch(e){
		console.log(e);
		setTimeout(()=>{
			run(swc);
		}, swc.config.mq.span)
	}
}

//初始化
async function init(swc){
	let master = {
		server_create : server_create,
		run : run,
		to_client : to_client,
		from_client : from_client,
	}

	return master;
}
exports.init = init;