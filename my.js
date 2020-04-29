const {
	dialog,
	BrowserWindow
} = require('electron').remote

let devHomeDirectory = __dirname + '/app_spaces_dev/';
let homeDirectory = __dirname + '/app_spaces/';


function handleClick(filename) {
	let reply = ipc.sendSync('synMessage', filename);
}

function downloadZipFile(info) {
	let reply = ipc.sendSync('downloadPackage', info);
}

function getAppReference() {
	// let appRef = ipc.sendSync('getAppReference', '');
	// alert(appRef);
	alert(app);
}

function doGitInstall() {
	var appSpace = $('#customDevAppSpaces').val();
	var cloneDir = homeDirectory + appSpace + '/';
	var repoPath = $('#gitRepoUrl').val();

	console.log(appSpace);
	if (appSpace === "") {
		alert('Please select a valid space');
		return;
	}
	var files = fs.readdirSync(cloneDir);
	if (files.length > 0) {
		alert('App space ' + appSpace + ' is not empty.  Please delete all files in directory and hit install again');
		return;
	}


	git().clone(repoPath, cloneDir, null, function(err, data) {
		if (err) {
			alert(err);
		} else {
			alert('App installed successfully')
		}
	})

}

function runAppSpace(space) {
	// var contents = fs.readFileSync(devHomeDirectory + $('#customAppSpaces').val() + '/mainWindow.js', 'utf8');
	// const mainWindow = new BrowserWindow(contents);
	// mainWindow.loadFile(devHomeDirectory + $('#customAppSpaces').val() + '/index.html')
	if (space === 'apps') {
		let reply = ipc.sendSync('runAppSpace', homeDirectory + '/' + $('#customAppSpaces').val());
	}
	if (space === 'devapps') {
		let reply = ipc.sendSync('runAppSpace', devHomeDirectory + '/' + $('#customAppSpaces').val());
	}

}

function openFinderWinow(mode) {
	if (mode === 'apps') {
		require('electron').shell.openExternal('file://' + homeDirectory);
	}
	if (mode === 'devapps') {
		require('electron').shell.openExternal('file://' + devHomeDirectory);
	}
}

function runDevApp() {
	var devDir = devHomeDirectory + $('#customAppSpaces').val();
	console.log(devDir);
	let reply = ipc.sendSync('runDevApp', devDir);
}

function deleteFolderRecursive(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach((file, index) => {
			const curPath = Path.join(path, file);
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
		return true;
	}
}

function selectCustomAppSpaceHome() {

	var thisWindow = require('electron').remote.getCurrentWindow();
	var path = dialog.showOpenDialogSync(thisWindow, {
		properties: ['openFile', 'openDirectory', 'createDirectory']
	});
	if (path > '') {
		savePreference('electron-hero-dev-directory', _.first(path));
		$('#customAppSpacesHome').val(_.first(path));
		devHomeDirectory = _.first(path) + '/';
	}
}



function getSubDirectories(path) {
	var dirs = [];
	var info = fs.readdirSync(path);
	_.each(info, function(item) {
		if (item.substr(0, 1) != '.') {
			if (Path.extname(path + '/' + item) == '') {
				dirs.push(item);
			}
		}
	})
	return dirs;
}

function getAppSpaces() {
	var dirs = [];
	var info = fs.readdirSync(devHomeDirectory);
	_.each(info, function(item) {
		if (item.substr(0, 1) != '.') {
			if (Path.extname(devHomeDirectory + '/' + item) == '') {
				dirs.push(item);
			}
		}
	})
	return dirs;
}

function buildAppSpaceDropdown() {

}

function createAppSpace() {
	var appSpaceName = $('#newAppSpaceName').val();
	let dir = __dirname + devHomeDirectory + args;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	fs.readdir(__dirname + devHomeDirectory, function(err, files) {
		console.log(files);
		event.returnValue = files;
	})
}

function deleteAppSpace() {
	var appSpaceName = $('#customAppSpaces').val();
	var path = __dirname + devHomeDirectory + appSpaceName;
	deleteFolderRecursive(path);
}

function installStarterApp() {
	const directory = devHomeDirectory;
	let startName = $('#startAppDropDown').val();
	const sourceDirectory = __dirname + '/package_dev_starters/' + startName;
	const path = directory;

	var resp = deleteFolderRecursive(directory)

	ncp.limit = 16;
	ncp(sourceDirectory, directory, function(err) {
		if (err) {
			return console.error(err);
		}
		console.log('done!');
	});
}

const ipc = require('electron').ipcRenderer