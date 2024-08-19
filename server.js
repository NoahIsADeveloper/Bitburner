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

function scanServers(ns) {
    var scanned = []
    var toScan = ['home']
    var scannedSet = new Set(toScan)

    while (toScan.length > 0) {
        var current = toScan.shift()
        var neighbors = ns.scan(current)

        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i]
            if (!scannedSet.has(neighbor)) {
                scannedSet.add(neighbor)
                toScan.push(neighbor)
                scanned.push(neighbor)
            }
        }
    }

    return scanned
}

export function server(ns, host) {
	nukeServer(ns, host)

	this.name = host
	this.server = ns.getServer(host)

	this.max = {}
	this.max.ram = ns.getServerMaxRam(host)
	this.max.cash = ns.getServerMaxMoney(host)
	this.max.chance = ns.getServerBaseSecurity(host)

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