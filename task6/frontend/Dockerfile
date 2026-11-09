# Use the official lightweight Nginx image to serve the website.
FROM nginx:1.27-alpine
# Install the Nginx reverse-proxy configuration for backend API requests.
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy HTML, CSS and browser JavaScript into the Nginx document root.
COPY index.html styles.css app.js /usr/share/nginx/html/
# Document the HTTP port exposed by Nginx inside the container.
EXPOSE 80
# Keep Nginx in the foreground so Docker can monitor the main process.
CMD ["nginx", "-g", "daemon off;"]