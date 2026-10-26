# Security Policy

## Scope and limitations
KodeMester is an AI-assisted code-generation and integration tool. Generated code and project scans are advisory; they do not prove correctness, security, licensing compliance or production readiness. Do not treat the application as a secure sandbox for executing untrusted code.

## Secrets and data
- Keep API keys and tokens in server-side secret storage or local environment variables excluded from Git.
- Do not submit customer secrets, production credentials, patient data or confidential source code to external AI providers without approval and a data-processing review.
- Review generated scripts before running them. Execute untrusted code only in a disposable, isolated environment without production credentials.
- Review exported archives for secrets, local paths and confidential data.

## Reporting
Use GitHub private vulnerability reporting if enabled; otherwise contact the maintainer privately. Include the affected commit and reproduction steps, but redact secrets and personal data.

## Verification
Build and static analysis checks are not a complete security audit or proof that generated code is safe.
