# Node 24 on Debian Bookworm — matches the engines requirement in package.json
FROM node:24-bookworm

# Store browsers outside /app so they survive volume mounts over the working directory
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV CI=true

WORKDIR /app

# Install deps and browsers in one layer — cached as long as package*.json don't change
COPY package*.json ./
RUN npm ci --ignore-scripts \
    && ./node_modules/.bin/playwright install --with-deps chromium firefox \
    && chown -R node:node /ms-playwright /app

# Copy only the files needed to run tests
COPY --chown=node:node src/ ./src/
COPY --chown=node:node playwright.config.ts tsconfig.json eslint.config.mjs ./

# Drop root — the node user (uid 1000) is built into the base image
USER node

CMD ["./node_modules/.bin/playwright", "test"]