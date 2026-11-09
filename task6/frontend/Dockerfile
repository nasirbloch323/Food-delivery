# Use a small official Nginx image to serve the static frontend.
FROM nginx:1.27-alpine
# Copy the website assets into Nginx's default public directory.
COPY . /usr/share/nginx/html
# Document the HTTP port used by Nginx inside the container.
EXPOSE 80
# Run Nginx in the foreground so Docker can manage the process.
CMD ["nginx", "-g", "daemon off;"]