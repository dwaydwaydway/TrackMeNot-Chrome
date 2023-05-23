TrackMeNot-Chrome
=================

TrackMeNot portage on Chrome - now deploys to both Chrome and Firefox

Getting Set Up
clone the repository
`git clone {repo URL}`

<h3>Building the Project</h3>

to build for Firefox:
install web-ext globally:
`npm install --g web-ext`

run:
`web-ext build`

then in Firefox, navigate to `about:addons`
click on the gear icon on the top-right
and select `Install Add-on from File`

to install on Chrome:
navigate to `chrome://extensions/`
then click `Load unpacked`
and select the `TrackMeNot-Chrome` directory

<h4>Docs</h4>
The docs were built with a combination of JSDoc https://jsdoc.app and the docdash jsdoc template https://github.com/clenemt/docdash

install jsdoc (globally on your system):
`npm install -g jsdoc`

run npm install to install docdash (a dev-dependency, listed in the node project file, package.json):
`npm install`

build the docs:
`npm run generate-docs`

to view the docs, open
`out/index.html`

<h4>Known bugs:</h4>