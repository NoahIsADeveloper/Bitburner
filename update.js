const OPTIONS = {
	"github" : "NoahIsADeveloper",
	"repository" : "Bitburner",
	"branch" : "main",
	"allowedExtensions" : [".js", ".script", ".txt"]
}

const URL = `raw.githubusercontent.com/${OPTIONS.github}/${OPTIONS.repository}/${OPTIONS.branch}/`;

export async function main(ns) {
	if (!await ns.prompt("Did you backup your files? (run 'download *' in terminal, and backup in Augmentations)")) { return }
	let toDownload = await getFilesNeededToUpdate()
	if (!await ns.prompt(`Do you allow update.js to overwrite the following files: (${toDownload.map(data => data[0]).join(", ")})`)) { return }
	
	for (let data of toDownload) {
		ns.wget(data[1], data[0], "home")
	}
}

async function getFilesNeededToUpdate() {
	let response = await fetch(`https://api.github.com/repos/${OPTIONS.github}/${OPTIONS.repository}/contents/?ref=${OPTIONS.branch}`)
	let files = await response.json()
	let toDownload = []
	
	for (let file of files) {
		if (isExtensionAllowed(file.name)) {
			toDownload.push([file.name, file.download_url])
		}
	}

	return toDownload
}

function isExtensionAllowed(fileName) {
	for (let ext of OPTIONS.allowedExtensions) {
		if (fileName.endsWith(ext)) {
			return true;
		}
	}
	return false;
}