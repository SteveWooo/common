async function main(){
	const swc = await require('./common/init')();
	// let task = {
	// 	name : "STeveWoo"
	// }

	// swc.mq.add_task(swc, task);
	res = swc.mq.get_task(swc);
	console.log(res);
}

main()