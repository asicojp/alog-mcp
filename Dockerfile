FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production

COPY server.js ./
COPY lib/ ./lib/
COPY README.md ./

EXPOSE 3004
ENV ALOG_TRANSPORT=http
ENV ALOG_PORT=3004
# HTTP transport requires Authorization: Bearer <ALOG_API_KEY> on all requests except /health

CMD ["node", "server.js"]
