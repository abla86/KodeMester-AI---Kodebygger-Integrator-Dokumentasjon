# KodeMester AI

KodeMester AI is a Norwegian-language developer tool for code generation, refactoring, integration, conversion, testing guidance and project export.

## What it demonstrates

- React + TypeScript + Vite frontend
- Express/TypeScript backend
- Google Gemini API integration kept server-side
- Code generation in multiple languages
- Refactoring and audit workflow
- Unit-test generation
- Syntax/code inspection views
- Local project history
- ZIP project export
- Live preview for supported generated code

## Architecture

```text
React / Vite
    |
    +-- Code generation UI
    +-- Refactor / audit UI
    +-- Test and code views
    +-- Local project history
    |
    v
Express API
    |
    v
Google Gemini API
```

The Gemini API key is read only from the server environment. It must never be committed to the repository.

## Local development

Requirements:

- Node.js 20+
- A Google Gemini API key for AI generation

Install dependencies:

```bash
npm install
```

Create a local `.env` file:

```env
GEMINI_API_KEY=your_key_here
```

Start development:

```bash
npm run dev
```

The application uses port 3000.

## Verification

```bash
npm run lint
npm run build
```

The GitHub Actions workflow performs the same TypeScript and production-build checks.

## Security boundary

This is a developer productivity demonstration, not a secure code-execution sandbox. Generated code must be reviewed before execution. The application does not claim that AI-generated code is correct, safe or production-ready merely because it was generated successfully.

Never enter production secrets, personal data or confidential source code unless the deployment and data-handling model has been reviewed for that use.

## API key handling

- Keep `GEMINI_API_KEY` in the deployment environment.
- Do not place the key in client-side code.
- Do not commit `.env`.
- Rotate the key if it is ever exposed.

## License

Apache License 2.0. See [LICENSE](LICENSE).
