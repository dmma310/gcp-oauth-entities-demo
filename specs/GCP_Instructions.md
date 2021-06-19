## Create project and enable Cloud Build API.
## Deploy via:
- gcloud auth login credentials in ~/.config/gcloud/
- gcloud config set project gcp-demo-dex
- gcloud app deploy app.yaml
- gcloud app browse
- public url is now https://gcp-demo-dex.wn.r.appspot.com
- get current project gcloud config get-value project
- gcloud projects delete gcp-demo-dex
- gcloud projects add-iam-policy-binding hw1-made --member=user:my-user@example.com --role=roles/viewer

## Set Cloud Firestore in Datastore mode
## Enable Cloud Datastore API
- npm install --save @google-cloud/datastore
- By default, the client will authenticate using the service account file specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
  - https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
  - These environment variables are set automatically on Google App Engine
  - const {Datastore} = require('@google-cloud/datastore');
  - const datastore = new Datastore();