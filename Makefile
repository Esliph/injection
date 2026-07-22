COMPOSE ?= docker compose
SERVICE ?= workspace
RUN = $(COMPOSE) run --rm $(SERVICE)

.DEFAULT_GOAL := help

help:
	@echo Comandos disponiveis:
	@echo "  make install              - npm ci dentro do container"
	@echo "  make install-force        - npm install e atualiza o package-lock.json"
	@echo "  make add pkg=nome         - npm install nome"
	@echo "  make add-dev pkg=nome     - npm install -D nome"
	@echo "  make test                 - vitest em watch mode"
	@echo "  make test-run             - vitest run sem coverage"
	@echo "  make test-file file=x     - vitest run em um arquivo"
	@echo "  make test-name name=x     - vitest run -t filtrando pelo nome do teste"
	@echo "  make coverage             - vitest run com coverage em ./reports"
	@echo "  make build                - npm run build"
	@echo "  make typecheck            - tsc --noEmit"
	@echo "  make lint                 - eslint ."
	@echo "  make lint-fix             - eslint . --fix"
	@echo "  make format               - prettier --write"
	@echo "  make ci                   - install + test-run + build"
	@echo "  make npm cmd=...          - roda um comando npm arbitrario"
	@echo "  make exec cmd=...         - roda um comando arbitrario no container"
	@echo "  make sh                   - shell interativo no container"
	@echo "  make up / make down       - sobe / derruba o container de longa duracao"
	@echo "  make clean                - derruba tudo e apaga o volume node_modules"
	@echo "  make reset                - clean + install"
.PHONY: help

install:
	$(RUN) npm ci
.PHONY: install

install-force:
	$(RUN) npm install
.PHONY: install-force

add:
	$(RUN) npm install $(pkg)
.PHONY: add

add-dev:
	$(RUN) npm install -D $(pkg)
.PHONY: add-dev

test:
	$(RUN) npm test
.PHONY: test

test-run:
	$(RUN) npx vitest run --coverage.enabled=false
.PHONY: test-run

test-file:
	$(RUN) npx vitest run --coverage.enabled=false $(file)
.PHONY: test-file

test-name:
	$(RUN) npx vitest run --coverage.enabled=false -t $(name)
.PHONY: test-name

coverage:
	$(RUN) npx vitest run
.PHONY: coverage

build:
	$(RUN) npm run build
.PHONY: build

typecheck:
	$(RUN) npx tsc --noEmit
.PHONY: typecheck

lint:
	$(RUN) npx eslint .
.PHONY: lint

lint-fix:
	$(RUN) npx eslint . --fix
.PHONY: lint-fix

format:
	$(RUN) npx prettier --write .
.PHONY: format

ci: install test-run build
.PHONY: ci

npm:
	$(RUN) npm $(cmd)
.PHONY: npm

exec:
	$(RUN) sh -c "$(cmd)"
.PHONY: exec

sh:
	$(RUN) bash
.PHONY: sh

up:
	$(COMPOSE) up -d $(SERVICE)
.PHONY: up

down:
	$(COMPOSE) down
.PHONY: down

clean:
	$(COMPOSE) down -v
.PHONY: clean

reset: clean install
.PHONY: reset
