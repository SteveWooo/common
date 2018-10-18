async function main(){
	const swc = await require('./common/init')("hoster");
	swc.hoster.master.to_master.add_task(swc, {
		module : "demo",
		callback : "cb",
		data : {
			message : "hello"
		}
	})
}

main();