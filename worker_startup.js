const net = require("net");
const config = {
	port : "6654",
	host : "localhost"
}

function connect(){
	return new Promise(resolve=>{
		let client = new net.Socket();
		client.connect(config.port, config.host, ()=>{
			client.on("error", (err)=>{
				console.log(err);
			})
			console.log("connected");
			resolve(client);
		})
	})
}

async function main(){
	let client = await connect();
	// client.write(JSON.stringify({data:"hello"}));
	setInterval(()=>{
		client.write(JSON.stringify({data:"hello"}));
	}, 10)
	// client.destroy();
}

main();