# Artisan Mentor Backend

## Deployment to Cloud Run
1. Build the image:
   `gcloud builds submit --tag gcr.io/[PROJECT_ID]/artisan-mentor`
2. Deploy:
   `gcloud run deploy artisan-mentor --image gcr.io/[PROJECT_ID]/artisan-mentor --platform managed --region [REGION] --allow-unauthenticated`
