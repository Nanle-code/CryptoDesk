# Security Guidelines for CryptoDesk

## 🔐 API Key Management

### NEVER Commit These:
- API keys (SoSoValue, Grok/XAI, Claude, etc.)
- Configuration files with secrets
- Environment files with sensitive data

### ✅ Safe Practices:
1. **Use Environment Variables**: Store API keys in environment variables or `.env` files
2. **Client-side Storage**: Current implementation stores keys in browser session memory only
3. **Input Fields**: API keys are entered through password fields in the UI
4. **No Hardcoding**: Never write API keys directly in source code

## 🛡️ Git Protection

This repository includes:
- **Comprehensive `.gitignore`**: Blocks sensitive files and patterns
- **Pre-commit hooks**: Automatically scans for potential secrets before commits
- **Security checks**: Prevents accidental exposure of API keys

## 🚨 What's Protected

The following patterns are blocked from being committed:
- `sk-[a-zA-Z0-9]` (OpenAI API keys)
- `xai-[a-zA-Z0-9]` (XAI/Grok API keys)  
- `x-soso-[a-zA-Z0-9]` (SoSoValue API keys)
- Hardcoded passwords/secrets/tokens
- Environment files (`.env*`)
- Configuration files with secrets

## 📋 Deployment Security

When deploying to production:
1. Use environment variables for API keys
2. Enable HTTPS for all API communications
3. Implement rate limiting on API calls
4. Consider API key rotation strategies
5. Monitor for unusual API usage patterns

## 🔍 Security Checklist

Before committing or deploying:
- [ ] No hardcoded API keys in source code
- [ ] `.env` files are in `.gitignore`
- [ ] Pre-commit hooks are working
- [ ] API keys are only in browser memory
- [ ] No sensitive data in console logs
- [ ] All API communications use HTTPS

## 🚨 Incident Response

If you accidentally commit sensitive data:
1. **Immediately** remove the sensitive data
2. **Rotate** all exposed API keys
3. **Force push** to remove from git history if needed
4. **Contact** the respective API providers
5. **Review** access logs for unusual activity

## 📞 Contact

For security concerns or to report vulnerabilities:
- Create an issue with the "security" label
- Contact the project maintainers directly
