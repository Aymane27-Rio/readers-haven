# Download and install Minikube
# Alternative installation method if Chocolatey fails

# 1. Download Minikube binary
Invoke-WebRequest -Uri "https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe" -OutFile "minikube.exe"

# 2. Move to a directory in PATH or add to PATH
# Move-Item minikube.exe "C:\Windows\System32\minikube.exe"

# 3. Start Minikube
minikube start --addons=ingress,metrics-server
