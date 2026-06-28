# Node 24 on Debian Bookworm — matches the engines requirement in package.json
FROM node:24-bookworm

# Store browsers outside /app so they survive volume mounts over the working directory
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV CI=true

WORKDIR /app

# Install npm deps first — this layer is cached as long as package*.json don't change
COPY package*.json ./
RUN npm ci

# Install Playwright browsers + all system dependencies in one layer
# Pinned to the browsers used in CI (chromium + firefox)
RUN npx playwright install --with-deps chromium firefox

# Copy source — this layer rebuilds only when source changes
COPY . .

CMD ["npx", "playwright", "test"]
