const net = require("net");
const fs = require("fs");

function get_task_data(filename){
	var data = fs.readFileSync(`./common/mq/pool/${filename}`).toString();
	return JSON.parse(data);
}

function write_task_data(filename, data){
	var data = fs.writeFileSync(`./common/mq/pool/${filename}`, JSON.stringify(data));
}

/*
* master节点初始化
*/
module.exports = async(swc)=>{
	global.swc = {
		mq : {
			cache : {
				tasks_count : 0
			},
			workers : []
		}
	}
	var mq = {
		get_task : (swc, count=1, worker_id)=>{
			let tasks = get_task_data("tasks");
			let res = tasks.shift();
			if(res == undefined){
				return res;
			}
			global.swc.mq.cache.tasks_count = tasks.length;
			//被拿出来的时间
			res.pocessing_time = +new Date();
			//worker_id
			res.worker_id = worker_id;

			let processing = get_task_data("process");
			processing.push(res);

			write_task_data("process", processing);
			write_task_data("tasks", tasks);
			return res;
		},
		add_task : (swc, task)=>{
			let tasks = get_task_data("tasks");
			tasks.push(task);
			// console.log("event:push " + tasks.length);
			global.swc.mq.cache.tasks_count = tasks.length;
			write_task_data("tasks", tasks);
		},
		error_task : (swc, task)=>{
			let tasks = get_task_data("error_task");
			tasks.push(task);
			write_task_data("error_task", tasks);
		},
		get_process_task : (swc, task_id)=>{
			let processing = get_task_data("process");
			let res = undefined;
			for(var i=0;i<processing.length;i++){
				if(processing[i].task_id == task_id){
					res = processing[i];
					processing.splice(i, 1);
					i--;
					break;
				}
			}
			write_task_data("process", processing);

			return res;
		},
		master : undefined,
		server : undefined,
	}
	swc.mq = mq;

	try{
		swc.mq.master = await require("./master_handle").init(swc), //管理连接（心跳包管理），任务分发
		swc.mq.server = await require("./server_handle").init(swc); //管理网络
	}catch(e){
		console.log(e);
	}

	return swc;
}