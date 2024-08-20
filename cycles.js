import { getServers } from "./modules/server."
import { CYCLES } from "./settings"

function createBatch(ns) {
	let [hostables, hackables, totalRam] = getServers()
	let target = hackables[0]
	
	let player = ns.getPlayer()
	let hackTime = ns.formulas.hacking.hackTime(target.server, player)
	let growTime = ns.formulas.hacking.growTime(target.server, player)
	let weakenTime = ns.formulas.hacking.weakenTime(target.server, player)

	let hackPercent = ns.formulas.hacking.hackPercent(target.server, player)

	let hackThreads = Math.floor(CYCLES.HACK_AMOUNT / hackPercent)
	let weakenThreads1 = Math.ceil((target.max.chance - target.security) * 20) // !note! dumb
	let growThreads =  hackThreads * 10 // !note! idiotic
	let weakenThreads2 = growThreads * 20 // !note! stupid

	if (hackThreads + weakenThreads1 + growThreads + weakenThreads2 > totalRam / CYCLES.SCRIPT_SIZE) { return }

	let threadsNeeded = [hackThreads, weakenThreads1, growThreads, weakenThreads2]
	let delaysNeeded = [weakenTime - hackTime, CYCLES.STEP_SIZE, weakenTime - growTime + 2 * CYCLES.STEP_SIZE, 3 * CYCLES.STEP_SIZE]

	for (host of hostables) {
		let threads = host.ram / CYCLES.SCRIPT_SIZE
		
		while (threads > 0 && (hackThreads + weakenThreads1 + growThreads + weakenThreads2) > 0) {
			// God I wish there was a better way to do this
			for (let index = 0; index < threadsNeeded.length; index++) {
				let usedThreads = Math.min(threadsNeeded[index], threads)
				
				if (!ns.fileExists(CYCLES.FILES_NEEDED[index], host.name)) {
					ns.scp(CYCLES.FILES_NEEDED[index], host.name, "home")
				}

				ns.exec(CYCLES.FILES_NEEDED[index], host.name, delaysNeeded[index], target.name)

				threads -= usedThreads
				if (threads >= 0) { break }
			}
			if (hackThreads > 0) {
				let usedThreads = Math.min(hackThreads, threads)
				ns.exec()
				if (threads == usedThreads) { break }
				threads -= usedThreads
			}
		}
	}
}

export async function main(ns) {
	ns.disableLog("ALL")

	// !note! ns.getScriptName() is repeated twice, can be turned into a variable
	if (!await ns.prompt(`Do you allow ${ns.getScriptName()} to overwrite/create the following files on needed servers? (${CYCLES.FILES_NEEDED.map(data => data[0]).join(", ")})`)) { return }

	if (!ns.fileExists("FORMULAS.exe", "home")) {
		ns.tprint(`Failed because ${ns.getScriptName()} requires formulas.exe to run.`)
		return
	}

	while (true) {
		createBatch(ns)
		ns.asleep(CYCLES.STEP_SIZE)
	}
}