# Kubernetes Deployment Script for Readers Haven

Write-Host "Applying all Kubernetes manifests..."
kubectl apply -f k8s-manifests/

Write-Host "
Deployment script finished. To check the status, run:"
Write-Host "kubectl get pods -n readers-haven -w"

Write-Host "
To restart all deployments, run:"
Write-Host "kubectl rollout restart deployment --all -n readers-haven"
