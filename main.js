// Modules to control application life and create native browser window
const {
	app,
	BrowserWindow,
	dialog
} = require('electron')
const path = require('path')
const request = require("request");
const ipc = require('electron').ipcMain;
const ncp = require('ncp');
const rimraf = require("rimraf");

var https = require('https');
var fs = require('fs');
var url = require('url');
var _ = require('lodash');
var moment = require('moment');
var Stream = require('stream').Transform;
var DecompressZip = require('decompress-zip');
const extract = require('extract-zip')

var mainWindow;
var devSpaceHome;
var packageName;
var dir;

// this is used when building for publish
var appSpaceHome = path.join(app.getPath('documents'), 'electron_hero_apps');
// this is used to point to the source files under source control
//var appSpaceHome = path.join(__dirname, 'app_spaces');


require('update-electron-app')();

console.log('args');
console.log(process.argv);


let homeRequirePath = __dirname + path.sep;

ipc.on('getRequirePath', (event, args) => {
	event.returnValue = homeRequirePath;
});

ipc.on('getAppSpaceHome', (event, args) => {
	event.returnValue = appSpaceHome;
});

ipc.on('getAppReference', (event, args) => {
	event.returnValue = app;
});

ipc.on('synMessage', (event, args) => {
	event.returnValue = args;
	createDynamicWindow(args);
});

ipc.on('downloadPackage', (event, args) => {
	event.returnValue = 'ok';
	downloadAndExtractZip(args);
});

app.on('window-all-closed', () => {
	app.dock.hide();
	app.quit();
})

ipc.on('runDevApp', (event, args) => {


	const dynamicWindow = new BrowserWindow({
		width: 1600,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		},
		icon: path.join(__dirname, 'icons', 'app_icon.icns')

	})
	// and load the index.html of the app.
	dynamicWindow.loadFile(args + '/index.html')


});


ipc.on('runAppSpace', (event, args) => {

	//createDynamicWindow(args + '/index.html');
	var windowInfo = JSON.parse(fs.readFileSync(path.join(args, 'mainWindow.json')));
	var newWindow = new BrowserWindow(windowInfo);
	newWindow.loadFile(path.join(args, 'index.html'));
	event.returnValue = 'ok';

});




ipc.on('setAppSpaceHome', (event, args) => {
	devSpaceHome = args
	return true;
})


function updateStatusMessage(message){
	//$('#installStatus').html(message);
	mainWindow.webContents.send('updateStatus', {
		'message':message
	})
}

function downloadAndExtractZip(args) {
	updateStatusMessage('Checking install directory...')
	packageName = args.packageName;
	var url = args.url;

	dir = path.join(appSpaceHome, packageName + '');
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	fs.readdir(dir, function(err, files) {
		if (err) {
			console.log(err);
		} else {
			if (files.length) {
				var selection = dialog.showMessageBoxSync({
					'message': 'Warning',
					'detail': 'Directory is not empty.  Cancel to abort, OK to install over existing files',
					'type': 'warning',
					'buttons': ['Cancel', 'OK'],
					'defaultId': 1
				})
				if (selection === 0) {
					updateStatusMessage('')
					return false;
				} else {
					rimraf(dir, function() {
						installPackage(args);
					});
				}
			} else {
				installPackage(args);
			}
		}
	});
}

function installPackage(args) {
	updateStatusMessage('Downloading package...')

	var downloadDir = path.join(appSpaceHome, 'downloads');
	if (!fs.existsSync(downloadDir)) {
		fs.mkdirSync(downloadDir);
	};
	
	try {
		request(args.url)
		  .pipe(fs.createWriteStream(path.join(appSpaceHome, 'downloads', 'package.zip')))
		  .on('close', function () {
		    console.log('File written!');
			decompressZip(args);
		  });		

	} catch(err) {
		console.log(err.message);
		updateStatusMessage('');
		rimraf(downloadDir, function() {
			rimraf(dir, function(){
				updateStatusMessage('')
				dialog.showMessageBoxSync({
					'message': 'Download Error',
					'detail': err.message,
					'type': 'error'
				})
			})
		})
		
	}
}

function decompressZip(args) {
	updateStatusMessage('Extracting files...')

	packageName = args.packageName;
	dir = path.join(appSpaceHome, "downloads");

	var unzipper = new DecompressZip(path.join(dir, 'package.zip'));

	unzipper.on('error', function(err) {
		console.log(err);
	});

	unzipper.on('extract', function(log) {

		console.log('here in extract...')
		setTimeout(cleanupAfterInstall,10);
		//fs.unlinkSync(path.join(dir,'package.zip'));
		//createDynamicWindow(path.join(dir,'index.html'));
	});

	unzipper.on('progress', function(fileIndex, fileCount) {
		console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
		//updateStatusMessage('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount)
	});


	unzipper.extract({
		path: dir,
		filter: function(file) {
			return file.type !== "SymbolicLink";
		}
	});

}

function cleanupAfterInstall() {
	updateStatusMessage('Cleaning up files...');
	sourceDirectory = path.join(appSpaceHome, 'downloads', packageName + '-master');
	directory = path.join(appSpaceHome, packageName)
	ncp.limit = 16;
	ncp(sourceDirectory, directory, function(err) {
		if (err) {
			return console.error(err);
			console.log(err);
		}
		var resp = fs.unlinkSync(path.join(dir, 'package.zip'));
		rimraf(dir, function() {
			//alert('App installed');
			updateStatusMessage('');
			dialog.showMessageBoxSync({
				'message': 'App Installed',
				'type': 'info'
			})
		});
	});
}


function openMainConsole() {
	try {
		mainWindow = new BrowserWindow({
			width: 700,
			height: 400,
			backgroundColor: '#f0f0f0',
			webPreferences: {
				preload: path.join(__dirname, 'preload.js')
			},
			webPreferences: {
				nodeIntegration: true
			},
			//icon: path.join(__dirname, "icon.icns")
		})

		// and load the index.html of the app.
		var dir = appSpaceHome;
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
			fs.mkdirSync(path.join(dir, 'downloads'));
		}
		mainWindow.loadFile('index.html')
		app.dock.show();
		// Open the DevTools.
		// mainWindow.webContents.openDevTools()
	} catch (err) {
		console.log(err);
	}
	
}

function createWindow() {
	// Create the browser window.
	const args = process.argv;
	if (args.length > 1 && args[1] != '.') {
		var appName = args[1];
		if (fs.existsSync( path.join(appSpaceHome, appName, 'mainWindow.json'))) {
			var windowInfo = JSON.parse(fs.readFileSync(path.join(appSpaceHome, appName, 'mainWindow.json')));
			var newWindow = new BrowserWindow(windowInfo);
			newWindow.loadFile(path.join(appSpaceHome, appName, 'index.html'));			
		} else {
			openMainConsole();
		}

	} else {
		openMainConsole()
	}
}



function createDynamicWindow(htmlFilename) {
	const dynamicWindow = new BrowserWindow({
		width: 1600,
		height: 600,
		// webPreferences: {
		// 	preload: path.join(__dirname, 'preload.js')
		// },
		webPreferences: {
			nodeIntegration: true
		}
	})
	// and load the index.html of the app.
	dynamicWindow.loadFile(htmlFilename)

}





// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.