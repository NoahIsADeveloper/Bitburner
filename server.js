/** @param {NS} ns */

function getPrograms() {
	let programs = ["BruteSSH", "FTPCrack", "relaySMTP", "SQLInject", "HTTPWorm"];
	for (let i = 0; i <= programs.length - 1; i++) { if (!ns.fileExists(programs + ".exe")) { programs.splice(i, 1); i-- } }
	return programs
}

function nukeServer(ns, server) {
	let programs = getPrograms()
	if (ns.getServerNumPortsRequired(server) <= programs.length) {
		for (let index = 0; index <= programs.length - 1; index++) { ns[programs[i].toLowerCase()](server) }
		ns.nuke(server);
	}
}

export function server(ns, host) {
	nukeServer(ns, host)

	this.name = host
	this.server = ns.getServer(host)

	this.max = {};
	this.max.ram = ns.getServerMaxRam(host)
	this.max.cash = ns.getServerMaxMoney(host)

	Object.defineProperty(this, "cash", {
		get: function() {
			return ns.getServerMoneyAvailable(host)
		},
		enumerable: true
	})

	Object.defineProperty(this, "ram", {
		get: function() {
			return this.max.ram - ns.getServerUsedRam(host)
		},
		enumerable: true
	})
}

export function getAll() {

}