.PHONY: install dev backend frontend

install:
	cd backend && pip install -e .
	cd frontend && npm install

dev:
	@echo "Starting backend and frontend..."
	@make backend &
	@make frontend

backend:
	cd backend && uvicorn main:app --reload --port 8000

frontend:
	cd frontend && npm run dev
