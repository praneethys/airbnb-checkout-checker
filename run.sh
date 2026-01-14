#!/bin/bash

trap 'kill 0' EXIT

cd backend && poetry run uvicorn app.main:app --reload &
cd frontend && npm run dev &

wait
