Deploying to Render (step-by-step)

This project is a full-stack Node/React app (server + client). Below are the recommended steps to deploy it on Render.

Prerequisites
- A GitHub account and this repo connected to your GitHub account.
- A Render account (https://render.com).
- A MongoDB connection string (MongoDB Atlas is a good option) for MONGODB_URI.
- (Optional) OpenAI API key for AI features (OPENAI_API_KEY) and a JWT secret (JWT_SECRET).

1) Prepare the repo
- Ensure your working branch (the one you want to deploy) is pushed to GitHub. The render.yaml in repo is configured to deploy branch: zen-zone. Adjust if needed.
- Verify the project builds locally with:
  pnpm install
  pnpm build

2) Render: create a new Web Service
- Sign in to Render and click "New" → "Web Service".
- Connect your GitHub repo and select the branch (zen-zone by default).
- Fill the settings:
  - Name: drishti-web (or your preferred name)
  - Environment: Node
  - Build Command: pnpm install && pnpm build
  - Start Command: node dist/server/node-build.mjs
  - Health Check Path: /health
- Click "Create Web Service".

3) Add Environment Variables / Secrets
In your Render service settings, open the "Environment" tab and add the necessary variables (do NOT commit secrets to the repo):
- MONGODB_URI (secret): e.g. mongodb+srv://USER:PASS@cluster0.mongodb.net/dbname?retryWrites=true&w=majority
- OPENAI_API_KEY (optional): sk-xxx
- JWT_SECRET (recommended): a random secret for signing tokens
- NODE_ENV: production

Note: The render.yaml included in this repo references these secrets. You can either create the secrets in the dashboard or set them using the Render CLI.

4) Database (MongoDB) options
- Use MongoDB Atlas: create a cluster, whitelist Render outbound IP ranges (if needed), create a database user, copy connection string into MONGODB_URI.
- Or use a managed Mongo offering and provide the connection string.

5) Deployment and verification
- When you create the service, Render will run the build and start commands. Monitor the deploy logs in Render.
- Visit the service URL after deployment. Check logs if the server fails to start.

6) Additional considerations
- Static SPA routing: this app runs a Node server which serves both server and client. Direct links should work because Node responds to routes. If you ever publish a static-only build, use HashRouter or configure rewrites in Render.
- Local/offline mode: the app supports demo/demo-data mode when MongoDB is unavailable. If you want the app to require Mongo in production, set NODE_ENV=production and alter server/config/database.ts to exit when MONGODB_URI is missing.
- MCP integrations: If you want to use managed DBs or auth providers, Render supports connecting other providers. You can also use Builder.io MCP to connect Supabase, Neon, Netlify, etc.

7) Creating secrets via Render CLI (optional)
Install render CLI (if you prefer automation): https://render.com/docs/render-cli
Then create secrets (example):
  render login
  render services create-secret --service drishti-web --name MONGODB_URI --value "<your-connection-string>"

8) Troubleshooting
- "MongoDB connection failed: MongoDB URI not defined": ensure MONGODB_URI is set on the service environment.
- 500 errors on AI features: confirm OPENAI_API_KEY is configured.
- Check logs: Render → Service → Logs for build/runtime errors.

If you'd like, I can:
- Add a render.yaml (already added) and a deploy README (this file).
- Generate a render.yaml example that creates secrets via the Render API/CLI (requires token).
- Add a render-specific health check or PostDeploy hook.

Tell me which extra step you'd like me to take (create secrets script, change database behavior in production, or add CI checks).
