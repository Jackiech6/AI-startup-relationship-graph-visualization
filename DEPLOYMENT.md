# Deployment Guide: Railway.com

This guide explains how to deploy the AI Startup Ecosystem Graph application to Railway.com.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub repository (optional, Railway can deploy from GitHub)

## Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create a new Railway project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project
   - Navigate to "Variables" tab
   - Add the following environment variables:
     - `OPENAI_API_KEY`: Your OpenAI API key (required for AI features)
     - `GITHUB_API_KEY` (optional but recommended): Your GitHub personal access token for higher rate limits (5,000 req/hour vs 60)
     - `OPENAI_MODEL` (optional): Model to use (default: `gpt-3.5-turbo`)
     - `OPENAI_MAX_TOKENS` (optional): Max tokens (default: `200`)
     - `NODE_ENV`: Set to `production`
     
   **Note:** GitHub API is enabled by default. To disable it, set `GITHUB_ENABLED=false`.

4. **Deploy**
   - Railway will automatically detect the Dockerfile
   - The build process will start automatically
   - Once complete, Railway will provide a URL for your application

### Option 2: Deploy from CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Railway in your project**
   ```bash
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set OPENAI_API_KEY=your_key_here
   railway variables set GITHUB_API_KEY=your_github_token_here  # Optional but recommended
   railway variables set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Environment Variables

Required:
- `OPENAI_API_KEY`: Your OpenAI API key for AI features

Recommended:
- `GITHUB_API_KEY`: Your GitHub personal access token (increases rate limit from 60 to 5,000 requests/hour)

Optional:
- `GITHUB_ENABLED`: Set to `false` to disable GitHub API (default: `true`)
- `GITHUB_SEARCH_QUERIES`: Comma-separated search queries (default: `AI startup,machine learning,artificial intelligence`)
- `OPENAI_MODEL`: Model to use (default: `gpt-3.5-turbo`)
- `OPENAI_MAX_TOKENS`: Maximum tokens for responses (default: `200`)
- `PORT`: Port for the server (Railway sets this automatically)
- `NODE_ENV`: Set to `production` for production builds

## Docker Configuration

The application uses a multi-stage Docker build:

1. **Dependencies stage**: Installs npm packages
2. **Builder stage**: Builds the Next.js application
3. **Runner stage**: Runs the production server

The Dockerfile is optimized for:
- Small image size
- Fast builds
- Security (runs as non-root user)

## Health Checks

Railway automatically checks the health of your application. The application should:
- Start successfully on port specified by `PORT` environment variable
- Respond to HTTP requests on the root path

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json`
- Verify Dockerfile syntax
- Check Railway build logs for specific errors

### Application Won't Start

- Verify all required environment variables are set
- Check Railway logs: `railway logs`
- Ensure `PORT` environment variable is available (Railway sets this automatically)

### OpenAI API Errors

- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- Review error logs in Railway dashboard

## Monitoring

Railway provides:
- Real-time logs
- Metrics (CPU, Memory, Network)
- Deployment history
- Automatic restarts on failure

Access logs via:
- Railway dashboard
- CLI: `railway logs`

## Scaling

Railway supports horizontal scaling:
- Go to project settings
- Adjust resource limits as needed
- Railway will handle load balancing

## Custom Domain

1. Go to your project settings in Railway
2. Click "Generate Domain" or "Custom Domain"
3. Follow the DNS configuration instructions

## Cost Optimization

- The application uses minimal resources
- OpenAI API calls are cached to reduce costs
- Consider setting up usage alerts in Railway
- Monitor OpenAI API usage in OpenAI dashboard

## Security Notes

- Never commit `.env.local` or `.env` files
- Use Railway's environment variables for secrets
- API keys are stored securely in Railway
- Application runs in isolated containers

