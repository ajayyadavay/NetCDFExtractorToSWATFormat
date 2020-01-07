
// var message = chrome.i18n.getMessage("@@ui_locale");//en_US
// alert(message);
// message = chrome.i18n.getMessage("@@extension_id");//id
// alert(message);
// message = chrome.i18n.getMessage("@@bidi_dir");//ltr
// alert(message);
// message = chrome.i18n.getMessage("@@bidi_start_edge");//left
// alert(message);
// message = window.navigator.language;//en-US
// alert(message);
// function getAcceptLanguages() {
  // chrome.i18n.getAcceptLanguages(function(languageList) {
    // var languages = languageList.join(",");
    // alert(languages);
  // })
// }
// getAcceptLanguages();


var bgPage = chrome.extension.getBackgroundPage();
if (bgPage.returnValue.status == 1)
{
	window.close();	
}

function ConvertToPDFPopupMenu() {
	bgPage.ConvertToPDFPopupMenu();
	window.close();	
}

function AppendToExistingPDFPopupMenu() {
	bgPage.AppendToExistingPDFPopupMenu();
	window.close();
}

function CreateAndEmailPopupMenu() {
	bgPage.CreateAndEmailPopupMenu();
	window.close();
}

function ToggleViewResultCheckbox() {
	var bViewPDF = document.getElementById("ViewResults").value;
	//alert((bViewPDF == 1) ? "0" : "1");
	bgPage.SetViewResultCheckbox(!(bViewPDF == 1));
	window.close();
}

function GetViewResultCheckbox() {
	return document.getElementById("ViewResults").value;
}


function ShowPreferencesDialog() {
  bgPage.ShowPreferencesDialog();
  window.close();
}

document.getElementById("ConvertToFoxitPDF").addEventListener('click', ConvertToPDFPopupMenu);
document.getElementById("AppendToExistingPDF").addEventListener('click', AppendToExistingPDFPopupMenu);
document.getElementById("CreateAndEmail").addEventListener('click', CreateAndEmailPopupMenu);
document.getElementById("ViewPDFResults").addEventListener('click', ToggleViewResultCheckbox);
document.getElementById("Preferences").addEventListener('click', ShowPreferencesDialog);

document.getElementById("ConvertToFoxitPDFText").innerText = chrome.i18n.getMessage("ConvertToFoxitPDF");
document.getElementById("AppendToExistingPDFText").innerText = chrome.i18n.getMessage("AppendToExistingPDF");
document.getElementById("CreateAndEmailText").innerText = chrome.i18n.getMessage("CreateAndEmail");
document.getElementById("ViewPDFResultsText").innerText = chrome.i18n.getMessage("ViewPDFResults");
document.getElementById("PreferencesText").innerText = chrome.i18n.getMessage("Preferences");

//GetViewResultCheckbox();
var method = new Object();
method.methodname = bgPage.g_Method_Get;
method.property = bgPage.g_Message_GetVivewResult;

bgPage.invoke(method);

chrome.extension.onRequest.addListener(
function(request, sender, sendResponse) {
	//alert(JSON.stringify(request));
	if (request.message == "SyncViewResultCheckbox")
	{
		//alert(request.message);
		//alert(request.Parameters.bViewResult);
		var bViewPDF = request.Parameters.bViewResult;
		document.getElementById("ViewPDFResultsCheckbox").checked = (bViewPDF == 1);
		document.getElementById("ViewResults").value = bViewPDF;
	}
	sendResponse(''); //chrome更新之后，需要response一个消息，否则会报 The message port closed before a response was received.

});