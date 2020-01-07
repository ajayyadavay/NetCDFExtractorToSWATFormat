var bgPage = chrome.extension.getBackgroundPage();
var returnValue = new Object();
returnValue.status = 0; //0-调用完毕，1-正在调用exe
var g_bEnbleExtension = false;
var g_sNativeMessagingEXEVersion = "1.0";//用来判断兼容8.1及8.1以前的版本
var g_sNativeMessagingEXE82 = "8.2.0";
var g_Method_Get = "Get";
var g_Method_Install = "InstallChromeAddin";
var g_Method_Uninstall = "UninstallChromeAddin";
var g_Message_GetVersion = "sNativeMessagingEXEVersion";
var g_Message_GetVivewResult = "bViewResult";

/**
 * 注册标签页更新时的事件
 * 这里调用了initialize()事件，把func.js注入当前标签页中 
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //initialize(tabId);
	//alert('注册标签页更新时')
});

/**
 * 注册切换标签页时的事件
 * 这里调用了initialize()事件，把func.js注入当前标签页中
 */
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    //initialize(tabId);
	//alert('切换标签页时')
});

/**
 * 初始化方法 ，注入func.js事件
 * @param {Object} tabId
 */
function initialize(tabId){
    //chrome.tabs.executeScript(tabId, {file: "jquery-2.0.2.js", allFrames: true});
}

/**
 * 启动一个chrome.extension.onRequest事件监听器用来处理消息
 */
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    chrome.tabs.executeScript(null, {code: "switchLight("+ request +");", allFrames: true});
});

var bViewResult = false;
var bUninstall = false;

function sendNativeMessage(method, callback)
{
	returnValue.status =  1; //0-调用完毕，1-正在调用exe
	bViewResult = method.methodname == g_Method_Get && method.property == g_Message_GetVivewResult;
	bUninstall = method.methodname == g_Method_Uninstall;
	
	var hostName = "com.foxit.chromeaddin";
	var port = chrome.runtime.connectNative(hostName);
	
	port.onMessage.addListener(function(msg) {
		returnValue = msg;
		returnValue.status =  0;
	
		if(bViewResult)  
		{
			chrome.extension.sendRequest({"message" : "SyncViewResultCheckbox", "Parameters" : returnValue}, function(response) {});
		}
		else if(bUninstall)
		{
			chrome.extension.sendRequest({"message" : "UninstallSuccess", "Parameters" : returnValue}, function(response) {});
		}
		
		port.disconnect(); //chrome更新之后，这里需要web端手动断开连接，否则OnDisconnect之后会报“Native host has exited.”错误
		if (callback)
		{
			callback(returnValue);
		}
	});

	port.onDisconnect.addListener(function() {

	});
	
	method.langid = chrome.i18n.getMessage("@@ui_locale");
	
	var methodEncode = method;
	
	if (g_sNativeMessagingEXEVersion >= g_sNativeMessagingEXE82)
	{
		for (var key in methodEncode) 
		{
			//通过遍历对象属性的方法，遍历键值对，获得key，然后通过 对象[key]获得对应的值
			var value = methodEncode[key];
			//alert(key + " : " + value);
			methodEncode[key] = btoa(encodeURI(value));
		}
		methodEncode.interfaceVersion = "V2";
	}
	else
	{
		methodEncode.interfaceVersion = "V1";
	}

	port.postMessage(methodEncode);
}


function invoke(method, callback){
	
	if (returnValue.status == 1) return;
	
	if (method.URLs && g_sNativeMessagingEXEVersion >= g_sNativeMessagingEXE82)
	{
		chrome.cookies.getAll({"url": encodeURI(method.URLs)}, function(cookies) {

			if (cookies && cookies.length > 0)
			{
				var string = "";
				
				for(var i=0; i< cookies.length; i++) {
					cookie = cookies[i];
					string += cookie.name + "=" + cookie.value + ";";
				}
				method.cookies = string;
			}
			
			sendNativeMessage(method, callback);
		});
	}
	else
	{
		sendNativeMessage(method, callback);
	}
}

function ConvertToFoxitContextMenu(info, tab) { 

	if (!g_bEnbleExtension) return;
	
	var method = new Object();
	method.methodname = "ConvertToPDF";
	method.action = "Create";
	method.URLs = tab.url;
	if (g_sNativeMessagingEXEVersion >= g_sNativeMessagingEXE82)
	{
		method.title = tab.title;
		GetCurrentHtmlContent(function (htmlcontentData)
		{
			if (htmlcontentData && htmlcontentData.length > 0)
			{
				method.htmlcontent = htmlcontentData;
			}
			
			invoke(method);
		});
	}
	else
	{
		method.title = encodeURI(tab.title);
		invoke(method);
	}
} 
function AppendToExistingPDFContextMenu(info, tab) {
	
	if (!g_bEnbleExtension) return;
	
	var method = new Object();
	method.methodname = "ConvertToPDF";
	method.action = "Append";
	method.URLs = tab.url;
	if (g_sNativeMessagingEXEVersion >= g_sNativeMessagingEXE82)
	{
		method.title = tab.title;
		GetCurrentHtmlContent(function (htmlcontentData)
		{
			if (htmlcontentData && htmlcontentData.length > 0)
			{
				method.htmlcontent = htmlcontentData;
			}
			invoke(method);
		});
	}
	else
	{
		method.title = encodeURI(tab.title);
		invoke(method);
	}
} 

function ConvertLinkTargetToPDFContextMenu(info, tab) {
	
	if (!g_bEnbleExtension) return;
	
	var method = new Object();
	method.methodname = "ConvertToPDF";
	method.action = "Create";
	method.URLs = info.linkUrl;
	if (g_sNativeMessagingEXEVersion >= g_sNativeMessagingEXE82)
	{
		method.title = tab.title;
		invoke(method);
/* 		GetCurrentHtmlContent(function (htmlcontentData)
		{
			method.htmlcontent = htmlcontentData;
			invoke(method);
		}); */
	}
	else
	{
		method.title = encodeURI(tab.title);
		invoke(method);
	}
} 

function AppendLinkTargetToExistingPDFContextMenu(info, tab) {
	
	if (!g_bEnbleExtension) return;
	
	var method = new Object();
	method.methodname = "ConvertToPDF";
	method.action = "Append";
	method.URLs = info.linkUrl;
	if (g_sNativeMessagingEXEVersion >= g_sNativeMessagingEXE82)
	{
		method.title = tab.title;
		invoke(method);
/* 		GetCurrentHtmlContent(function (htmlcontentData)
		{
			method.htmlcontent = htmlcontentData;
			invoke(method);
		}); */
	}
	else
	{
		method.title = encodeURI(tab.title);
		invoke(method);
	}
}

/**
 * Create a context menus which will show up for all content.
 */

//chrome.contextMenus.create({"title": "Convert the Current Web Page to Foxit PDF", "contexts": ["all"], "onclick": ConvertToFoxitContextMenu});
chrome.contextMenus.create({"title": chrome.i18n.getMessage("ConvertToFoxitPDF"), "contexts": ["all"], "onclick": ConvertToFoxitContextMenu});
chrome.contextMenus.create({"title": chrome.i18n.getMessage("AppendToExistingPDF"), "contexts": ["all"], "onclick": AppendToExistingPDFContextMenu});

/**
 * Create a context menus which will show up for links.
 */
chrome.contextMenus.create({"title": chrome.i18n.getMessage("ConvertLinkTargetToPDF"), "contexts": ["link"], "onclick": ConvertLinkTargetToPDFContextMenu});
chrome.contextMenus.create({"title": chrome.i18n.getMessage("AppendLinkTargetToExistingPDF"), "contexts": ["link"], "onclick": AppendLinkTargetToExistingPDFContextMenu});

function ConvertToPDFPopupMenu()
{
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		
		var method = new Object();
		method.methodname = "ConvertToPDF";
		method.action = "Create";
		method.URLs = tabs[0].url;

		if (g_sNativeMessagingEXEVersion >= g_sNativeMessagingEXE82)
		{
			method.title = tabs[0].title;
			GetCurrentHtmlContent(function (htmlcontentData)
			{
				if (htmlcontentData && htmlcontentData.length > 0)
				{
					method.htmlcontent = htmlcontentData;
				}
				invoke(method);
			});
		}
		else
		{
			method.title = encodeURI(tabs[0].title);
			invoke(method);
		}
	});
}

function AppendToExistingPDFPopupMenu()
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		
		var method = new Object();
		method.methodname = "ConvertToPDF";
		method.action = "Append";
		method.URLs = tabs[0].url;
		if (g_sNativeMessagingEXEVersion >= g_sNativeMessagingEXE82)
		{
			method.title = tabs[0].title;
			GetCurrentHtmlContent(function (htmlcontentData)
			{
				if (htmlcontentData && htmlcontentData.length > 0)
				{
					method.htmlcontent = htmlcontentData;
				}
				invoke(method);
			});
		}
		else
		{
			method.title = encodeURI(tabs[0].title);
			invoke(method);
		}
	});
	
	chrome.tabs.getSelected(null, function(tab){
		//alert('getSelected:\n\n' + tab.url)
	});
}

function CreateAndEmailPopupMenu()
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		
		var method = new Object();
		method.methodname = "ConvertToPDF";
		method.action = "CreateAndEmail";
		method.URLs = tabs[0].url;
		if (g_sNativeMessagingEXEVersion >= g_sNativeMessagingEXE82)
		{
			method.title = tabs[0].title;
			GetCurrentHtmlContent(function (htmlcontentData)
			{
				if (htmlcontentData && htmlcontentData.length > 0)
				{
					method.htmlcontent = htmlcontentData;
				}
				invoke(method);
			});
		}
		else
		{
			method.title = encodeURI(tabs[0].title);
			invoke(method);
		}
	});
}

function GetViewResultCheckbox()
{
	var method = new Object();
	method.methodname = "Get";
	method.property = "bViewResult";
	invoke(method);

	return bViewPDF;
}

function SetViewResultCheckbox(bViewPDF)
{
	var method = new Object();
	method.methodname = "Set";
	method.property = "bViewResult";
	method.propertyValue = bViewPDF ? "1" : "0";
	
	invoke(method);
}

function ShowPreferencesDialog() {
	//alert(getBrowserInfo());//获取chrome版本号
	var method = new Object();
	method.methodname = "ShowPreferencesDialog";
	invoke(method);
	
/* 	var preprocessingScript = 'var As = document.getElementsByTagName(\"a\");for(var i = 0; i < As.length; i++){if (As[i].href.length > 0)As[i].href = As[i].href;}; ' + 
							  'var Metas = document.getElementsByTagName(\"meta\");for(var i = 0; i < Metas.length; i++){if (Metas[i].content.indexOf(\"text/html\") >= 0)Metas[i].content = \"text/html; charset=UTF-8\";}; ' + 
							  'var Links = document.getElementsByTagName(\"link\");for(var i = 0; i < Links.length; i++){if (Links[i].href.length > 0)Links[i].href = Links[i].href;}; ' + 
							  'var Scripts = document.getElementsByTagName(\"script\");for(var i = 0; i < Scripts.length; i++){if (Scripts[i].src.length > 0)Scripts[i].src = Scripts[i].src;}; ' + 
							  'var Imgs = document.getElementsByTagName(\"img\");for(var i = 0; i < Imgs.length; i++){if (Imgs[i].src.length > 0)Imgs[i].src = Imgs[i].src;}; ' + 
							  'document.documentElement.outerHTML';
							  
	chrome.tabs.executeScript(
		{code: preprocessingScript}, 
		//runAt: 'document_end', 
		function(htmlcontentData) {
			method.methodname = "ShowPreferencesDialog";
			method.htmlcontent = htmlcontentData;
			invoke(method);
		}
	);
	
	GetCurrentHtmlContent(function (htmlcontentData)
	{
		method.htmlcontent = htmlcontentData;
	}); */
}

function GetCurrentHtmlContent(callback)
{
	htmlcontentData = "";
	callback(htmlcontentData);
	return;//直接返回，暂时先不用获取内容的代码
	var preprocessingScript = 'var As = document.getElementsByTagName(\"a\");for(var i = 0; i < As.length; i++){if (As[i].href.length > 0)As[i].href = As[i].href;}; ' + 
							  'var Metas = document.getElementsByTagName(\"meta\");for(var i = 0; i < Metas.length; i++){if (Metas[i].content.indexOf(\"text/html\") >= 0)Metas[i].content = \"text/html; charset=UTF-8\";}; ' + 
							  'var Links = document.getElementsByTagName(\"link\");for(var i = 0; i < Links.length; i++){if (Links[i].href.length > 0)Links[i].href = Links[i].href;}; ' + 
							  'var Scripts = document.getElementsByTagName(\"script\");for(var i = 0; i < Scripts.length; i++){if (Scripts[i].src.length > 0)Scripts[i].src = Scripts[i].src;}; ' + 
							  'var Imgs = document.getElementsByTagName(\"img\");for(var i = 0; i < Imgs.length; i++){if (Imgs[i].src.length > 0)Imgs[i].src = Imgs[i].src;}; ' + 
							  'document.documentElement.outerHTML';
							  
	chrome.tabs.executeScript(
		{code: preprocessingScript}, 
		//runAt: 'document_end', 
		function(htmlcontentData) {
			if (callback)
			{
				callback(htmlcontentData);
			}
		}
	);
}

function getBrowserInfo()
{
	var agent = navigator.userAgent.toLowerCase() ;

	var regStr_ie = /msie [\d.]+;/gi ;
	var regStr_ff = /firefox\/[\d.]+/gi
	var regStr_chrome = /chrome\/[\d.]+/gi ;
	var regStr_saf = /safari\/[\d.]+/gi ;
	//IE
	if(agent.indexOf("msie") > 0)
	{
		return agent.match(regStr_ie);
	}

	//firefox
	if(agent.indexOf("firefox") > 0)
	{
		return agent.match(regStr_ff);
	}

	//Chrome
	if(agent.indexOf("chrome") > 0)
	{
		return agent.match(regStr_chrome);
	}

	//Safari
	if(agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0)
	{
		return agent.match(regStr_saf);
	}

}

function GetProtocolByURL(url)
{
	var protocol = "";
	var len = url.length;
	for (var i = 0; i < len; i++)
	{
		if (url[i] != ':')
		{
			protocol += url[i];
		}
		else
		{
			break;
		}
	}
	return protocol;
}
function EnbleExtension(bEnble)
{
	if (bEnble)
	{
		var details_popup = new Object();
		details_popup.popup = "popup.html";
		chrome.browserAction.setPopup(details_popup);

		var details_title = new Object();
		details_title.title = chrome.i18n.getMessage("default_title");
		chrome.browserAction.setTitle(details_title);

		var details_Icon = new Object();
		details_Icon.path = "logo32.png";
		chrome.browserAction.setIcon(details_Icon);
		
		g_bEnbleExtension = true;
		
	}
	else
	{
		var details_popup = new Object();
		details_popup.popup = "";
		chrome.browserAction.setPopup(details_popup);

		var details_title = new Object();
		details_title.title = "";
		chrome.browserAction.setTitle(details_title);

		var details_Icon = new Object();
		details_Icon.path = "Disable_32.png";
		chrome.browserAction.setIcon(details_Icon);
		
		g_bEnbleExtension = false;
	}
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
{
	//alert(tabs[0].url);
	if(tabs[0] && tabs[0].url)
	{
		var protocol = GetProtocolByURL(tabs[0].url);
		if (protocol == "https" || protocol == "http" || protocol == "file"/*  || protocol == "ftp" */)
		{
			EnbleExtension(true)
		}
		else
		{
			EnbleExtension(false)
		}
	}
});

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab)
{
	if (tab.url == "") 
	{
		return;
	}
		
	if (tab.selected)
	{
		var protocol = GetProtocolByURL(tab.url);
		if (protocol == "https" || protocol == "http" || protocol == "file"/*  || protocol == "ftp" */)
		{
			//alert(protocol);
			EnbleExtension(true)
		}
		else
		{
			EnbleExtension(false)
		}
	}
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) 
{
	chrome.tabs.get(tabId, function(tab)
	{
		//alert(tab.url);
		if (tab.url == "") 
		{
			return;
		}
		
		var protocol = GetProtocolByURL(tab.url);
		if (protocol == "https" || protocol == "http" || protocol == "file"/*  || protocol == "ftp" */)
		{
			//alert(protocol);
			EnbleExtension(true)
		}
		else
		{
			EnbleExtension(false)
		}
	});
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) 
{
	if(request.cmd=='ToggleSwitch')
	{
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
		{
			if (tabs[0] && tabs[0].url) 
			{
				var protocol = GetProtocolByURL(tabs[0].url);
				if (protocol == "https" || protocol == "http" || protocol == "file"/*  || protocol == "ftp" */)
				{
					//alert(protocol);
					EnbleExtension(true)
				}
				else
				{
					EnbleExtension(false)
				}
			}
		});
	}
	sendResponse('');
});

var method = new Object();
method.methodname = g_Method_Get;
method.property = g_Message_GetVersion;
bgPage.invoke(method, function(retValue) {
	if (retValue.sNativeMessagingEXEVersion)
	{
		g_sNativeMessagingEXEVersion = retValue.sNativeMessagingEXEVersion;
	}
	else//没有返回sNativeMessagingEXEVersion值，说明是8.2以前的版本， 设置默认版本号为1.0
	{
		g_sNativeMessagingEXEVersion = "1.0";
	}
});

/* chrome.management.onInstalled.addListener(function(exInfo){
    console.log('Extension '+exInfo.id+' has been installed.');
	alert("installed");
});

chrome.management.onUninstalled.addListener(function(exId){
    console.log('Extension '+exId+' has been uninstalled.');
	alert("uninstalled");
});

chrome.management.onEnabled.addListener(function(exInfo){
    console.log('Extension '+exInfo.id+' has been enabled.');
	alert("enabled");
});

chrome.management.onDisabled.addListener(function(exInfo){
    console.log('Extension '+exInfo.id+' has been disabled.');
	alert("disabled");
}); */

/* chrome.windows.onRemoved.addListener(function(windowId) 
{
	alert();
	chrome.windows.getAll({"populate":true}, function(windows) 
	{
		alert(2);
	});
}); */
