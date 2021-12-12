let sky = require("skynet-js");
const fs = require("fs");
const esbuild = require("esbuild");
const ejs = require("ejs");
let Walk = require("walkdir");
const path = require("path");
(async () => {
	let config = {};
	const client = new sky.SkynetClient();
	const { publicKey, privateKey } = sky.genKeyPairFromSeed(
		fs.readFileSync("./seed.txt", "utf8")
	);
	console.log(publicKey, privateKey);
	config.publicKey = publicKey;
	if (!fs.existsSync("./.build")) {
		fs.mkdirSync("./.build");
	}
	fs.writeFileSync("./.build/config.json", JSON.stringify(config));
	esbuild.build({
		entryPoints: [path.join(__dirname, "./js/index.js")],
		outdir: "./bundle",

		bundle: true,
		allowOverwrite: true,
		globalName: "handy",
		minify: true,
		write: true,
	});
	let paths = Walk.sync("./pages", {
		return_object: true,
	});

	// .map((p) => {
	// return path.relative(path.join(__dirname, "pages"), p);
	// });
	for (const file in paths) {
		// if (Object.hasOwnProperty.call(paths, file)) {
		const element = paths[file];

		if (element.isFile()) {
			let relP = path.relative(path.join(__dirname, "pages"), file);
			let buildedName;
			let pgName = path.basename(relP).slice(0, -4);
			if (pgName != "index") {
				buildedName = path.join(
					__dirname,
					"bundle",
					path.relative(path.join(__dirname, "pages"), path.dirname(file)),
					pgName,
					"index.html"
				);
			} else {
				buildedName = path.join(
					__dirname,
					"bundle",
					path.relative(path.join(__dirname, "pages"), path.dirname(file)),
					pgName + ".html"
				);
			}
			if (!fs.existsSync(path.dirname(buildedName))) {
				fs.mkdirSync(path.dirname(buildedName), { recursive: true });
			}
			fs.writeFileSync(buildedName, await ejs.renderFile(file, config));
		}

		// }
	}
})();
