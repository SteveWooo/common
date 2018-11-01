async function deploy(swc){
	swc.hoster.master.to_master.deploy(swc);
}

function send_task(num = 0, swc){
	if(num > 10){
		return ;
	}
	console.log("add task : " + num);
	swc.hoster.master.to_master.add_task(swc, {
		module : "test",
		callback : "run",
		data : {
			message : "reveive number : " + num
		}
	})
	setTimeout(()=>{
		send_task(num + 1, swc);
	}, 20)
}

async function main(){
	const swc = await require('./common/init')("hoster");
	// deploy(swc);
	send_task(0, swc);
}

main();