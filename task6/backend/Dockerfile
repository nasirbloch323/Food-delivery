# Use an official lightweight Node.js runtime.
FROM node:22-alpine
# Set the working directory for all following commands.
WORKDIR /app
# Copy dependency manifests first to improve Docker layer caching.
COPY package*.json ./
# Install only production dependencies for a smaller runtime image.
RUN npm install --omit=dev && npm cache clean --force
# Copy the API source code into the image.
COPY server.js ./
# Create an unprivileged account for the API process.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Give the app user ownership of its application directory.
RUN chown -R appuser:appgroup /app
# Drop root privileges before starting the server.
USER appuser
# Document the API port used inside the container.
EXPOSE 5000
# Start the REST API.
CMD ["node", "server.js"]