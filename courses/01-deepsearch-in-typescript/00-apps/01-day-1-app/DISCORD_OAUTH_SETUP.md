# Discord OAuth Setup Guide

This guide will help you set up Discord OAuth authentication for your AI chat application.

## Prerequisites

- A Discord account
- Access to the Discord Developer Portal
- Your local development server running on `http://localhost:3000`

## Step 1: Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click the **"New Application"** button
3. Give your application a name (e.g., "AI Chat App")
4. Click **"Create"**

## Step 2: Configure OAuth2 Settings

1. In your application dashboard, click on **"OAuth2"** in the left sidebar
2. Click on **"General"** under the OAuth2 section
3. Add the following redirect URI:
   ```
   http://localhost:3000/api/auth/callback/discord
   ```
4. Click **"Save Changes"**

## Step 3: Get Your Credentials

1. In the **"OAuth2"** section, find the **"Client ID"** and **"Client Secret"**
2. Copy the **Client ID** - this is your `AUTH_DISCORD_ID`
3. Click **"Reset Secret"** to generate a new client secret
4. Copy the **Client Secret** - this is your `AUTH_DISCORD_SECRET`

⚠️ **Important**: Keep your client secret secure and never share it publicly!

## Step 4: Update Your Environment Variables

1. Open your `.env` file in the project root
2. Add the following lines with your actual values:

```bash
# Discord OAuth
AUTH_DISCORD_ID="your_client_id_here"
AUTH_DISCORD_SECRET="your_client_secret_here"
```

Replace `your_client_id_here` and `your_client_secret_here` with the actual values from Discord.

## Step 5: Verify Your Setup

1. Make sure your development server is running:

   ```bash
   pnpm dev
   ```

2. Visit `http://localhost:3000`
3. You should see a "Sign in" button with a Discord icon
4. Click it to test the authentication flow

## Step 6: Test Authentication

1. Click the **"Sign in"** button
2. You'll be redirected to Discord's OAuth page
3. Click **"Authorize"** to grant permissions
4. You should be redirected back to your app, now logged in
5. You should see your Discord avatar and a **"Sign out"** button

## Production Setup

When you deploy your application, you'll need to:

1. Update the redirect URI in Discord to match your production domain:

   ```
   https://yourdomain.com/api/auth/callback/discord
   ```

2. Add your production environment variables to your hosting platform

## Troubleshooting

### Common Issues

#### "Invalid OAuth2 redirect_uri"

- Make sure your redirect URI in Discord exactly matches: `http://localhost:3000/api/auth/callback/discord`
- Check for extra spaces or typos

#### "Application not found"

- Verify your `AUTH_DISCORD_ID` is correct
- Make sure you're using the Client ID, not the Application ID

#### "Invalid client secret"

- Regenerate your client secret in Discord
- Update your `.env` file with the new secret
- Restart your development server

#### Environment variables not loading

- Make sure your `.env` file is in the project root
- Restart your development server after adding variables
- Check that there are no extra spaces around the `=` signs

### Development Tips

1. **Never commit your `.env` file** - it's already in `.gitignore`
2. **Use `.env.example`** as a template for other developers
3. **Restart your dev server** after changing environment variables
4. **Test in incognito mode** to simulate fresh user experience

## What's Protected Now

With authentication enabled:

✅ **Chat API** - Only logged-in users can send messages
✅ **User identification** - Each message is associated with the logged-in user
✅ **Session management** - Users stay logged in across browser sessions

## Next Steps

After authentication is working:

1. **Deploy your application** - Update Discord OAuth settings for production
2. **Add user persistence** - Store user data in your database
3. **Implement chat history** - Save and retrieve user conversations
4. **Add user management** - Admin controls, user roles, etc.

---

**Note**: This setup uses Discord OAuth for demonstration purposes. The same pattern works with other NextAuth providers like Google, GitHub, Twitter, etc.
