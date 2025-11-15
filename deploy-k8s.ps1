# Kubernetes Deployment Script for Readers Haven

# 1. Apply namespaces
kubectl apply -f k8s-manifests/namespaces.yml

# 2. Apply config and secrets
kubectl apply -f k8s-manifests/config.yml

# 3. Deploy MongoDB
kubectl apply -f k8s-manifests/mongo.yml

# 4. Deploy microservices
kubectl apply -f k8s-manifests/auth-service.yml
kubectl apply -f k8s-manifests/books-service.yml
kubectl apply -f k8s-manifests/gateway.yml

# 5. Check deployments
kubectl get pods -n readers-haven
kubectl get services -n readers-haven
kubectl get ingress -n readers-haven

# 6. Wait for services to be ready
kubectl wait --for=condition=ready pod --all -n readers-haven --timeout=300s

# 7. Install Helm (if not installed)
# choco install kubernetes-helm

# 8. Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 9. Install kube-prometheus-stack
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# 10. Check monitoring deployment
kubectl get pods -n monitoring
kubectl get svc -n monitoring

# 11. Get Grafana credentials
kubectl get secret --namespace monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

# 12. Port forward Grafana
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80

# Access Grafana at http://localhost:3000
# Username: admin
# Password: (from above command)
