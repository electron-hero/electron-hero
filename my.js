const {
	dialog,
	BrowserWindow,
} = require('electron').remote

//let devHomeDirectory = path.join(__dirname , 'app_spaces_dev');


// this is the path used for builds
let homeDirectory = path.join(app.getPath('documents'), 'electron_hero_apps');
// this is the path used for development
//let homeDirectory = path.join(__dirname, 'app_spaces');



function appDropDownChange() {
	
	let workingDirectory = path.join(__dirname, 'app_spaces', $('#customAppSpaces').val() )
}



function handleClick(filename) {
	let reply = ipc.sendSync('synMessage', filename);
}

// function downloadZipFile(info) {
// 	let reply = ipc.sendSync('downloadPackage', info);
// }

function getAppReference() {
	// let appRef = ipc.sendSync('getAppReference', '');
	// alert(appRef);
	alert(app);
}


function downloadFile(filename) {
	// var req = request({
	// 	method:'GET',
	// 	uri: filename
	// })
	// var out = fs.createWriteStream(path.join(__dirname,'downloads','package.zip'));
	// req.pipe(out);
	// req.on('end', function(){
	// 	console.log('all done');
	// 	var appName = $('#gitRepoUrl').val().split('/').pop();
	// 	console.log(appName);
	// })
}

function doGitInstall() {
	
	// git.cwd(path.join(__dirname, 'app_spaces'))
	var downloadUrl = $('#gitRepoUrl').val() + '/archive/master.zip';
	console.log(downloadUrl);
	downloadFile(downloadUrl);
	var info = {
		packageName: $('#gitRepoUrl').val().split('/').pop(),
		url: downloadUrl
	}
	console.log(info);
	let reply = ipc.sendSync('downloadPackage', info);
	


	// git.clone(repoPath, function(err, data) {
	// 	if (err) {
	// 		alert(err);
	// 	} else {
	// 		alert('App installed successfully')
	// 	}
	// })

}

function runAppSpace(space) {
	// var contents = fs.readFileSync(devHomeDirectory + $('#customAppSpaces').val() + '/mainWindow.js', 'utf8');
	// const mainWindow = new BrowserWindow(contents);
	// mainWindow.loadFile(devHomeDirectory + $('#customAppSpaces').val() + '/index.html')
	if (space === 'apps') {
		let reply = ipc.sendSync('runAppSpace', path.join(homeDirectory , $('#customAppSpaces').val()));
	}
	if (space === 'devapps') {
		let reply = ipc.sendSync('runAppSpace', path.join(devHomeDirectory , $('#customAppSpaces').val()));
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
			const curPath = path.join(path, file);
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



function getSubDirectories(_path) {
	console.log(_path);
	
	var dirs = [];
	var info = fs.readdirSync(_path);
	_.each(info, function(item) {
		console.log('looking...');
		if (item.substr(0, 1) != '.') {
			if (path.extname(path.join(_path,item)) == '') {
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
			if (path.extname(path.join(devHomeDirectory,item)) == '') {
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
	var path = path.join(__dirname, devHomeDirectory , appSpaceName);
	deleteFolderRecursive(path);
}

// function installStarterApp() {
// 	const directory = devHomeDirectory;
// 	let startName = $('#startAppDropDown').val();
// 	const sourceDirectory = __dirname + '/package_dev_starters/' + startName;
// 	const path = directory;
// 
// 	var resp = deleteFolderRecursive(directory)
// 
// 	ncp.limit = 16;
// 	ncp(sourceDirectory, directory, function(err) {
// 		if (err) {
// 			return console.error(err);
// 		}
// 		console.log('done!');
// 	});
// }

const ipc = require('electron').ipcRenderer