// Modules to control application life and create native browser window
const {
	app,
	BrowserWindow
} = require('electron')
const path = require('path')
const ipc = require('electron').ipcMain;

var http = require('http');
var fs = require('fs');
var url = require('url');
var _ = require('lodash');
var moment = require('moment');
var Stream = require('stream').Transform;
var DecompressZip = require('decompress-zip');
var mainWindow;
var devSpaceHome;


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

ipc.on('runDevApp', (event, args) => {
	
	
	const dynamicWindow = new BrowserWindow({
		width: 1600,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		}
	})
	// and load the index.html of the app.
	dynamicWindow.loadFile(args + '/index.html')


});


ipc.on('runAppSpace', (event, args) => {

	//createDynamicWindow(args + '/index.html');
	var windowInfo = JSON.parse(fs.readFileSync(path.join(args, 'mainWindow.json')));
	var newWindow = new BrowserWindow(windowInfo);
	newWindow.loadFile(path.join(args,'index.html'));
	event.returnValue = 'ok';

});




ipc.on('setAppSpaceHome', (event, args) => {
	devSpaceHome = args
	return true;
})



// function downloadAndExtractZip(args) {
// 	var packageName = args.packageName;
// 	var url = args.url;
// 	var dir = __dirname + "/packages/" + packageName;
// 	if (!fs.existsSync(dir)) {
// 		fs.mkdirSync(dir);
// 	}
// 
// 	const file = fs.createWriteStream(dir + '/package.zip');
// 	http.get(url, response => {
// 		var stream = response.pipe(file);
// 		stream.on("finish", function() {
// 			console.log("done");
// 			decompressZip(args);
// 		});
// 	});
// }


// function decompressZip(args) {
// 
// 	var packageName = args.packageName;
// 	var dir = __dirname + "/packages/" + packageName;
// 	var unzipper = new DecompressZip(dir + '/package.zip');
// 
// 	unzipper.on('error', function(err) {
// 		console.log('Caught an error');
// 		console.log(err);
// 	});
// 
// 	unzipper.on('extract', function(log) {
// 		console.log('Finished extracting');
// 		console.log(log);
// 		fs.unlinkSync(dir + '/package.zip');
// 		createDynamicWindow(dir + '/index.html');
// 	});
// 
// 	unzipper.on('progress', function(fileIndex, fileCount) {
// 		console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
// 	});
// 
// 
// 	unzipper.extract({
// 		path: dir,
// 		filter: function(file) {
// 			return file.type !== "SymbolicLink";
// 		}
// 	});
// }

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 700,
		height: 400,
		backgroundColor: '#f0f0f0',
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		},
		webPreferences: {
			nodeIntegration: true
		},
		icon: path.join(__dirname , "icon.icns")
	})

	// and load the index.html of the app.
	mainWindow.loadFile('index.html')

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
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