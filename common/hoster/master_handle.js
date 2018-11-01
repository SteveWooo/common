const fs = require("fs");
var from_master = {
	add_task_response : async (swc, data, socket)=>{
		console.log(data);
	}
}

async function connected(swc, socket){
	// console.log("connect");
	socket.on("data", (msg)=>{
		msg = msg.toString();
		let res = msg.match(/(\{.+?\})(?={|$)/g);
		// console.log(msg);
		for(var i=0;i<res.length;i++){
			try{
				res[i] = JSON.parse(res[i]);
				if(!(res[i].type in swc.hoster.master.from_master)){
					throw {
						code : "4040",
						message : "unknow type"
					}
				}
				swc.hoster.master.from_master[res[i].type](swc, res[i], socket);
			}catch(e){
				console.info(e);
			}
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
	},
	deploy : async (swc)=>{
		var file = {};

		function build_file(g){
			var dir = fs.readdirSync(g.path);
			for(var i=0;i<dir.length;i++){
				let stat = fs.statSync(g.path + "/" + dir[i]);
				if(stat.isFile()){
					let f = {
						type : "file",
						filename : dir[i],
						data : fs.readFileSync(g.path + "/" + dir[i]).toString()
					}
					g.content[dir[i]] = f;
				}else if (stat.isDirectory()){
					var d = build_file({
						type : "dir",
						dirname : dir[i],
						path : g.path + "/" + dir[i],
						content : {}
					})
					g.content[`${dir[i]}`] = d;
				}
			}
			return g;
		}
		file = build_file({
			type : "dir",
			dirname : "modules",
			path : "modules",
			content : {}
		});
		let final_data = JSON.stringify(file);
		global.swc.hoster.socket.write(JSON.stringify({
			type : "deploy",
			content : final_data,
			version : "1.0.0",
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