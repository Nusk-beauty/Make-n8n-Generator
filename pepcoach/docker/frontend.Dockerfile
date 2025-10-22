FROM nginx:alpine
# Copy the content of the build context (the 'frontend' directory)
# to the Nginx public HTML directory.
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]