module.exports = {
	cb : async(swc, task)=>{
		// console.log(task);
		return {
			status : "success",
			// error_message : "",
			task_id : task.task_id,
		}
	}
}