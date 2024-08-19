const OPTIONS = {
	"github" : "NoahIsADeveloper",
	"repository" : "Bitburner",
	"branch" : "main",
	"allowedExtensions" : [".js", ".script", ".txt"]
}

const URL = `raw.githubusercontent.com/${OPTIONS.github}/${OPTIONS.repository}/${OPTIONS.branch}/`;

export async function main(ns) {
	if (!await ns.prompt("Did you backup your files? (run 'download *' in terminal, and backup in Augmentations)")) { return }

	let toDownload = await fetch(`https://api.github.com/repos/${OPTIONS.github}/${OPTIONS.repository}/contents/?ref=${OPTIONS.branch}`)
	
	ns.tprint(toDownload)
}