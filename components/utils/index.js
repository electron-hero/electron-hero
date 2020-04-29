



function getPreferences() {
	try {
		var data = fs.readFileSync('prefs.json', 'utf8');
		return JSON.parse(data);
	} catch (e) {
		return {}
	}
}

function savePreferences(prefs) {
	try {
		fs.writeFileSync('prefs.json', JSON.stringify(prefs));
	} catch (err) {
		// An error occurred
		console.error(err);
	}
}

function getPreference(key) {
	var prefs = getPreferences();
	return prefs[key];
}

function savePreference(key, value) {
	let prefs = getPreferences();
	prefs[key] = value;
	savePreferences(prefs);
}