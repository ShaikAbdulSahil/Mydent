# --- Stage 1: Builder ---
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files (including yarn.lock)
COPY package.json yarn.lock ./

# Install dependencies using Yarn (frozen-lockfile ensures exact versions)
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN yarn build

# --- Stage 2: Production ---
FROM node:20-alpine AS production

ENV NODE_ENV production
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install ONLY production dependencies using Yarn
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy static assets (if any)
COPY --from=builder /app/public ./public

# Expose the port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]