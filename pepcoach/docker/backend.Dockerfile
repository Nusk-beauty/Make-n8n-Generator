# Use a specific Node.js version on Alpine Linux for a small image size
FROM node:20-alpine

# Install system dependencies for Puppeteer to run headless Chrome
# We install Chromium from the OS packages to avoid downloading it during npm install
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set the working directory in the container
WORKDIR /usr/src/app

# Tell Puppeteer to skip downloading Chrome and use the system-installed version
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create a non-root user to run the application for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files and install dependencies
# This leverages Docker's layer caching
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application source code
COPY . ./

# Change ownership of the application files to the non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 4000

# The command to run the application
CMD ["node", "src/index.js"]