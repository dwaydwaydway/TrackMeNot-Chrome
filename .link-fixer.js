nav_links = document.querySelectorAll("nav li > a");
console.log(nav_links)
nav_links.forEach(el => {
	classIndex = el.href.indexOf("#.");
	idSquiggleIndex = el.href.indexOf("~");
	if (classIndex > 0 && idSquiggleIndex > 0) {
		el.href = el.href.substring(0, classIndex) + el.href.substring(idSquiggleIndex - 1, el.href.length);
	}
	return el;
});