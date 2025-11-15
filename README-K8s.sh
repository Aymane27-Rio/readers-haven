#!/bin/bash

# Quick Start Guide for Readers Haven on Kubernetes (Docker Desktop)
# This script provides step-by-step instructions

echo "=== Readers Haven Kubernetes Quick Start (Docker Desktop) ==="
echo ""

# 1. Enable Kubernetes in Docker Desktop
echo "Step 1: Enable Kubernetes in Docker Desktop"
echo "1. Open Docker Desktop"
echo "2. Go to Settings → Kubernetes"
echo "3. Check 'Enable Kubernetes'"
echo "4. Wait for cluster to start (may take several minutes)"
echo "5. Run: kubectl cluster-info"
echo ""

# 2. Verify cluster
echo "Step 2: Verify cluster"
echo "kubectl cluster-info"
echo "kubectl get nodes"
echo ""

# 3. Build images
echo "Step 3: Build Docker images"
echo "./build-images.sh"
echo ""

# 4. Deploy application
echo "Step 4: Deploy to Kubernetes"
echo "./deploy-k8s.sh"
echo ""

# 5. Verify deployment
echo "Step 5: Verify deployment"
echo "kubectl get pods -n readers-haven"
echo "kubectl get pods -n monitoring"
echo "kubectl get ingress -n readers-haven"
echo ""

# 6. Access application
echo "Step 6: Access application"
echo "kubectl port-forward svc/gateway 8080:8080 -n readers-haven"
echo "Open: http://localhost:8080/health"
echo ""

# 7. Access Grafana
echo "Step 7: Access monitoring dashboard"
echo "kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring"
echo "Open: http://localhost:3000"
echo "Username: admin"
echo "Password: (see deploy-k8s.sh output)"
echo ""

echo "=== Troubleshooting ==="
echo "Check cluster: kubectl cluster-info"
echo "Check pods: kubectl get pods --all-namespaces"
echo "Check logs: kubectl logs <pod-name> -n readers-haven"
echo "Restart: Reset Kubernetes cluster in Docker Desktop settings"
echo ""

echo "=== Monitoring Stack Components ==="
echo "• Prometheus - Metrics collection and storage"
echo "• Grafana - Dashboard visualization"
echo "• Alertmanager - Alert routing and management"
echo "• Node Exporter - Host system metrics"
echo "• kube-state-metrics - Kubernetes object metrics"
echo "• Prometheus Operator - Simplified management"
