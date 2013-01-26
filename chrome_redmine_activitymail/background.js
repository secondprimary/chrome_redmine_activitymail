function executeMailto(tab_id, subject, body, selection) {

	if (null == window.localStorage) {
		alert("LocalStorage must be enabled for changing options.");
		return;
	}

	var servername = window.localStorage.servername;
	var contextpath = window.localStorage.contextpath;
	var userid = window.localStorage.userid;
	var mailto = window.localStorage.mailto;
	if ((undefined == servername || '' == servername) ||
			(undefined == contextpath || '' == contextpath) ||
			(undefined == userid || '' == userid) ||
			(undefined == mailto || '' == mailto)) {
		alert("Please set the first initial.");
	}

	var now = new Date();
	var year = now.getYear();
	var month = now.getMonth() + 1;
	var day = now.getDate();
	if(year < 2000) { year += 1900; }
	if(month < 10) { month = "0" + month; }
	if(day < 10) { day = "0" + day; }

	var xmlHttpRequest = new XMLHttpRequest();
	var atomurl = createurl(servername, contextpath, userid, year, month, day);

	xmlHttpRequest.open("GET", atomurl, false);
	xmlHttpRequest.onreadystatechange = function() {
		if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
			// Get activitys.
			var entrys = xmlHttpRequest.responseXML.getElementsByTagName("entry");

			// names value example : "Redmine Title : userprefix familyname firstname".split(" ")
			var usernames = xmlHttpRequest.responseXML.getElementsByTagName("title")[0].childNodes[0].nodeValue.split(" ");
			// Get familyname
			var userfamilyname = usernames[usernames.length - 2];

			// Activity
			var activitys = "";
			for (var i=0; i < entrys.length; i++) {
				// get updated tag contents (ex: 2013-01-24T17:06:29+09:00
				var updated = entrys[i].getElementsByTagName("updated")[0].childNodes[0].nodeValue;
				console.log('updated : ' + updated);
				// today's activity filter
				if (updated.indexOf(year + "-" + month + "-" + day, 0) == 0) {
					// get ticket title value
					var tickettitle = entrys[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
					console.log('Ticket title : ' + tickettitle);
					activitys += tickettitle + "\n";
				}
			}

			// Create mailto link
			var action_url = "mailto:" + mailto + "?";
			action_url += "subject=" + encodeURIComponent("【作業報告】" + year + month + day + userfamilyname) + "&";
			action_url += "body=";

			// Append action url.
			if (0 == activitys.length) {
				action_url += encodeURIComponent("私は今日は働いていません (ドヤッ");
			} else {
				// clipboard copied because of the problems url maxlength 1024.
				action_url += encodeURIComponent("Ctrl + v を押してください");
				activitys = "【本日の作業内容】\n" + activitys
				// TODO Get atom limit 15 .. ?
				if (15 <= entrys.length) {
					activitys += "\n\nさらに多くのチケットを更新しているので、詳細はRedmineを見てください。\nhttp://" + servername + "/" + contextpath + "/activity?user_id=" + userid;
				}
				copyTextToClipboard(activitys);
			}

			// Plain vanilla mailto links open up in the same tab to prevent blank tabs being left behind.
			console.log('Action url: ' + action_url);
			chrome.tabs.update(tab_id, { url: action_url });

		} else {
			alert("Oops!! Could not connect.\nURLをクリップボードにコピーしたのでアクセスしてみてください。");
			copyTextToClipboard(atomurl);
		}
	}
	xmlHttpRequest.send(null);
}

// via http://tande.jp/lab/2012/09/1889
var copyTextToClipboard = function(txt){
	var copyArea = $("<textarea/>");
	copyArea.text(txt);
	$("body").append(copyArea);
	copyArea.select();
	document.execCommand("copy");
	copyArea.remove();
}

function createurl(servername, contextpath, userid, year, month, day) {
	var result =
		"http://" + servername + "/" + contextpath + "/activity.atom?" +
		"user_id=" + userid + "&" +
		"from=" + year + "-" + month + "-" + day + "&" +
		"show_changesets=1&" +
		"show_documents=1&" +
		"show_files=1&" +
		"show_issues=1&" +
		"show_messages=1&" +
		"show_news=1&" +
		"show_time_entries=1&" +
		"show_wiki_edits=1&" +
		"with_subprojects=1";
	console.log(result);
	return result;
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