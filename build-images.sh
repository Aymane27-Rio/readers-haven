#!/bin/bash

# Build Docker images for Kubernetes deployment (Docker Desktop)

echo "Building Docker images for Kubernetes..."

# Build gateway
echo "Building gateway..."
docker build -t readers-haven-gateway:latest gateway/

# Build auth-service
echo "Building auth-service..."
docker build -t readers-haven-auth-service:latest services/auth-service/

# Build books-service
echo "Building books-service..."
docker build -t readers-haven-books-service:latest services/books-service/

# Build quotes-service
echo "Building quotes-service..."
docker build -t readers-haven-quotes-service:latest services/quotes-service/

# Build order-service
echo "Building order-service..."
docker build -t readers-haven-order-service:latest services/order-service/

# Build inventory-service
echo "Building inventory-service..."
docker build -t readers-haven-inventory-service:latest services/inventory-service/

echo "✅ Docker images built successfully!"
echo "Note: Docker Desktop Kubernetes can access these images directly."
