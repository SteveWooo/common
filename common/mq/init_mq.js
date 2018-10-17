const net = require("net");
const fs = require("fs");

async function run(swc){
	const server = net.createServer((socket)=>{
		
	})
}

function get_task_data(filename){
	var data = fs.readFileSync(`./${filename}`).toString();
	return JSON.parse(data);
}

function write_task_data(data){
	var data = fs.writeFileSync("./tasks", JSON.stringify(data));
}

module.exports = async(swc)=>{
	var mq = {
		get_task : (swc)=>{
			let tasks = get_task_data("tasks");
			return tasks.shift();
		},
		add_task : (swc, task)=>{
			let tasks = get_task_data("tasks");
			tasks.push(task);
			write_task_data(tasks);
		},
		error_task : (swc, task)=>{
			let tasks = get_task_data("error_task");
			tasks.push(task);
			write_task_data(tasks);
		},
		socket : undefined
	}

	return mq;
}