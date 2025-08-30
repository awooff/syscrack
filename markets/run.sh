#!/bin/bash
source .env ;
export AUTH_API_URL="http://localhost:1337" ;
go run ./cmd
