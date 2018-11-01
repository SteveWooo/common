const fs = require("fs");

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
			error_message : res.error_message,
			etc : res.etc
		}))
	},
	/*
	* 动态部署代码
	*/
	deploy : async(swc, data, socket)=>{
		data.content = JSON.parse(data.content);
		swc.worker.master.deploy(swc, data);
	},
	/*
	* 重启
	*/
	restart : async(swc, data, socket)=>{
		process.exit();
	}
}

async function connected(swc, socket){
	socket.on("data", (msg)=>{
		msg = msg.toString();
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
			// console.log("===============================")
			console.log(msg)
			// console.log("===============================")
			console.log(e);
			process.exit();
		}
	})
}

function rmdir_rf(swc, path){
	let dir = fs.readdirSync(path);
	for(var i=0;i<dir.length;i++){
		let stat = fs.statSync(path + "/" + dir[i]);
		if(stat.isFile()){
			fs.unlinkSync(path + "/" + dir[i]);
		}
		if(stat.isDirectory()){
			rmdir_rf(swc, path + "/" + dir[i]);
		}
	}
	fs.rmdirSync(path);
}

async function deploy(swc, data){
	let content = data.content;
	let base_path = "./common/worker/worker_modules";
	//检查版本时间戳
	var version = fs.readFileSync(base_path + "/version").toString();
	version = JSON.parse(version);
	//表示最新版本 不需要部署
	if(version.time == data.time){
		return ;
	} else { //若非，把最新版本信息写入version中
		version.time = data.time;
		version.version = data.version;
		fs.writeFileSync(base_path + "/version", JSON.stringify(version));
	}
	//先把文件夹彻底删除掉
	rmdir_rf(swc, base_path + "/" + content.path);
	function build_file(g, param){
		fs.mkdirSync(param.base_path + "/" + g.dirname);
		param.base_path = param.base_path + "/" + g.dirname;
		// console.log(param)
		for(var i in g.content){
			if(g.content[i].type == "file"){
				// console.log(g.content[i].data)
				fs.writeFileSync(param.base_path + "/" + g.content[i].filename, g.content[i].data);
			} else if(g.content[i].type == "dir"){
				build_file(g.content[i], {
					base_path : param.base_path
				});
			}
		}
	}
	let param = {
		base_path : base_path
	}
	// console.log("deoloy")
	build_file(content, param);
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
		run : run,
		deploy : deploy
	}

	return master;
}
exports.init = init;