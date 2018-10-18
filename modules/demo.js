module.exports = {
	cb : async(swc, task)=>{
		console.log(task.data.message);
		return {
			status : "success",
			// error_message : "",
			task_id : task.task_id,
		}
	}
}