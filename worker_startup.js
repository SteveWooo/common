async function main(){
	const swc = await require('./common/init')();
	swc.worker.master.run(swc);
}

main();