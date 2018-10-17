const net = require("net");
const fs = require("fs");

function server(swc){
	return new Promise(resolve=>{
		const server = net.createServer((socket)=>{
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

function get_task_data(filename){
	var data = fs.readFileSync(`./common/mq/${filename}`).toString();
	return JSON.parse(data);
}

function write_task_data(filename, data){
	var data = fs.writeFileSync(`./common/mq/${filename}`, JSON.stringify(data));
}

module.exports = async(swc)=>{
	var mq = {
		get_task : (swc)=>{
			let tasks = get_task_data("tasks");
			let res = tasks.shift();
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
		socket : undefined
	}
	mq.socket = await server(swc)

	global.swc = {
		mq : {

		}
	}

	return mq;
}