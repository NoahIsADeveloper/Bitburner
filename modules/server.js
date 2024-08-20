/** @param {NS} ns */
var createdServerObjects = {}

export function getServers(ns) {
    let hostables = []
	let hackables = []	
	let totalRam = 0

    let toScan = ['home']
    let scanned = new Set(toScan)

	// !note! Add private servers to hostables

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
						totalRam += server.max.ram
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

    return [hostables, hackables, totalRam]
}

export function getServerClass(ns, host) {
	if (createdServerObjects[host]) {
		return createdServerObjects[host]
	} else {
		let server = new serverClass(ns, host)
		createdServerObjects[host] = server
		return server
	}
}

function getPrograms(ns) {
	let programs = ["BruteSSH", "FTPCrack", "relaySMTP", "SQLInject", "HTTPWorm"];
	for (let index = 0; index <= programs.length - 1; index++) { if (!ns.fileExists(programs[index] + ".exe")) { programs.splice(index, 1); index-- } }
	return programs
}

function nukeServer(ns, hostName) {
	// Prevents dumbass fucking ram allocation issue
	if (false) { ns.brutessh(); ns.ftpcrack(); ns.relaysmtp(); ns.sqlinject(); ns.httpworm()}
	
	// !note! no nuke if already nuked!!!!!
	let programs = getPrograms(ns)
	if (ns.getServerNumPortsRequired(hostName) <= programs.length) {
		for (let index = 0; index <= programs.length - 1; index++) { ns[programs[index].toLowerCase()](hostName) }
		ns.nuke(hostName);
		return true
	}
	return false
}

class serverClass {
	constructor(ns, host) {
		this.name = host;
		this.server = ns.getServer(host);

		this.max = {};
		this.max.ram = ns.getServerMaxRam(host);
		this.max.cash = ns.getServerMaxMoney(host);
		this.max.chance = 1 - ns.getServerBaseSecurityLevel(host) / 100;

		Object.defineProperty(this, "cash", {
			get: function () {
				return ns.getServerMoneyAvailable(host);
			},
			enumerable: true
		})

		Object.defineProperty(this, "ram", {
			get: function () {
				return this.max.ram - ns.getServerUsedRam(host);
			},
			enumerable: true
		})

		Object.defineProperty(this, "security", {
			get: function () {
				return ns.getServerSecurityLevel(host);
			},
			enumerable: true
		});
	}
}