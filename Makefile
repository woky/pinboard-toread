FILES := \
	manifest.json \
	background.html \
	options.html \
	output/generated/background.js \
	output/generated/options.js \
	output/generated/icon-16.png \
	output/generated/icon-24.png \
	output/generated/icon-32.png \
	output/generated/icon-48.png \
	output/generated/icon-64.png \
	output/generated/icon-96.png \
	output/generated/icon-128.png

.PHONY: all
all: $(FILES) tsconfig.json

output/generated/%.js:
	yarn run build

output/generated/icon-%.png: pinboard.svg
	inkscape -z -e $@ -w $* -h $* $<

.PHONY: zip
zip: $(FILES)
	mkdir -p output/archives
	apack output/archives/upload.zip $(FILES)

.PHONY: sign
.ONESHELL:
sign: SHELL := /bin/zsh
sign: $(FILES)
	mkdir -p output/{tree,archives}
	rsync -aR $(FILES) output/tree
	source .mozapi
	web-ext sign -s output/tree -a output/archives
