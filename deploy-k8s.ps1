# Kubernetes Deployment Script for Readers Haven

Write-Host "Applying namespaces..."
kubectl apply -f k8s-manifests/namespaces.yml

Write-Host ""
Write-Host "Applying all Kubernetes manifests..."
kubectl apply -f k8s-manifests/

Write-Host ""
Write-Host "Deployment script finished. To check the status, run:"
Write-Host "kubectl get pods -n readers-haven -w"

Write-Host ""
Write-Host "To restart all deployments, run:"
Write-Host "kubectl rollout restart deployment --all -n readers-haven"
