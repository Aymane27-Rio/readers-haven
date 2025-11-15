# Build Docker images for Kubernetes deployment

# Build gateway
docker build -t readers-haven-gateway:latest gateway/

# Build auth-service
docker build -t readers-haven-auth-service:latest services/auth-service/

# Build books-service
docker build -t readers-haven-books-service:latest services/books-service/

# Build quotes-service
docker build -t readers-haven-quotes-service:latest services/quotes-service/

# Build order-service
docker build -t readers-haven-order-service:latest services/order-service/

# Build inventory-service
docker build -t readers-haven-inventory-service:latest services/inventory-service/

# If using Minikube, load images into cluster
# minikube image load readers-haven-gateway:latest
# minikube image load readers-haven-auth-service:latest
# etc.

Write-Host "Docker images built successfully!"
