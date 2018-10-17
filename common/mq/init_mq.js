const net = require("net");
const fs = require("fs");

function get_task_data(filename){
	var data = fs.readFileSync(`./common/mq/file/${filename}`).toString();
	return JSON.parse(data);
}

function write_task_data(filename, data){
	var data = fs.writeFileSync(`./common/mq/file/${filename}`, JSON.stringify(data));
}

module.exports = async(swc)=>{
	global.swc = {
		mq : {
			workers : []
		}
	}
	var mq = {
		get_task : (swc)=>{
			let tasks = get_task_data("tasks");
			let res = tasks.shift();

			let processing = get_task_data("process");
			processing.push(res);

			write_task_data("process", processing);
			write_task_data("tasks", tasks);
			return res;
		},
		add_task : (swc, task)=>{
			let tasks = get_task_data("tasks");
			tasks.push(task);
			write_task_data("tasks", tasks);
		},
		error_task : (swc, task)=>{
			let tasks = get_task_data("error_task");
			tasks.push(task);
			write_task_data(tasks);
		},
		finished_task : (swc, task)=>{
			
		},
		master : await require("./master_handle").init(swc), //管理连接（心跳包管理），任务分发
		server : undefined,
	}
	swc.mq = mq;
	mq.server = await require("./server_handle").init(swc); //管理网络

	return swc;
}