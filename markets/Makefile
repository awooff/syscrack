# --- Project settings ---
BINARY_NAME=app
CMD_DIR=./cmd
BIN_DIR=./bin

ENV ?= dev

.PHONY: build run start test clean docker-up docker-down

build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BIN_DIR)
	@go build -o $(BIN_DIR)/$(BINARY_NAME) $(CMD_DIR)

run:
	@echo "Running $(BINARY_NAME) from source (ENV=$(ENV))..."
	@ENV=$(ENV) go run $(CMD_DIR)

start: build
	@echo "Starting $(BINARY_NAME) binary (ENV=$(ENV))..."
	@ENV=$(ENV) $(BIN_DIR)/$(BINARY_NAME)

test:
	@echo "Running tests..."
	@$(ENV_VARS) ENV=$(ENV) go test ./... -v

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BIN_DIR)

docker-up:
	@echo "Starting docker compose..."
	@docker compose up --build

docker-down:
	@echo "Stopping docker compose..."
	@docker compose down

