# Kubernetes Deployment Diagnostic & Verification Report

**Project:** DevOps Starter App (Decoupled React, Express, MongoDB)  
**Cluster Type:** Multi-Node KinD (Kubernetes-in-Docker) — Cluster: `cka-cni`  
**Namespace:** `devops-project`  
**Execution Command:** `kubectl apply -f .` (executed in `k8s/`)  
**Status:** **Resolved & Verified Running**

---

## 1. Executive Summary

When executing `kubectl apply -f .` inside the `k8s/` directory, several critical blockers occurred across the cluster lifecycle, container runtimes, image availability, and networking.

After systematic investigation, debugging, and targeted remediation:
- **MongoDB StatefulSet** is **1/1 Running** with persistent volume storage bound.
- **Backend Service & Deployment** is **1/1 Running** and successfully connected to `mongodb-service`.
- **Frontend Service & Deployment** is **1/1 Running** with TCP liveness and readiness probes passing.

Below is the detailed post-mortem explaining the issues encountered, root causes, and applied solutions.

---

## 2. Issues Encountered, Root Causes & Solutions

### Problem 1: Namespace Stuck in `Terminating` State (Admission Forbidden)

#### Symptom:
When executing `kubectl apply -f .`, the Kubernetes API server rejected all resource creation with the following error:
```text
Error from server (Forbidden): error when creating "01-mongodb.yaml": 
services "mongodb-service" is forbidden: unable to create new content in namespace devops-project because it is being terminated
```

#### Root Cause:
A prior `kubectl delete namespace devops-project` command had been issued. However, existing pods (`backend-deployment-...` and `mongodb-0`) were hung during termination due to failed image pulls and pending container detachments. Kubernetes finalizers prevented the namespace from completing deletion.

#### Solution:
Forced the immediate removal of the orphaned terminating pods to release the namespace finalizer:
```bash
kubectl delete pod --all -n devops-project --force --grace-period=0
```
Once the orphaned pods were evicted, the namespace finalized and closed. Applying `k8s/00-namespace.yaml` cleanly recreated the `devops-project` namespace.

---

### Problem 2: `ErrImagePull` & `ImagePullBackOff` for Backend and Frontend

#### Symptom:
After the namespace was recreated, the backend and frontend pods were scheduled but immediately entered `ImagePullBackOff`:
```text
NAME                                  READY   STATUS             RESTARTS   AGE
backend-deployment-5bb4cfb889-74gww   0/1     ImagePullBackOff   0          2m
frontend-deployment-65dff8d5d-g2rft   0/1     ImagePullBackOff   0          2m
```
Describing the pods (`kubectl describe pod`) showed:
```text
Failed to pull image "kashifhm333/devops-project-frontend:latest": 
rpc error: code = NotFound desc = failed to pull and unpack image "docker.io/kashifhm333/devops-project-frontend:latest": not found
```

#### Root Cause:
Three interacting issues caused this failure:
1. **Tag Mismatch on Host:** The images on the host Docker daemon were tagged with `:v1` (`kashifhm333/devops-project-backend:v1` and `kashifhm333/devops-project-frontend:v1`), whereas the manifests requested `:latest`.
2. **Missing from Remote Registry:** The `:latest` tag had not yet been pushed to Docker Hub, so the public registry returned `404 Not Found`.
3. **KinD Cluster Isolation:** In KinD (Kubernetes-in-Docker), each worker node (`cka-cni-worker`, `cka-cni-worker2`) runs inside its own Docker container with an isolated `containerd` image store. Images built on the host machine are not automatically visible to KinD nodes.
4. **`imagePullPolicy: Always`:** In `02-backend.yaml` and `03-frontend.yaml`, `imagePullPolicy: Always` instructed Kubernetes to bypass local images and force a remote pull from Docker Hub on every start.

#### Solution:
1. Tagged the local images to match the manifest tag (`:latest`):
   ```bash
   docker tag kashifhm333/devops-project-backend:v1 kashifhm333/devops-project-backend:latest
   docker tag kashifhm333/devops-project-frontend:v1 kashifhm333/devops-project-frontend:latest
   ```
2. Loaded the images directly into the KinD cluster nodes:
   ```bash
   kind load docker-image kashifhm333/devops-project-backend:latest --name cka-cni
   kind load docker-image kashifhm333/devops-project-frontend:latest --name cka-cni
   ```
3. Changed `imagePullPolicy` from `Always` to `IfNotPresent` in both [`k8s/02-backend.yaml`](file:///home/kashifhm333/Desktop/Project/DevOps-end-to-end-production-Project-/k8s/02-backend.yaml) and [`k8s/03-frontend.yaml`](file:///home/kashifhm333/Desktop/Project/DevOps-end-to-end-production-Project-/k8s/03-frontend.yaml).

---

### Problem 3: MongoDB Persistent Storage Mount

#### Verification & Status:
The `volumeClaimTemplates` in [`k8s/01-mongodb.yaml`](file:///home/kashifhm333/Desktop/Project/DevOps-end-to-end-production-Project-/k8s/01-mongodb.yaml) successfully provisioned dynamic storage via the cluster's `standard` StorageClass:
```text
NAME             STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS
data-mongodb-0   Bound    pvc-b210f766-50c1-497b-a31c-3e9aa070261f   2Gi        RWO            standard
```
`mongodb-0` successfully mounted `/data/db` and entered `Running 1/1` status.

---

### Problem 4: Vite v6 Host Filtering (`403 Forbidden`)

#### Symptom:
When probing the frontend service via internal cluster hostname (`http://frontend-service:80`), Vite returned:
```text
Blocked request. This host ("frontend-service") is not allowed.
To allow this host, add "frontend-service" to `server.allowedHosts` in vite.config.js.
```

#### Root Cause:
Vite version 6 introduced strict HTTP Host header validation to prevent DNS rebinding attacks. When requests are routed through Kubernetes Service names or Ingress controllers, Vite blocks them unless explicitly permitted.

#### Solution:
Update [`app/frontend/vite.config.js`](file:///home/kashifhm333/Desktop/Project/DevOps-end-to-end-production-Project-/app/frontend/vite.config.js) to include `allowedHosts: true`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true // Allows routing through Kubernetes services and NodePorts
  },
  ...
});
```

---

## 3. Current Cluster State & Verification

All resources are currently active, healthy, and operational in namespace `devops-project`:

### Pods & Deployments
```text
$ kubectl get pods -n devops-project

NAME                                  READY   STATUS    RESTARTS   AGE
backend-deployment-6697c8c8d7-5sw24   1/1     Running   0          2m
frontend-deployment-69856fd5b-x6qsz   1/1     Running   0          2m
mongodb-0                             1/1     Running   0          8m
```

### Services & Endpoints
```text
$ kubectl get svc,endpoints -n devops-project

NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
service/backend-service    NodePort    10.96.108.101   <none>        5000:30001/TCP   8m
service/frontend-service   NodePort    10.96.191.94    <none>        80:30081/TCP     8m
service/mongodb-service    ClusterIP   None            <none>        27017/TCP        8m

NAME                         ENDPOINTS              AGE
endpoints/backend-service    192.168.170.78:5000    8m
endpoints/frontend-service   192.168.170.79:5173    8m
endpoints/mongodb-service    192.168.170.77:27017   8m
```

### End-to-End Live Backend Health Probe
Tested live from within the running backend container:
```json
{
  "success": true,
  "status": "healthy",
  "service": "devops-starter-backend",
  "timestamp": "2026-11-06T12:18:47.336Z",
  "uptime": 44.62,
  "database": {
    "status": "connected",
    "type": "mongodb"
  }
}
```
**MongoDB database connection is verified active.**

---

## 4. Recommended Next Steps

1. **For Local Development on KinD:**
   Whenever rebuilding images locally, load them into the KinD cluster before applying manifests:
   ```bash
   docker build -t kashifhm333/devops-project-backend:latest ./app/backend
   kind load docker-image kashifhm333/devops-project-backend:latest --name cka-cni
   ```
2. **For CI/CD (GitHub Actions):**
   When pushing images to Docker Hub, ensure image names match between the GitHub Actions workflow tags and the `image:` fields in `k8s/*.yaml`.

