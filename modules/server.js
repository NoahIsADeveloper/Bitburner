/** @param {NS} ns */
var createdServerObjects = {}

function getPrograms() {
	let programs = ["BruteSSH", "FTPCrack", "relaySMTP", "SQLInject", "HTTPWorm"];
	for (let i = 0; i <= programs.length - 1; i++) { if (!ns.fileExists(programs + ".exe")) { programs.splice(i, 1); i-- } }
	return programs
}

function nukeServer(ns, hostName) {
	let programs = getPrograms()
	if (ns.getServerNumPortsRequired(hostName) <= programs.length) {
		for (let index = 0; index <= programs.length - 1; index++) { ns[programs[i].toLowerCase()](hostName) }
		ns.nuke(hostName);
		return true
	}
	return false
}

export function getServers(ns) {
    let hostables = []
	let hackables = []

    let toScan = ['home']
    let scanned = new Set(toScan)

    while (toScan.length > 0) {
        let current = toScan.shift()
        let neighbors = ns.scan(current)

        for (let index = 0; index < neighbors.length; index++) {
            let neighbor = neighbors[index]
            if (!scanned.has(neighbor)) {
                scanned.add(neighbor)
                toScan.push(neighbor)
				
				if (nukeServer(ns, neighbor)) {
					let server = getServerClass(ns, neighbor)
					
					if (server.max.ram > 2) {
						hostables.push(server)
					}

					if (server.max.cash > 0 && ns.getServerRequiredHackingLevel(neighbor) <= ns.getHackingLevel()) {
						hackables.push(server)
					}
				}
            }
        }
    }

	hostables.sort((a, b) => b.max.ram - a.max.ram)
	hackables.sort((a, b) => (b.max.cash * b.max.chance) - (a.max.cash * a.max.chance))

    return [hostables, hackables]
}

export function getServerClass(ns, host) {
	if (createdServerObjects["host"]) {
		return createdServerObjects["host"]
	} else {
		let server = new serverClass(ns, host)
		createdServerObjects[host] = server
		return server
	}
}

class serverClass {
	constructor(ns, host) {
		this.name = host;
		this.server = ns.getServer(host);

		this.max = {};
		this.max.ram = ns.getServerMaxRam(host);
		this.max.cash = ns.getServerMaxMoney(host);
		this.max.chance = 1 - ns.getServerBaseSecurity(host) / 100;

		Object.defineProperty(this, "cash", {
			get: function () {
				return ns.getServerMoneyAvailable(host);
			},
			enumerable: true
		});

		Object.defineProperty(this, "ram", {
			get: function () {
				return this.max.ram - ns.getServerUsedRam(host);
			},
			enumerable: true
		});
	}
}