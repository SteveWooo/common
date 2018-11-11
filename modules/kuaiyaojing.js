//http://app.kyj344.com:8880/api/public/?service=Video.getVideoList&uid=-9999&type=0&p=1
const request = require("request");
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

function get_info(swc, page){
	return new Promise(resolve=>{
		var option = {
			url : "http://app.kyj344.com:8880/api/public/?service=Video.getVideoList&uid=-9999&type=0&p=" + page,
			proxy : "http://:@127.0.0.1:1080"
		}

		request(option, function(err, res, body){
			if(err || res.statusCode != 200){
				resolve(undefined);
				return ;
			}

			body = JSON.parse(body);
			resolve(body);
		})
	})
}

function write_data(swc, sql, db_handle){
	return new Promise((resolve)=>{
		db_handle.query(sql, (err)=>{
			if(err){
				resolve(err);
				return ;
			}
			resolve("done");
			return ;
		})
	})
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

function sleep(time){
	return new Promise(resolve=>{
		setTimeout(()=>{
			resolve();
		}, time)
	})
}

async function callback(swc, task){
	var db_handle = mysql.createConnection(config.mysql);
	// console.log(task);
	var info = await get_info(swc, 1);
	if(!info || info.ret != 200){
		return {
			task_id : task.task_id,
			status : "faile",
			message : info.ret
		};
	}

	let data = info.data.info;
	console.log("length : " + data.length);
	for(var i=0;i<data.length;i++){
		let d = data[i];
		// console.log(i)
		var video = {
			image_url : d['thumb'],
			title : d['title'],
			uid : d["uid"],
			video_id : d['id'],
			video_url : d["href"]
		}

		for(var k in video){
			video[k] = mysql.escape(video[k]);
		}

		var sql = `INSERT INTO \`kuaiyaojing\` (\`image_url\`,\`video_id\`,\`uid\`,\`video_url\`,\`title\`) VALUES (${video["image_url"]},${video["video_id"]},${video["uid"]},${video["video_url"]},${video["title"]})`;
		let res = await write_data(swc, sql, db_handle);
		// console.log(res);
	}
	// await sleep(2000);
	console.log(new Date());
	console.log("==")
	return {
		task_id : task.task_id,
		status : "success"
	}
}

exports.callback = callback;

function download_file(swc, video){
	return new Promise(resolve=>{
		var fold = parseInt(video.video_id) % 10;
		var stream = fs.createWriteStream("J:\\media\\porn\\kuaiyaojing\\" + fold + "\\" + video["title"] + ".mp4");
		request(video.video_url).pipe(stream).on('close', ()=>{
			console.log("done:" + video["title"]);
			resolve("done");
		}).on("error", ()=>{
			resolve("faile");
		});
	})
}

const fs = require("fs");
async function download(swc, task){
	try{
		let data = task.data;
		var db_handle = mysql.createConnection(config.mysql);
		var sql = "select * from `kuaiyaojing` where downloaded=0 and video_id=" + mysql.escape(data["video_id"]);
		var videos = await get_data(swc, sql, db_handle);
		if(videos.length == 0){
			console.log("already download " + new Date());
			return {
				task_id : task.task_id,
				status : "success"
			}
		}
		let video = videos[0];
		// if(!video){
		// 	return {
		// 		task_id : task.task_id,
		// 		status : "success"
		// 	}
		// }
		video["title"] = video["title"] + video["video_id"];
		let res = await download_file(swc, video);
		if(res == "done"){ //修改下载状态
			sql = "update kuaiyaojing set downloaded=1 where video_id=" + mysql.escape(video["video_id"]);
			await write_data(swc, sql, db_handle);
		}
		db_handle.end();
		return {
			task_id : task.task_id,
			status : "success"
		}
	}catch(e){
		console.log(e);
		return {
			task_id : task.task_id,
			status : "success"
		}
	}
}

exports.download = download;