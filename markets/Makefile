# --- Project settings ---
BINARY_NAME=app
CMD_DIR=./cmd
BIN_DIR=./bin

ENV ?= dev

# load .env automatically if ENV=dev and file exists
ifeq ($(ENV),dev)
  ifneq (,$(wildcard .env))
    include .env
    export $(shell sed 's/=.*//' .env)
  endif
endif

# --- Targets ---

.PHONY: build run start test clean docker-up docker-down

## Build the binary
build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BIN_DIR)
	@go build -o $(BIN_DIR)/$(BINARY_NAME) $(CMD_DIR)

## Run directly with go run
run:
	@echo "Running $(BINARY_NAME) from source (ENV=$(ENV))..."
	@ENV=$(ENV) go run $(CMD_DIR)

## Run the compiled binary
start: build
	@echo "Starting $(BINARY_NAME) binary (ENV=$(ENV))..."
	@ENV=$(ENV) $(BIN_DIR)/$(BINARY_NAME)

## Run all tests
test:
	@echo "Running tests..."
	@go test ./... -v

## Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BIN_DIR)

## Docker helpers
docker-up:
	@echo "Starting docker compose..."
	@docker compose up --build

docker-down:
	@echo "Stopping docker compose..."
	@docker compose down

