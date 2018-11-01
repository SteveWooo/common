const cluster = require("cluster");

async function main(){
	const swc = await require('./common/init')();
	swc.worker.master.run(swc);
}

var childs = [];

function create_child(now, core){
	if(now >= core){
		return ;
	}
	let child = cluster.fork();
	child.on("exit", ()=>{
		create_child(0, 1);
	})

	setTimeout(()=>{
		create_child(now + 1, core);
	}, 500)
}

if(cluster.isMaster){
	var argv = {};
	for(var i=2;i<process.argv.length;i++){
		if(process.argv[i].indexOf("-") == 0){
			argv[process.argv[i].replace("-","")] = process.argv[i + 1];
		}
	}

	//默认两条进程
	if(!argv.core){
		argv.core = 2;
	}

	create_child(0, argv.core);

} else {
	main();
}