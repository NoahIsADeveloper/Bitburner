/** @param {NS} ns */
export async function main(ns) {
	await ns.asleep(ns.args[0])
	await ns.weaken(ns.args[1])
}