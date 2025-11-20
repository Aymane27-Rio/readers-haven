## Build Docker images for Kubernetes deployment (Docker Desktop)

docker build --no-cache -t readers-haven-auth-service:latest       --build-arg SERVICE_DIR=services/auth-service      --build-arg PORT=5001  -f Dockerfile.service .
docker build --no-cache -t readers-haven-books-service:latest      --build-arg SERVICE_DIR=services/books-service     --build-arg PORT=5002  -f Dockerfile.service .
docker build --no-cache -t readers-haven-quotes-service:latest     --build-arg SERVICE_DIR=services/quotes-service    --build-arg PORT=5003  -f Dockerfile.service .
docker build --no-cache -t readers-haven-order-service:latest      --build-arg SERVICE_DIR=services/order-service     --build-arg PORT=5004  -f Dockerfile.service .
docker build --no-cache -t readers-haven-inventory-service:latest  --build-arg SERVICE_DIR=services/inventory-service --build-arg PORT=5005  -f Dockerfile.service .
docker build --no-cache -t readers-haven-payment-service:latest    --build-arg SERVICE_DIR=services/payment-service   --build-arg PORT=5010  -f Dockerfile.service .
docker build --no-cache -t readers-haven-gateway:latest            --build-arg SERVICE_DIR=gateway                    --build-arg PORT=8080  -f Dockerfile.service .
docker build --no-cache -t readers-haven-frontend:latest           --build-arg SERVICE_DIR=frontend                   --build-arg PORT=5173  -f Dockerfile.service .

Write-Host "Docker images built successfully for docker-desktop Kubernetes."
