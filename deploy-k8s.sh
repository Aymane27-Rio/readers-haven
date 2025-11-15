#!/bin/bash

# Kubernetes Deployment Script for Readers Haven

echo "Starting Kubernetes deployment..."

# 1. Apply namespaces
echo "Creating namespaces..."
kubectl apply -f k8s-manifests/namespaces.yml

# 2. Apply config and secrets
echo "Applying configuration and secrets..."
kubectl apply -f k8s-manifests/config.yml

# 3. Deploy MongoDB
echo "Deploying MongoDB..."
kubectl apply -f k8s-manifests/mongo.yml

# 4. Deploy microservices
echo "Deploying microservices..."
kubectl apply -f k8s-manifests/auth-service.yml
kubectl apply -f k8s-manifests/books-service.yml
kubectl apply -f k8s-manifests/gateway.yml

# 5. Check deployments
echo "Checking deployments..."
kubectl get pods -n readers-haven
kubectl get services -n readers-haven
kubectl get ingress -n readers-haven

# 6. Wait for services to be ready
echo "Waiting for services to be ready..."
kubectl wait --for=condition=ready pod --all -n readers-haven --timeout=300s

# 7. Check if Helm is installed (skip for Docker Desktop)
if ! command -v helm &> /dev/null; then
    echo "⚠️  Helm not found. Installing Helm..."
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

# 8. Enable ingress addon (Docker Desktop has it built-in)
echo "Enabling ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml

# Wait for ingress controller
echo "Waiting for ingress controller to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=controller -n ingress-nginx --timeout=300s || echo "Ingress controller may still be starting..."

# 9. Add Prometheus Helm repo
echo "Adding Prometheus Helm repository..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 10. Install kube-prometheus-stack
echo "Installing monitoring stack..."
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace \
  --set grafana.service.type=ClusterIP \
  --set prometheus.service.type=ClusterIP

# 11. Check monitoring deployment
echo "Checking monitoring deployment..."
kubectl get pods -n monitoring
kubectl get svc -n monitoring

# 12. Get Grafana credentials
echo "Retrieving Grafana admin password..."
GRAFANA_PASSWORD=$(kubectl get secret --namespace monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 --decode)
echo "Grafana Username: admin"
echo "Grafana Password: $GRAFANA_PASSWORD"

# 13. Port forward Grafana (run in background)
echo "Starting Grafana port-forward (access at http://localhost:3000)..."
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80 &

echo "Deployment complete!"
echo "Access your application at: http://localhost (via Ingress)"
echo "Access Grafana at: http://localhost:3000"
echo "Username: admin, Password: $GRAFANA_PASSWORD"
