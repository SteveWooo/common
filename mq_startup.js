async function main(){
	const swc = await require('./common/init')("master");
	swc.mq.master.run(swc);
}

main()