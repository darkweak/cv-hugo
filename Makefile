.PHONY: run setup

run:
	pnpm start

setup:
	pnpm i
	CGO_ENABLED=1 go install -tags extended github.com/gohugoio/hugo@latest
	open https://wkhtmltopdf.org/downloads.html