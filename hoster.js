async function deploy(swc){
	swc.hoster.master.to_master.deploy(swc);
}

const fs = require("fs");

function send_task(num = 0, swc, options){
	if(num >= options.files.length){
		return ;
	}
	console.log(`add task : ${num} of ${options.files.length}`);
	var name = options.files[num].split('/');
	name = name[name.length-1];
	swc.hoster.master.to_master.add_task(swc, {
		module : "downloadSex",
		callback : "run",
		data : {
			src : options.files[num],
			filename : `../result/${options.dir}/${name}`
		}
	})
	setTimeout(()=>{
		send_task(num + 1, swc, options);
	}, 20)
}

async function main(){
	const swc = await require('./common/init')("hoster");
	deploy(swc);
	var files
	// files = fs.readFileSync('../result/datasrc').toString().split('\n');
	// send_task(0, swc, {
	// 	files : files,
	// 	dir : 'gif'
	// });

	files = fs.readFileSync('../result/imgsrc').toString().split('\n');
	send_task(0, swc, {
		files : files,
		dir : 'img'
	});
}

main();