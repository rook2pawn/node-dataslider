all:
	browserify ./examples/textthing/app1.js -o ./examples/textthing/js/bundle.js
	browserify ./examples/graphing/app1.js -o ./examples/graphing/js/bundle.js
	browserify ./examples/twographs/app1.js -o ./examples/twographs/js/bundle.js
textthing:
	browserify ./examples/textthing/app1.js -o ./examples/textthing/js/bundle.js
graphing:
	browserify ./examples/graphing/app1.js -o ./examples/graphing/js/bundle.js
twographs:
	browserify ./examples/twographs/app1.js -o ./examples/twographs/js/bundle.js
