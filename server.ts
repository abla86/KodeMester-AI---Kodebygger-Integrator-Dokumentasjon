import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Lazy init of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY mangler i miljøvariabler');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Systeminstruks med ubegrenset universell koding og fremtidsrettet adaptiv intelligens
const SYSTEM_INSTRUCTION = `
Du er KodeMester AI, en allvitende senior programvarearkitekt, polyglot-utvikler og algoritmisk oppfinner.
Du besitter grensesprengende kodekunnskaper: Du mestrer alle programmeringsspråk som finnes i dag (Python, JavaScript/TypeScript, Java, C++, C#, Rust, Go, Zig, Mojo, Julia, Solidity, Haskell, WebAssembly/WAT, CUDA, Elixir, Erlang, GLSL, Swift, Kotlin, etc.) – OG du kan skrive, oppfinne og realisere koder og konsepter som IKKE ER LAGET ENDA.

KVALITETSREGLER OG STRENGE KRAV FRA BRUKEREN:
1. UNIVERSELL OG FREMTIDSRETTET SKAPEREVNE:
   - Du skal kunne bygge fungerende kode for ethvert tenkelig eller utenkelig konsept.
   - Dersom brukeren beskriver en innovativ idé, et uoppfunnet system, en ny protokoll eller et hypotetisk programmeringsspråk: Skap det fra første prinsipper (first principles)! Implementer fullstendig matematikk, egendefinerte datastrukturer, tolker, kompilatorer eller algoritmer slik at det faktisk virker.
   - Ingen begrensninger eller sperrer når brukeren ber om koder.
2. INGEN MOCK OG INGEN TODO: Skriv aldri "TODO", "implementer her", "mock", "placeholder", eller ufullstendige funksjoner. All kode skal være 100% komplett, reell, syntaktisk feilfri og klar til å kjøre umiddelbart.
3. MINST 3 DISTINKTE FORSLAG: For ethvert spørsmål eller prompt skal du levere nøyaktig 3 ulike, fullt fungerende forslag/varianter:
   - Forslag 1: "Ren & Idiomatisk (Clean Code)" - Fokus på maksimal lesbarhet, enkelhet, standard bibliotek og tydelige navn.
   - Forslag 2: "Ytelse & Optimalisert (High-Performance)" - Fokus på optimal tidskompleksitet (O(1)/O(n)), minneeffektivitet og minimal overhead.
   - Forslag 3: "Robust, Fremtidsrettet & Enterprise" - Fokus på defensiv programmering, typesikkerhet, uttømmende feilhåndtering, modularitet og skalerbarhet.
4. FORHÅNDSTESTING OG VERIFIKASJON: Før du leverer koden skal du virtuelt simulere og teste koden. Du må forsikre deg om at koden ikke har syntaksfeil, ingen udefinerte variabler, ingen null-pekere, og at logikken faktisk fungerer. Du skal inkludere verifikasjonsstatus i svaret.
5. ENHETSTESTER (UNIT TESTS): For hvert forslag skal det alltid medfølge en komplett enhetstestfil:
   - For Python: MÅ benytte det innebygde 'unittest'-rammeverket (unittest.TestCase, assertEqual, assertTrue, assertRaises, etc.) og kunne kjøres direkte med 'if __name__ == "__main__": unittest.main()'.
   - For JavaScript: MÅ benytte enten Node test runner / assert modul eller Jest-syntaks.
   - For Java: JUnit tester.
   - For C#: xUnit / NUnit tester.
   - For C++: Enkel test-runner med assert eller Catch2-stil.
   - For andre språk (Rust, Go, Zig, Mojo osv.): Språkets standard testrammeverk (f.eks. #[test] i Rust).
6. NORSK SPRÅK: All dokumentasjon, forklaringer, kommentarer, forbedringsforslag og revisjoner SKAL skrives på flytende og profesjonelt norsk (bokmål).
`;

// Helper for schema-definisjon av enhetstest og filer
const codeFileSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Filnavn med filendelse, f.eks. main.py eller solution.js' },
    language: { type: Type.STRING, description: 'Programmeringsspråk for filen' },
    code: { type: Type.STRING, description: 'Komplett, uavkortet og fungerende kildekode' },
    description: { type: Type.STRING, description: 'Kort beskrivelse på norsk av filens innhold' },
  },
  required: ['name', 'language', 'code', 'description'],
};

const variantSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'variant_1, variant_2, eller variant_3' },
    label: { type: Type.STRING, description: 'Tittel på forslaget, f.eks. "Forslag 1: Ren & Idiomatisk"' },
    strategyTag: { type: Type.STRING, description: 'Kort tag: "Ren kode", "Høy ytelse", eller "Robust & Type-sikker"' },
    strategyDescription: { type: Type.STRING, description: 'Hvorfor dette forslaget er utformet slik, og fordelene ved denne tilnærmingen på norsk' },
    files: {
      type: Type.ARRAY,
      description: 'Prosjektets kildekodefiler',
      items: codeFileSchema,
    },
    unitTest: {
      type: Type.OBJECT,
      description: 'Komplett enhetstestfil (for Python: unittest-rammeverket)',
      properties: {
        name: { type: Type.STRING, description: 'F.eks. test_solution.py' },
        language: { type: Type.STRING },
        code: { type: Type.STRING, description: 'Fullstendig enhetstestkode uten mock eller todo' },
        description: { type: Type.STRING },
      },
      required: ['name', 'language', 'code', 'description'],
    },
    documentation: { type: Type.STRING, description: 'Fullstendig dokumentasjon i Markdown på norsk: Formål, installasjon og kjøring' },
    explanation: { type: Type.STRING, description: 'Pedagogisk forklaring på norsk: Algoritmegjennomgang, tidskompleksitet og minne' },
    codeImprovements: {
      type: Type.ARRAY,
      description: 'Konkrete forslag til videre optimalisering eller forbedringer',
      items: { type: Type.STRING },
    },
    verification: {
      type: Type.OBJECT,
      description: 'Resultat av forhåndstesting og feilsjekk',
      properties: {
        tested: { type: Type.BOOLEAN },
        syntaxCheck: { type: Type.STRING, description: 'Status for syntakssjekk' },
        runtimeCheck: { type: Type.STRING, description: 'Status for kjøretidssjekk' },
        edgeCasesCovered: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['tested', 'syntaxCheck', 'runtimeCheck', 'edgeCasesCovered'],
    },
    testCases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          input: { type: Type.STRING },
          expectedOutput: { type: Type.STRING },
        },
        required: ['description', 'input', 'expectedOutput'],
      },
    },
    executablePreview: { type: Type.BOOLEAN },
  },
  required: [
    'id',
    'label',
    'strategyTag',
    'strategyDescription',
    'files',
    'unitTest',
    'documentation',
    'explanation',
    'codeImprovements',
    'verification',
    'testCases',
    'executablePreview',
  ],
};

// API: Generer kode (med 3 forslag, enhetstester og verifisering)
app.post('/api/generate-code', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      language = 'python',
      mode = 'generate',
      existingCode = '',
      additionalSnippet = '',
      targetLanguage = '',
      complexity = 'standard',
    } = req.body;

    if (!prompt && !existingCode && !additionalSnippet) {
      return res.status(400).json({ error: 'Beskrivelse eller kildekode mangler.' });
    }

    const ai = getGenAI();

    const userPrompt = `
BRUKERENS FORESPØRSEL:
Handling/Modus: ${mode}
Hovedspråk: ${language}
${targetLanguage ? `Målspråk: ${targetLanguage}` : ''}
Kompleksitetsnivå: ${complexity}

Beskrivelse / Krav:
${prompt || 'Bygg eller forbedre koden som beskrevet.'}

${existingCode ? `HOVEDKILDEKODE (EKSISTERENDE KODE):\n\`\`\`${language}\n${existingCode}\n\`\`\`\n` : ''}
${additionalSnippet ? `EKSTERN KODE SOM SKAL INTEGRERES/UTVIDES MED:\n\`\`\`\n${additionalSnippet}\n\`\`\`\n` : ''}

DU MÅ RETURNERE NØYAKTIG 3 FORSKJELLIGE FORSLAG I "variants"-ARRAYEN:
1. Forslag 1: Ren & Idiomatisk
2. Forslag 2: Høy Ytelse & Minneoptimalisert
3. Forslag 3: Robust, Type-sikker & Defensiv

Husk:
- Hvert forslag skal inneholde en fullstendig enhetstestfil (for Python: bruk 'unittest'-modulen).
- Ingen TODO, ingen mock, ingen forenklinger. All kode skal virke 100%!
- Verifiser at det ikke oppstår krasjer eller feil.
- Skriv all forklaring og dokumentasjon på norsk.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.25,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Prosjekttittel på norsk' },
            language: { type: Type.STRING, description: 'Programmeringsspråk' },
            summary: { type: Type.STRING, description: 'Sammendrag på norsk' },
            variants: {
              type: Type.ARRAY,
              description: 'Nøyaktig 3 fullstendige forslag/varianter',
              items: variantSchema,
            },
            integrationNotes: { type: Type.STRING, description: 'Notater om integrasjon på norsk (hvis integrert)' },
          },
          required: ['title', 'language', 'summary', 'variants'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Feil i /api/generate-code:', error);
    return res.status(500).json({
      error: error?.message || 'Feil ved generering av kode.',
    });
  }
});

// API: Analyser og Refaktorer eksisterende kode (Støtte for Python, JavaScript, Java, C++, C#)
app.post('/api/analyze-and-refactor', async (req: Request, res: Response) => {
  try {
    const { code, language = 'python', goal = 'Generell optimalisering og feilsøking' } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Ingen kode sendt inn for analyse.' });
    }

    const ai = getGenAI();

    const analysisPrompt = `
Du er en nådeløs kode-revisor og refaktorerings-ekspert.
Språk: ${language}
Brukerens ønske: ${goal}

KODEN SOM SKAL ANALYSERES OG REFAKTORERES:
\`\`\`${language}
${code}
\`\`\`

DINE OPPGAVER:
1. Gjennomfør en dyp kode-revisjon. Finn:
   - Kritiske bugs, potensielle null-pekere, type-feil, indekseringsfeil eller krasj-situasjoner.
   - Duplisert kode og unødvendig kompleksitet.
   - Dårlige variabelnavn eller forvirrende mønstre.
   - Ineffektive algoritmer (f.eks. O(n²) som kan gjøres i O(n)).
2. Gi en karakter/score (0-100) og en grundig revisjonsrapport på norsk.
3. Lag NØYAKTIG 3 REFAKTORERTE FORSLAG i "variants"-arrayen:
   - Forslag 1: Ren & Idiomatisk (Fjerner duplisering, forbedrer navngiving og struktur)
   - Forslag 2: Ytelses-optimalisert (Raskeste algoritme, minneoptimalisering)
   - Forslag 3: Robust & Defensiv (Typesikkerhet, validering, unntakshåndtering)
4. For hvert forslag: Inkluder en komplett enhetstestfil (for Python: bruk unittest) som beviser at koden fungerer og ikke har regresjoner!
5. Ingen mock, ingen TODO!
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: analysisPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            language: { type: Type.STRING },
            summary: { type: Type.STRING },
            auditReport: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.INTEGER, description: 'Kodekvalitetsscore fra 0 til 100' },
                summaryNorwegian: { type: Type.STRING, description: 'Oppsummering av revisjonen på norsk' },
                issues: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      severity: { type: Type.STRING, description: 'critical, warning, eller info' },
                      category: { type: Type.STRING, description: 'bug, performance, duplication, naming, eller security' },
                      title: { type: Type.STRING, description: 'Kort tittel på problemet' },
                      description: { type: Type.STRING, description: 'Hva som er galt på norsk' },
                      lineRange: { type: Type.STRING, description: 'F.eks. linje 12-18' },
                      recommendation: { type: Type.STRING, description: 'Hvordan det bør løses på norsk' },
                    },
                    required: ['severity', 'category', 'title', 'description', 'recommendation'],
                  },
                },
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Hva koden allerede gjør bra',
                },
              },
              required: ['overallScore', 'summaryNorwegian', 'issues', 'strengths'],
            },
            variants: {
              type: Type.ARRAY,
              description: '3 refaktorerte versjoner med enhetstester',
              items: variantSchema,
            },
          },
          required: ['title', 'language', 'summary', 'auditReport', 'variants'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Feil i /api/analyze-and-refactor:', error);
    return res.status(500).json({
      error: error?.message || 'Feil ved analyse og refaktorering.',
    });
  }
});

// API: Generer dedikerte enhetstester for eksisterende kode
app.post('/api/generate-unit-tests', async (req: Request, res: Response) => {
  try {
    const { code, language = 'python', framework = 'unittest' } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Kode mangler.' });
    }

    const ai = getGenAI();

    const testPrompt = `
Du er en test-arkitekt og QA-ingeniør.
Språk: ${language}
Kildekode som skal testes:
\`\`\`${language}
${code}
\`\`\`

Oppgave:
Bygg en komplett, fungerende enhetstest-suite.
- For Python: MÅ benytte det innebygde 'unittest'-rammeverket (unittest.TestCase).
- Dekk happy path, edge cases, ugyldig input, tomme verdier og eventuelle unntak.
- ALDRI bruk mock-plassholdere eller "TODO".
- Testene må være direkte kjørbare.
- Forklar teststrategien på norsk.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: testPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fileName: { type: Type.STRING },
            framework: { type: Type.STRING },
            testCode: { type: Type.STRING },
            testSummary: { type: Type.STRING },
            testCasesCovered: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            howToRunNorwegian: { type: Type.STRING },
          },
          required: ['fileName', 'framework', 'testCode', 'testSummary', 'testCasesCovered', 'howToRunNorwegian'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Feil i /api/generate-unit-tests:', error);
    return res.status(500).json({
      error: error?.message || 'Kunne ikke generere enhetstester.',
    });
  }
});

// API Route: Kjør eller simuler kjøring av kildekode og enhetstester
app.post('/api/run-simulation', async (req: Request, res: Response) => {
  try {
    const { code, language, input = '', isUnitTest = false } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Ingen kode levert for kjøring.' });
    }

    const ai = getGenAI();

    const prompt = `
Du er en deterministisk virtuell kode-eksekveringsmotor og enhetstest-evaluator.
Språk: ${language}
Er dette enhetstester som kjøres? ${isUnitTest ? 'JA (evaluer testresultat)' : 'NEI'}

KILDEKODE:
\`\`\`${language}
${code}
\`\`\`

Test/Input som sendes inn (stdin eller parametere):
${input || 'Standard kjøring'}

Oppgave:
Evaluer og simuler koden nøyaktig slik en ekte tolk eller kompilator for ${language} ville gjort.
${isUnitTest ? 'Hvis koden inneholder unittest, simuler kjøring av testsuiten (f.eks: Ran 4 tests in 0.002s - OK eller FAILED).' : ''}

Returner:
- success (boolean): Kjørte koden/alle testene uten ubehandlede feil?
- stdout (string): All standard utskrift / konsoll-logger
- stderr (string): Eventuelle feilmeldinger eller sporingslogger
- exitCode (number): 0 for suksess, 1+ for feil
- executionTimeMs (number): estimert kjøretid i ms
- variableTrace (array): sentrale sluttverdier
- explanationNorwegian (string): Kort oppsummering på norsk av hva som skjedde under kjøringen
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN },
            stdout: { type: Type.STRING },
            stderr: { type: Type.STRING },
            exitCode: { type: Type.INTEGER },
            executionTimeMs: { type: Type.NUMBER },
            variableTrace: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                },
                required: ['name', 'value'],
              },
            },
            explanationNorwegian: { type: Type.STRING },
          },
          required: ['success', 'stdout', 'stderr', 'exitCode', 'explanationNorwegian'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Feil under kjøresimulering:', error);
    return res.status(500).json({
      error: error?.message || 'Feil ved simulering av koden.',
    });
  }
});

// API Route: Still spørsmål om koden eller be om forklaring på norsk
app.post('/api/ask-code', async (req: Request, res: Response) => {
  try {
    const { question, currentCode, language } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Spørsmål mangler.' });
    }

    const ai = getGenAI();

    const prompt = `
Du er KodeMester AI, en vennlig og knivskarp norsk programmeringsveileder.
Brukeren ser på følgende ${language}-kode:
\`\`\`${language}
${currentCode}
\`\`\`

Brukerens spørsmål:
"${question}"

Svar direkte, presist og pedagogisk på NORSK.
Inkluder konkrete kodeeksempler hvis det er relevant.
Hold svaret strukturert og lettlest med Markdown.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Feil under assistent-svar:', error);
    return res.status(500).json({
      error: error?.message || 'Kunne ikke hente svar.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KodeMester AI server kjører på http://0.0.0.0:${PORT}`);
  });
}

startServer();
