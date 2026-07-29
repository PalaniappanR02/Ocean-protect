FROM node:20-alpine

WORKDIR /app

# Build context is the backend directory so the API can include shared migrations.
COPY api/package*.json ./
RUN npm ci

COPY api/ ./
COPY database/ ./database/

RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["sh", "-c", "npm run migrate && npm run dev"]
