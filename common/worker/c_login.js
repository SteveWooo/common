module.exports = async function(swc){
	global.swc.worker.socket.write(JSON.stringify({
		type : "login",
		message : "worker login"
	}))
}