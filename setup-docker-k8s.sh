#!/bin/bash

# Docker Desktop Kubernetes Setup Script

echo "=== Docker Desktop Kubernetes Setup ==="
echo ""

# Check if Docker Desktop is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker Desktop is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker Desktop is running"

# Check if Kubernetes is enabled
echo "Checking Kubernetes status..."
kubectl cluster-info >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Kubernetes is enabled and accessible"
else
    echo "❌ Kubernetes is not accessible. Please:"
    echo "   1. Open Docker Desktop"
    echo "   2. Go to Settings → Kubernetes"
    echo "   3. Enable 'Enable Kubernetes'"
    echo "   4. Wait for cluster to start"
    exit 1
fi

echo ""
echo "=== Cluster Information ==="
kubectl cluster-info
echo ""
kubectl get nodes

echo ""
echo "✅ Kubernetes cluster is ready!"
echo "You can now proceed with deployment."
