# 🔒 Security Configuration Guide

This document describes security settings and how to configure them properly.

## Environment Variables for Security

Add these to your `.env` file:

```bash
# API Authentication (optional)
# If set, API endpoints will require this key in X-API-Key header or ?api_key= query param
API_KEY=your-secure-api-key-here

# CORS Configuration
# Comma-separated list of allowed origins, or * for all (not recommended)
# Default: localhost only
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# SSL Certificate Validation
# Set to 'true' to allow self-signed certificates (NOT recommended for production)
# Default: false (validates certificates)
ALLOW_SELF_SIGNED_CERTS=false
```

## Security Features Implemented

### ✅ Fixed Issues

1. **SSL Certificate Validation**
   - Now validates certificates by default
   - Can be disabled via `ALLOW_SELF_SIGNED_CERTS=true` for testing only
   - **Production**: Keep `ALLOW_SELF_SIGNED_CERTS=false`

2. **CORS Policy**
   - Restricted to localhost by default
   - Configurable via `ALLOWED_ORIGINS` environment variable
   - Wildcard (`*`) only allowed if explicitly set
   - **Production**: Set specific allowed origins

3. **API Authentication**
   - Optional API key authentication
   - Set `API_KEY` to enable
   - Use `X-API-Key` header or `?api_key=` query parameter
   - **Production**: Always set a strong API key

4. **Rate Limiting**
   - 100 requests per minute per IP address
   - Prevents DoS attacks
   - In-memory (resets on server restart)

5. **Input Validation**
   - Website names sanitized to prevent path traversal
   - Length limits on inputs
   - URL validation before use

6. **Error Message Sanitization**
   - Error messages don't expose internal paths
   - Sensitive information filtered

## Security Best Practices

### For Production Deployment

1. **Always set `API_KEY`** for authentication
2. **Restrict `ALLOWED_ORIGINS`** to your domain(s)
3. **Keep `ALLOW_SELF_SIGNED_CERTS=false`** unless absolutely necessary
4. **Use HTTPS** - Deploy behind reverse proxy (nginx/Apache) with SSL
5. **Restrict network access** - Use firewall rules to limit who can access the API
6. **Monitor logs** - Set up logging to detect suspicious activity
7. **Keep dependencies updated** - Run `npm audit` regularly
8. **Use strong API keys** - Generate random, long API keys

### For Development

- Default settings are secure (localhost only, no auth required)
- Can use `ALLOW_SELF_SIGNED_CERTS=true` for testing with self-signed certs
- Wildcard CORS allowed for local development

## API Authentication

### Using API Key

**Header Method:**
```bash
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/status
```

**Query Parameter Method:**
```bash
curl "http://localhost:3000/api/status?api_key=your-api-key"
```

### Without API Key

If `API_KEY` is not set, API endpoints are publicly accessible (not recommended for production).

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Response**: 429 Too Many Requests if exceeded
- **Reset**: Automatically after 1 minute

## CORS Configuration Examples

**Single Origin:**
```bash
ALLOWED_ORIGINS=https://example.com
```

**Multiple Origins:**
```bash
ALLOWED_ORIGINS=https://example.com,https://app.example.com
```

**Development (All Origins - NOT for production):**
```bash
ALLOWED_ORIGINS=*
```

## SSL Certificate Validation

**Production (Recommended):**
```bash
ALLOW_SELF_SIGNED_CERTS=false
```
- Validates all SSL certificates
- Rejects self-signed or invalid certificates
- Most secure option

**Testing Only:**
```bash
ALLOW_SELF_SIGNED_CERTS=true
```
- Allows self-signed certificates
- Useful for testing internal sites
- **Never use in production**

## Security Checklist

Before deploying to production:

- [ ] Set strong `API_KEY`
- [ ] Configure `ALLOWED_ORIGINS` with specific domains
- [ ] Set `ALLOW_SELF_SIGNED_CERTS=false`
- [ ] Deploy behind HTTPS reverse proxy
- [ ] Configure firewall rules
- [ ] Set up monitoring/logging
- [ ] Run `npm audit` and fix any vulnerabilities
- [ ] Review and update dependencies regularly
- [ ] Test authentication and rate limiting
- [ ] Document security procedures

## Reporting Security Issues

If you discover a security vulnerability, please:
1. Do not open a public issue
2. Contact the maintainers privately
3. Provide detailed information about the vulnerability

---

**Last Updated**: November 27, 2024

