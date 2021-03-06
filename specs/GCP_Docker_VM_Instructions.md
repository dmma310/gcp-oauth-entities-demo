## Deploy docker container
- Create Dockerfile and .dockerignore
- Build image with tag name
  - docker build -t [IMAGE_TAG] [DIR]
  - docker image ls
- Run detached container and bind to all exposed ports
  - docker run -d --name df -P [IMAGE_TAG]
Remove image (must remove all containers first)
- docker container ls -a
- docker rm [OPTIONS] CONTAINER [CONTAINER...] OR docker system prune
- docker image rm [IMAGE_TAG]

*** NOTE: Use Credential file to access Datastore on VM ***
- Create service account: https://cloud.google.com/docs/authentication/getting-started
- On account: Keys > Add Key > Create new key > JSON [FILE_NAME.json]
  - gcp-demo-dex-54cb07a31b94.json
Place JSON file in same directory as other docker image files [DIR]
  - .
Set environment variable in Dockerfile: ENV GOOGLE_APPLICATION_CREDENTIALS='[DIR]/[FILE_NAME.json]'
  - ENV GOOGLE_APPLICATION_CREDENTIALS='./gcp-demo-dex-54cb07a31b94'
Deploy to Google Container Registries
- gcloud builds submit --tag gcr.io/[PROJECT_ID]/[IMAGE_TAG]
  - gcloud builds submit --tag gcr.io/gcp-demo-dex/gcp-project-demo
- Access container via VM in Google Compute Engine (or can also use Kubernetes) or push/pull https://cloud.google.com/container-registry/docs/pushing-and-pulling
- Get full repository name [URL] in Tools > Container Registry
- Create VM with Container Image as [URL]
  - NOTE: If using Google OAuth, when creating VM instance, will need to buy public domain and map that to external IP of VM
  - In APIs & Services, add this hostname as Authorized Javascript Origins in Credentials, and Authorized Domains in OAuth Consent Screen
- ALTERNATIVE: Got to Container Registry > Click on ... > Deploy to GCE
- Create firewall rule on VM: View Network Details > Firewall > Create Firewall Rule
  - Targets > All instances
  - Source IPs > 0.0.0.0/0 (all traffic)
  - Protocols and Ports > TCP [PORT_DEFINED_IN_DOCKERFILE]
Connect to VM public IP on this port