/** @param {NS} ns */
export async function main(ns) {
	await ns.asleep(ns.args[0])
	ns.hack(ns.args[1])
}