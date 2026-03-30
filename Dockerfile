# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Change to npm ci --no-audit --no-fund to avoid warnings
RUN npm install --omit=dev --legacy-peer-deps

COPY . .
RUN npm run build


# ── Production stage ──────────────────────────────────────────────────────────
# L1: nginxinc/nginx-unprivileged runs as a non-root user (UID 101) out of the
# box and listens on port 8080 instead of 80, removing the need for CAP_NET_BIND.
FROM nginxinc/nginx-unprivileged:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
