const fs =require('fs');
const request = require("request");
const path = require("path");
function downloadFile(options){
	return new Promise(resolve=>{
		var stream = fs.createWriteStream(options.filename);
		console.log('downloading');
    	request({
    		url : options.src,
    		proxy : 'http://:@127.0.0.1:1080'
    	}).pipe(stream).on('close', ()=>{
    		resolve();
    		console.log('finished');
    	});
	})
}

module.exports = {
	run : async (swc, task)=>{
		console.log(task.data);
		var data = task.data;
		await downloadFile({
			src : data.src,
			filename : `${__dirname}/../../result/${data.filename}`
		})
		return {
			status : "success",
			task_id : task.task_id
		}
	}
}