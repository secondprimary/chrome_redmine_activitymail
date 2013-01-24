// base > http://code.google.com/chrome/extensions/samples.html#028eb5364924344029bcbe1d527f132fc72b34e5

function customMailtoUrl() {
  if (window.localStorage == null)
    return "";
  if (window.localStorage.customMailtoUrl == null)
    return "";
  return window.localStorage.customMailtoUrl;
}

function executeMailto(tab_id, subject, body, selection) {
	var default_handler = customMailtoUrl().length == 0;
	var action_url = "mailto:xx@example.com?";
	var now = new Date();
	var year = now.getYear();
	var month = now.getMonth() + 1;
	var day = now.getDate();
	if(year < 2000) { year += 1900; }
	if(month < 10) { month = "0" + month; }
	if(day < 10) { day = "0" + day; }

	action_url += "subject=" + encodeURIComponent("【作業報告】" + year + month + day+ "氏名") + "&";
	action_url += "body=" + encodeURIComponent("【本日の作業内容】\n\n");

	var req = new XMLHttpRequest();
	req.open(
	    "GET",
	    "http://xxxxxxx/activity.atom?show_changesets=1&show_documents=1&show_files=1&show_issues=1&show_messages=1&show_news=1&show_time_entries=1&show_wiki_edits=1&with_subprojects=1&user_id=24",
	    false);
	req.onreadystatechange = function() {
		if (req.readyState == 4 && req.status == 200) {
			//alert(req.responseText)
			var entrys = req.responseXML.getElementsByTagName("entry");
			for (var i=0; i<entrys.length; i++){
				// get updated tag contents (ex: 2013-01-24T17:06:29+09:00
				var updatedValue = entrys[i].getElementsByTagName("updated")[0].childNodes[0].nodeValue;
				// today's activity filter
				if (updatedValue.indexOf(year + "-" + month + "-" + 24, 0) == 0) {
					// get ticket title value
					var ticketTitleValue = entrys[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
					//action_url += entrys[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
					action_url += encodeURIComponent(ticketTitleValue + "\n\n");
					//popup..?
					document.body.appendChild(ticketTitleValue);
					if (1000 < action_url.length) {
						// max 1024.. ?
						action_url.substring(0,1000);
						break;
					}
				}
			}

			if (!default_handler) {
				// Custom URL's (such as opening mailto in Gmail tab) should have a
				// separate tab to avoid clobbering the page you are on.
				var custom_url = customMailtoUrl();
				action_url = custom_url.replace("%s", encodeURIComponent(action_url));
				console.log('Custom url: ' + action_url);
				chrome.tabs.create({ url: action_url });
			} else {
				// Plain vanilla mailto links open up in the same tab to prevent
				// blank tabs being left behind.
				console.log('Action url: ' + action_url);
				chrome.tabs.update(tab_id, { url: action_url });
			}

		}
	}
	req.send(null);


}

chrome.extension.onConnect.addListener(function(port) {
	var tab = port.sender.tab;
	port.onMessage.addListener(function(info) {
		var max_length = 1024;
		if (info.selection.length > max_length)
			info.selection = info.selection.substring(0, max_length);
		executeMailto(tab.id, info.title, tab.url, info.selection);
	});
});

chrome.browserAction.onClicked.addListener(function(tab) {
	if (tab.url.indexOf("http:") != 0 && tab.url.indexOf("https:") != 0) {
		executeMailto(tab.id, "", tab.url, "");
	} else {
		chrome.tabs.executeScript(null, {file: "content_script.js"});
	}
});