dev:
	docker compose -f docker-compose.dev.yml run --service-ports --build --rm cms

docs-serve:
	cd docs && mdbook serve --open
