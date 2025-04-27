// chrome.devtools.panels.create(title, iconPath, pagePath, callback)
chrome.devtools.panels.create(
    "DOM Copier",                   // название вкладки в DevTools
    "icons/icon16.png",             // иконка (16×16)
    "panel.html",                   // HTML-файл с интерфейсом
    function(panel) {
        // здесь можно слушать события открытия/закрытия панели
        console.log("DevTools panel DOM Copier registered", panel);
    }
);
