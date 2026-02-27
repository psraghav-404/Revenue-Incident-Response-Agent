# Security Policy

## 🔒 Reporting Vulnerabilities

If you discover a security vulnerability in RevenueGuard AI, **please do NOT open a public issue**.

Instead, report it responsibly:

1. **Email:** Send details to `<your-email@example.com>`
2. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
3. **Response time:** We aim to acknowledge reports within **48 hours**.

---

## 🛡️ Security Best Practices for Contributors

- **Never commit secrets.** No API keys, passwords, tokens, or `.env` files should be pushed to this repository.
- **Use environment variables** for all sensitive configuration (Elasticsearch URLs, API keys, etc.).
- **Review dependencies** before adding new packages. Check for known vulnerabilities using:
  ```bash
  npm audit
  ```
- **Do not hardcode credentials** in any source file, test, or configuration.

---

## ✅ What We Guarantee

| Commitment                          | Status |
|-------------------------------------|--------|
| No production credentials in repo   | ✔️      |
| All secrets loaded via `.env`       | ✔️      |
| `.gitignore` excludes `.env` files  | ✔️      |
| Dependencies audited regularly      | ✔️      |

---

## 📦 Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x     | ✅ Active support   |
| < 1.0   | ❌ No support       |

---

Thank you for helping keep RevenueGuard AI secure.
