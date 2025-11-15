#!/bin/bash

# Download and install Minikube for Git Bash
# Alternative installation method if Chocolatey fails

echo "Installing Minikube..."

# 1. Download Minikube binary
curl -Lo minikube.exe https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe

# 2. Make it executable and move to PATH
chmod +x minikube.exe
sudo mv minikube.exe /usr/local/bin/minikube

# 3. Verify installation
minikube version

# 4. Start Minikube with required add-ons
echo "Starting Minikube cluster..."
minikube start --addons=ingress,metrics-server

echo "Minikube installation and startup complete!"
echo "Run 'minikube status' to verify cluster is running."
