const OPTIONS = {
	"github" : "NoahIsADeveloper",
	"repository" : "Bitburner",
	"branch" : "main",
	"allowedExtensions" : [".js", ".script", ".txt"]
}

const URL = `https://raw.githubusercontent.com/${OPTIONS.github}/${OPTIONS.repository}/${OPTIONS.branch}/`;

export async function main(ns) {
	if (!await ns.prompt("Did you backup your files? (run 'download *' in terminal, and click 'Backup' in Augmentations)")) { return }
	let toDownload = await getFilesNeededToUpdate()
	if (!await ns.prompt(`Do you allow '${ns.getScriptName()}' to create/overwrite the following files: (${toDownload.map(data => data[0]).join(", ")})`)) { return }

	ns.tprint("Starting...")
	for (let data of toDownload) {
		let success = await ns.wget(URL + data[0], data[0], "home")
		ns.tprint(`${ns.fileExists(data[0]) ? "Overwriting" : "Creating"} ${data[0]} ${success ? "Successful" : "Unsuccessful"}`)
	}
	ns.tprint("Successfully updated scripts.")
}

async function getFilesNeededToUpdate(ns) {
	let response = await fetch(`https://api.github.com/repos/${OPTIONS.github}/${OPTIONS.repository}/git/trees/${OPTIONS.branch}?recursive=1`)
	let files = await response.json()
	let toDownload = []

	try
	{
		for (let file of files.tree) {
			if (isFileAllowed(file.path)) {
				toDownload.push([file.path])
			}
		}
	}
	catch{
		ns.tprint(`An error occured when trying to fetch files! ${files}`)
	}

	return toDownload
}

function isFileAllowed(fileName) {
	for (let ext of OPTIONS.allowedExtensions) {
		if (fileName.endsWith(ext)) {
			return true;
		}
	}
	return false;
}