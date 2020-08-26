var currentEditableItem;
var oldText;
var currentListItem;

const {
	remote
} = require('electron')
const {
	Menu,
	MenuItem
} = remote



function setupContextMenu(items) {
	const contextMenu = new Menu()

    _.each(items, function(item){
        contextMenu.append(new MenuItem({
    		label: item.repoName,
    		click() {
                $('#gitRepoUrl').val(item.repoUrl);
    		}
    	}))
    })

	window.addEventListener('contextmenu', (e) => {
		e.preventDefault();
		var x = e.clientX;
		var y = e.clientY;
		var el = document.elementFromPoint(x, y);
		if ($(el).hasClass('gitRepoUrl')) {
			currentListItem = el;
			contextMenu.popup({
				window: remote.getCurrentWindow()
			})
		}

	}, false)

}


