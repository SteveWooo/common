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
		console.log(res);
	}
	await sleep(2000);
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
		var stream = fs.createWriteStream("./kuaiyaojing/" + video["title"]);
		request(video.video_url).pipe(stream).on('close', ()=>{
			resolve("done");
		}).on("error", ()=>{
			resolve("faile");
		});
	})
}

const fs = require("fs");
async function download(swc, task){
	let data = task.data;
	data["title"] = data["title"] + data["video_id"];
	let res = await download_file(swc);
	if(res == "done"){
		await sleep(2000);
		return {
			task_id : task_id,
			status : "success"
		}
	} else {
		fs.appendFileSync("./kuaiyaojing/error_vid", data["video_id"]);
		return {
			task_id : task_id,
			status : "faile",
			error_message : {
				video : data
			}
		}
	}
	
}