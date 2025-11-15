#!/bin/bash

# Simple Kubernetes Deployment Script (without Helm)

echo "=== Simple Kubernetes Deployment ==="

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

# 5. Enable ingress
echo "Enabling ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml

# 6. Wait for ingress
echo "Waiting for ingress controller..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=controller -n ingress-nginx --timeout=120s || echo "Ingress may still be starting..."

# 7. Check deployments
echo "Checking deployments..."
kubectl get pods -n readers-haven
kubectl get services -n readers-haven
kubectl get ingress -n readers-haven

# 8. Wait for services (shorter timeout)
echo "Waiting for services to be ready..."
kubectl wait --for=condition=ready pod -n readers-haven --timeout=60s --all || echo "Some pods may still be starting..."

# 9. Deploy monitoring
echo "Deploying monitoring stack..."
kubectl apply -f k8s-manifests/monitoring.yml

# 10. Check monitoring
echo "Checking monitoring deployment..."
kubectl get pods -n monitoring
kubectl get services -n monitoring

echo ""
echo "=== Final Status ==="
echo "Application namespace:"
kubectl get all -n readers-haven
echo ""
echo "Monitoring namespace:"
kubectl get all -n monitoring
echo ""
echo "=== Access Points ==="
echo "Application: kubectl port-forward svc/gateway 8080:8080 -n readers-haven"
echo "Prometheus: kubectl port-forward svc/prometheus 9090:9090 -n monitoring"
echo "Grafana: kubectl port-forward svc/grafana 3000:3000 -n monitoring"
echo "MongoDB: kubectl port-forward svc/mongo 27017:27017 -n readers-haven"
echo ""
echo "Then visit:"
echo "• Application: http://localhost:8080/health"
echo "• Grafana: http://localhost:3000 (admin/admin)"
echo "• Prometheus: http://localhost:9090"
