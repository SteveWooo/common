module.exports = {
	run : async (swc, task)=>{
		console.log(task.data);
		return {
			status : "success",
			task_id : task.task_id
		}
	}
}