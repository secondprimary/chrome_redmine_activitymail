function save() {
	alert(31);
	if (window.localStorage == null) {
		alert('Local storage is required for changing providers');
		return;
	}
	window.localStorage.joymailfromname = "mememe";
}