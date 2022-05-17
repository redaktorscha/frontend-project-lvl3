install:
	npm ci
lint:
	npx eslint .
test:
	npm test -- --watch
test-coverage:
	npm test -- --coverage --coverageProvider=v8
build:
	rm -rf dist
	NODE_ENV=production npx webpack
dev:
	npx webpack serve


.PHONY: test