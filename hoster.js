async function deploy(swc){ //逻辑脚本部署
	swc.hoster.master.to_master.deploy(swc);
}

// function send_task(num = 0, swc){
// 	if(num > 10){
// 		return ;
// 	}
// 	console.log("add task : " + num);
// 	swc.hoster.master.to_master.add_task(swc, {
// 		module : "test",
// 		callback : "run",
// 		data : {
// 			message : "reveive number : " + num
// 		}
// 	})
// 	setTimeout(()=>{
// 		send_task(num + 1, swc);
// 	}, 20)
// }

// async function main(){
// 	const swc = await require('./common/init')("hoster");
// 	// deploy(swc);
// 	send_task(0, swc);
// }
const fs = require("fs");
const mysql = require("mysql");
const config = {
	"mysql" : {
		"host"     : "localhost",
  		"user"     : "root",
  		"password" : "111111",
  		"database" : "porn",
  		"port" : "3306"
	}
}

function get_data(swc, sql, db_handle){
	return new Promise((resolve, reject)=>{
		db_handle.query(sql, (err, row)=>{
			if(err){
				console.log(err);
				reject(err);
				return ;
			}
			resolve(row);
			return ;
		})
	})
}
async function add_task(swc, num, vids){
	// swc.hoster.master.to_master.add_task(swc, {
	// 	module : "kuaiyaojing",
	// 	callback : "callback",
	// 	data : {
	// 		p : 1
	// 	}
	// })
	if(num >= vids.length){
		console.log("done");
		return ;
	}

	// var sql = "select * from `kuaiyaojing` where downloaded=0 and video_id=" + mysql.escape(vid[num].replace("\"));
	// var videos = await get_data(swc, sql, db_handle);
	// if(videos.length == 0){
	// 	setTimeout(()=>{
	// 		add_task(swc, num + 1, vids);
	// 	}, 20);
	// 	return ;
	// }

	swc.hoster.master.to_master.add_task(swc, {
		module : "kuaiyaojing",
		callback : "download",
		data : {
			video_id : vids[num].replace("\r", "")
		}
	})

	setTimeout(()=>{
		add_task(swc, num + 1, vids);
	}, 20);
}

async function main(){
	const swc = await require('./common/init')("hoster");
	swc.db_handle = mysql.createConnection(config.mysql);
	var vids = fs.readFileSync("./kuaiyaojing/vaild_vids").toString().split("\n");
	add_task(swc, 0, vids);
	// deploy(swc);
}

main();