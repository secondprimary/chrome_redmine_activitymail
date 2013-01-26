function init() {
	if (window.localStorage == null) {
		alert("LocalStorage must be enabled for changing options.");
		document.getElementById("servername").disabled = true;
		document.getElementById("contextpath").disabled = true;
		document.getElementById("userid").disabled = true;
		document.getElementById("mailto").disabled = true;
		document.getElementById("save").disabled = true;
		return;
	}

	var connecturl = "http://";

	// Default handler is checked. If we've chosen another provider, we must change the checkmark.
	if (undefined != window.localStorage.servername) {
		document.getElementById("servername").value = window.localStorage.servername;
		connecturl += window.localStorage.servername + "/";
	}
	if (undefined != window.localStorage.contextpath) {
		document.getElementById("contextpath").value = window.localStorage.contextpath;
		connecturl += window.localStorage.contextpath + "/activity.atom?";
	}
	if (undefined != window.localStorage.userid) {
		document.getElementById("userid").value = window.localStorage.userid;
		connecturl += "user_id=" + window.localStorage.userid;
	}
	if (undefined != window.localStorage.mailto) {
		document.getElementById("mailto").value = window.localStorage.mailto;
	}
	document.getElementById("connecttest").innerHTML = "<a href=\""+ connecturl + "\">Click test me</a>";
}

function save() {
	// Default handler is checked. If we've chosen another provider, we must change the checkmark.
	window.localStorage.servername = document.getElementById("servername").value;
	window.localStorage.contextpath = document.getElementById("contextpath").value;
	window.localStorage.userid = document.getElementById("userid").value;
	window.localStorage.mailto = document.getElementById("mailto").value;
}

// options.html ready
document.addEventListener('DOMContentLoaded', function () {
	// initialization
	init();
	// options.html in addEventListener
	document.querySelector('#save').addEventListener('click', save);
});