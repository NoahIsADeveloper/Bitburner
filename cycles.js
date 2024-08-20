import { getServers } from "./modules/server"
import { CYCLES } from "./settings"

function createBatch(ns) {
	let [hostables, hackables, totalRam] = getServers(ns)
	let target = hackables[0]
	
	let player = ns.getPlayer()
	let hackTime = ns.formulas.hacking.hackTime(target.server, player)
	let growTime = ns.formulas.hacking.growTime(target.server, player)
	let weakenTime = ns.formulas.hacking.weakenTime(target.server, player)

	let hackThreads = 50
	let weakenThreads1 = 100
	let growThreads =  50
	let weakenThreads2 = 100

	if (hackThreads + weakenThreads1 + growThreads + weakenThreads2 > Math.floor(totalRam / CYCLES.SCRIPT_SIZE)) { return }

	let threadsNeeded = [hackThreads, weakenThreads1, growThreads, weakenThreads2]
	let delaysNeeded = [weakenTime - hackTime, CYCLES.STEP_SIZE, weakenTime - growTime + 2 * CYCLES.STEP_SIZE, 3 * CYCLES.STEP_SIZE]

	for (let host of hostables) {
		let threads = host.ram / CYCLES.SCRIPT_SIZE
		
		while (threads > 0) {
			for (let index = 0; index < threadsNeeded.length; index++) {
				let usedThreads = Math.min(threadsNeeded[index], threads)
				if (usedThreads <= 0) { continue }
				
				if (!ns.fileExists(CYCLES.FILES_NEEDED[index], host.name)) {
					ns.scp(CYCLES.FILES_NEEDED[index], host.name, "home")
				}

				ns.tprint("exec")
				ns.exec(CYCLES.FILES_NEEDED[index], host.name, usedThreads, delaysNeeded[index], target.name)

				threadsNeeded[index] -= usedThreads
				threads -= usedThreads
				if (threads >= 0) { break }
			}
		}
	}
}

export async function main(ns) {
	//ns.disableLog("ALL")

	// !note! ns.getScriptName() is repeated twice, can be turned into a variable
	if (!await ns.prompt(`Do you allow ${ns.getScriptName()} to overwrite/create the following files on needed host servers? (${CYCLES.FILES_NEEDED.map(data => data).join(", ")})`)) { return }

	if (!ns.fileExists("Formulas.exe", "home")) {
		ns.tprint(`Failed because ${ns.getScriptName()} requires 'Formulas.exe' to run.`)
		return
	}

	while (true) {
		createBatch(ns)
		await ns.asleep(CYCLES.STEP_SIZE)
	}
}