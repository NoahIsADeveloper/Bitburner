/** @param {NS} ns */

export function server(ns, host) {
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
