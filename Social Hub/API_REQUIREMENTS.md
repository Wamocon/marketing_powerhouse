# SocialHub — API Requirements Document

## Overview
This document lists all external APIs required for the SocialHub application to function as a dual-platform social media automation tool (LinkedIn + Instagram).

---

## 1. Google Gemini API (Text Generation)

| Item | Detail |
|------|--------|
| **Base URL** | `https://generativelanguage.googleapis.com` |
| **Model** | `gemini-2.5-pro` (configurable) |
| **Auth** | API Key (`GOOGLE_API_KEY`) |
| **SDK** | `google-genai` Python SDK |

### Endpoints Used
| Method | Purpose | Used In |
|--------|---------|---------|
| `GenerateContent` | Generate post body text with Google Search grounding | `gemini_service.generate_post()` |
| `GenerateContent` | Generate hashtags for posts | `gemini_service._generate_hashtags()` |
| `GenerateContent` | Generate image prompts from post content | `gemini_service._generate_image_prompt()` |
| `GenerateContent` | Suggest trending topics | `gemini_service.suggest_topics()` |
| `GenerateContent` | Rewrite/edit existing post text | `gemini_service.rewrite_post()` |

### Required Features
- Google Search grounding tool (for fact-checked content)
- Streaming not required (batch generation)
- Platform-aware system prompts (LinkedIn vs Instagram)

---

## 2. Google Imagen API (Image Generation)

| Item | Detail |
|------|--------|
| **Base URL** | `https://generativelanguage.googleapis.com` |
| **Model** | `imagen-4-ultra` (configurable) |
| **Auth** | Same API Key (`GOOGLE_API_KEY`) |
| **SDK** | `google-genai` Python SDK |

### Endpoints Used
| Method | Purpose | Used In |
|--------|---------|---------|
| `GenerateImages` | Generate post images | `imagen_service.generate_image()` |

### Platform-Specific Configs
| Platform | Dimensions | Aspect Ratio | Format |
|----------|-----------|--------------|--------|
| LinkedIn | 1200×628 | 16:9 | PNG |
| Instagram | 1080×1080 | 1:1 | JPEG |
| Instagram Portrait | 1080×1350 | 4:5 | JPEG |

---

## 3. LinkedIn API

| Item | Detail |
|------|--------|
| **Base URL** | `https://api.linkedin.com` |
| **API Version** | `202401` |
| **Auth** | OAuth 2.0 (3-legged) |
| **Credentials** | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` |

### OAuth Configuration
| Item | Value |
|------|-------|
| Authorization URL | `https://www.linkedin.com/oauth/v2/authorization` |
| Token URL | `https://www.linkedin.com/oauth/v2/accessToken` |
| Redirect URI | Configurable (`LINKEDIN_REDIRECT_URI`) |
| Scopes | `openid`, `profile`, `email`, `w_member_social` |
| Token Lifetime | ~60 days (2-month access token) |

### Endpoints Used
| Method | Endpoint | Purpose | Used In |
|--------|----------|---------|---------|
| GET | `/v2/userinfo` | Fetch user profile (name, sub) | `linkedin_service.get_user_profile()` |
| POST | `/rest/posts` | Create/publish a post with image | `linkedin_service.create_post()` |
| POST | `/rest/images?action=initializeUpload` | Initialize image upload | `linkedin_service.upload_image()` |
| PUT | `{uploadUrl}` | Upload image binary | `linkedin_service.upload_image()` |
| POST | `/rest/socialActions/{postUrn}/comments` | Post a comment on a post | `linkedin_service.post_comment()` |

### Required LinkedIn Products
- **Share on LinkedIn** — Required for `w_member_social` scope
- **Sign In with LinkedIn using OpenID Connect** — Required for `openid`, `profile`, `email` scopes

---

## 4. Instagram API (Meta Graph API)

| Item | Detail |
|------|--------|
| **Base URL** | `https://graph.instagram.com` / `https://graph.facebook.com` |
| **API Version** | `v25.0` |
| **Auth** | OAuth 2.0 via Facebook/Meta Business Login |
| **Credentials** | `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` |

### OAuth Configuration
| Item | Value |
|------|-------|
| Authorization URL | `https://www.instagram.com/oauth/authorize` |
| Token URL | `https://api.instagram.com/oauth/access_token` |
| Long-Lived Token URL | `https://graph.instagram.com/access_token` |
| Token Refresh URL | `https://graph.instagram.com/refresh_access_token` |
| Redirect URI | Configurable (`INSTAGRAM_REDIRECT_URI`) |
| Scopes | `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments` |
| Short-lived Token | ~1 hour |
| Long-lived Token | ~60 days (refreshable) |

### Endpoints Used
| Method | Endpoint | Purpose | Used In |
|--------|----------|---------|---------|
| GET | `/oauth/authorize` | Initiate OAuth flow | `instagram_service.get_authorization_url()` |
| POST | `/oauth/access_token` | Exchange code for short-lived token | `instagram_service.exchange_code_for_token()` |
| GET | `/access_token` | Exchange for long-lived token | `instagram_service.exchange_for_long_lived_token()` |
| GET | `/refresh_access_token` | Refresh long-lived token | `instagram_service.refresh_long_lived_token()` |
| GET | `/{user-id}` | Get user profile info | `instagram_service.get_user_profile()` |
| POST | `/{user-id}/media` | Create image/reel/carousel container | `instagram_service.create_image_container()` |
| GET | `/{container-id}?fields=status_code` | Poll container processing status | `instagram_service.check_container_status()` |
| POST | `/{user-id}/media_publish` | Publish a ready container | `instagram_service.publish_container()` |
| POST | `/{media-id}/comments` | Post comment on published media | `instagram_service.post_comment()` |
| GET | `/{media-id}/insights` | Get media performance metrics | `instagram_service.get_media_insights()` |
| GET | `/{user-id}/insights` | Get account-level insights | `instagram_service.get_account_insights()` |
| GET | `/{user-id}/content_publishing_limit` | Check publishing limit status | `instagram_service.check_rate_limit()` |

### Required Meta App Permissions
- **instagram_business_basic** — Read business account profile data
- **instagram_business_content_publish** — Create and publish media
- **instagram_business_manage_comments** — Post and manage comments on owned media

If account or media insights are added to the live workflow, request the matching Instagram business insights permission used by the chosen Meta login flow.

### Content Publishing Flow
```
1. Create Container → POST /{user-id}/media (returns container_id)
2. Poll Status     → GET /{container-id}?fields=status_code (wait for FINISHED)
3. Publish         → POST /{user-id}/media_publish (returns media_id)
4. Comment (opt.)  → POST /{media-id}/comments
```

### Operational Constraints
- Media must be reachable through a public HTTPS URL. Local file paths or private intranet URLs will fail for Instagram publishing.
- The connected Instagram account must be a Professional account and properly connected in Meta.
- Meta can block publishing until Page Publishing Authorization is completed where applicable.
- App Review is required before a real client rollout outside development/test users.
- `alt_text` is supported for image publishing and should be populated for accessibility when available.

### Rate Limits
- Content Publishing: **100 API-published posts per 24-hour moving window** per user
- API calls: 200 calls per user per hour (Graph API)

### Media Requirements
| Type | Format | Max Size | Aspect Ratio |
|------|--------|----------|-------------|
| Image | JPEG | 8 MB | 1:1 or 4:5 |
| Reel | MP4 | 1 GB | 9:16 |
| Carousel | JPEG/MP4 | 2-10 items | Mixed |

---

## 5. Environment Variables Summary

```env
# Google AI
GOOGLE_API_KEY=<your-google-api-key>

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=<your-linkedin-client-id>
LINKEDIN_CLIENT_SECRET=<your-linkedin-client-secret>
LINKEDIN_REDIRECT_URI=http://localhost:8001/auth/linkedin/callback

# Instagram OAuth (Meta)
INSTAGRAM_APP_ID=<your-meta-app-id>
INSTAGRAM_APP_SECRET=<your-meta-app-secret>
INSTAGRAM_REDIRECT_URI=http://localhost:8001/auth/instagram/callback

# App
APP_SECRET_KEY=<random-secret-key>
MEDIA_PUBLIC_BASE_URL=https://yourdomain.com/images
```

### Notes on `MEDIA_PUBLIC_BASE_URL`
Instagram requires a **publicly accessible URL** for image uploads (unlike LinkedIn which uses binary upload). During development, you can use:
- **ngrok** — `ngrok http 8001` → use the https URL
- **Cloudflare Tunnel** — for persistent tunnels
- **Cloud storage** — Upload images to S3/GCS and use those URLs

---

## 6. Meta App Setup Checklist

1. Create a Meta App at [developers.facebook.com](https://developers.facebook.com)
2. Add **Instagram Basic Display** and **Instagram Graph API** products
3. Configure **Business Login** (not Facebook Login)
4. Add redirect URI: `http://localhost:8001/auth/instagram/callback`
5. Request permissions: `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments`
6. Connect an Instagram Professional (Business or Creator) account
7. Submit for App Review before going live (development mode has limited access)

Use the Business Login / Instagram business publishing stack consistently. The app code currently uses business-prefixed Instagram scopes, so the Meta app configuration must match that flow.

## 7. LinkedIn App Setup Checklist

1. Create an app at [linkedin.com/developers](https://www.linkedin.com/developers/)
2. Add products: **Share on LinkedIn**, **Sign In with LinkedIn using OpenID Connect**
3. Configure redirect URI: `http://localhost:8001/auth/linkedin/callback`
4. Note Client ID and Client Secret
5. Verify your app's OAuth 2.0 scopes include `openid`, `profile`, `email`, `w_member_social`
