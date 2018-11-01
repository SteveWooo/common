async function main(){
	const swc = await require('./common/init')("hoster");

	function send_task(num = 0){
		if(num > 10){
			return ;
		}
		console.log("add task : " + num);
		swc.hoster.master.to_master.add_task(swc, {
			module : "demo",
			callback : "cb",
			data : {
				message : "reveive number : " + num
			}
		})
		setTimeout(()=>{
			send_task(num + 1);
		}, 20)
	}
	send_task();

	// swc.hoster.master.to_master.deploy(swc);
}

main();