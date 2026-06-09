FROM node:22-slim AS build

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
RUN cd frontend && npm run build

FROM node:22-slim AS runtime

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend ./backend
COPY --from=build /app/frontend/dist ./frontend/dist

EXPOSE 8080

CMD ["node", "backend/server.js"]
