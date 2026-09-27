import { SupportedLanguage } from '../types';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  // 5 Hovedspråk
  { id: 'python', name: 'Python (3.12+)', extension: '.py', prismLang: 'python', category: 'core', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', popular: true },
  { id: 'javascript', name: 'JavaScript (ES2024)', extension: '.js', prismLang: 'javascript', category: 'core', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30', popular: true },
  { id: 'java', name: 'Java (21 LTS)', extension: '.java', prismLang: 'java', category: 'core', badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30', popular: true },
  { id: 'cpp', name: 'C++ (Modern C++20/23)', extension: '.cpp', prismLang: 'cpp', category: 'core', badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30', popular: true },
  { id: 'csharp', name: 'C# (.NET 8/9)', extension: '.cs', prismLang: 'csharp', category: 'core', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30', popular: true },
  
  // Avanserte og fremtidsrettede system- og applikasjonsspråk
  { id: 'rust', name: 'Rust (2024 Edition)', extension: '.rs', prismLang: 'rust', category: 'systems', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30', popular: true },
  { id: 'typescript', name: 'TypeScript', extension: '.ts', prismLang: 'typescript', category: 'web', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: 'go', name: 'Go (Golang)', extension: '.go', prismLang: 'go', category: 'backend', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  { id: 'mojo', name: 'Mojo (AI & High-Perf)', extension: '.mojo', prismLang: 'python', category: 'systems', badgeColor: 'bg-red-600/20 text-red-300 border-red-600/30' },
  { id: 'zig', name: 'Zig', extension: '.zig', prismLang: 'c', category: 'systems', badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { id: 'solidity', name: 'Solidity (Smart Contracts)', extension: '.sol', prismLang: 'javascript', category: 'backend', badgeColor: 'bg-slate-400/20 text-slate-300 border-slate-400/30' },
  { id: 'wat', name: 'WebAssembly (WAT)', extension: '.wat', prismLang: 'bash', category: 'systems', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { id: 'julia', name: 'Julia (Vitenskap & Tall)', extension: '.jl', prismLang: 'python', category: 'scripting', badgeColor: 'bg-purple-600/20 text-purple-300 border-purple-600/30' },
  { id: 'sql', name: 'SQL (PostgreSQL / SQLite)', extension: '.sql', prismLang: 'sql', category: 'database', badgeColor: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
  { id: 'bash', name: 'Bash / Linux Shell', extension: '.sh', prismLang: 'bash', category: 'scripting', badgeColor: 'bg-lime-500/20 text-lime-300 border-lime-500/30' },
  { id: 'custom', name: '✨ Annet / Egendefinert Språk', extension: '.txt', prismLang: 'javascript', category: 'core', badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' },
];

export interface LanguagePreset {
  category: 'syntax' | 'datastructure' | 'algorithm' | 'future' | 'practical';
  categoryLabel: string;
  language: string;
  title: string;
  description: string;
  prompt: string;
}

export const LANGUAGE_PRESETS: LanguagePreset[] = [
  // FREMTIDIGE & GRENSESPRENGENDE KODER (Ukjente / Ikke laget enda / Next-Gen)
  {
    category: 'future',
    categoryLabel: 'Innovasjon & Fremtid',
    language: 'python',
    title: '🧬 Egendefinert Programmeringsspråk (Lexer, Parser & VM)',
    description: 'Skap et helt nytt programmeringsspråk med egen tokenisering, AST-tre og virtuell maskin.',
    prompt: 'Lag et komplett, fungerende mikrospråk i Python fra første prinsipper: En Lexer som tokeniserer kildekode, en Recursive Descent Parser som bygger et AST (Abstract Syntax Tree), og en virtuell stack-maskin (Bytecode VM) som eksekverer variabler, matematiske uttrykk, loops og funksjoner. Ta med grundige enhetstester.',
  },
  {
    category: 'future',
    categoryLabel: 'Innovasjon & Fremtid',
    language: 'python',
    title: '⚛️ Kvanteberegnings-simulator (Qubits & Kvanteporter)',
    description: 'Simuler superposition, Hadamard-, CNOT-porter og kvantesammenfiltring (entanglement).',
    prompt: 'Implementer en virtuell kvantedatamaskin i Python fra bunnen av ved hjelp av matriseregning. Støtt N qubits i superposition, kvanteporter (Hadamard, Pauli-X/Y/Z, Phase, CNOT), beregning av tilstandsvektorer, og sannsynlighetsbasert kvantemåling som kollapser bølgefraksjonen. Inkluder unittest-tester for Bell-state og kvanteteleportering.',
  },
  {
    category: 'future',
    categoryLabel: 'Innovasjon & Fremtid',
    language: 'python',
    title: '🤖 Minimal Autoregressiv Transformer (Mini-GPT) fra bunnen',
    description: 'Kjernearkitektur for store språkmodeller (LLM) med Multi-Head Self-Attention.',
    prompt: 'Skriv en ren og fullstendig implementasjon av Multi-Head Self-Attention og en autoregressiv Transformer-blokk i ren Python (uten eksterne rammeverk som PyTorch). Inkluder posisjonskoding (Positional Encoding), softmax-skalert prikkprodukt og en demonstrasjon av tekstgenerering token-for-token. Inkluder unittest-tester.',
  },
  {
    category: 'future',
    categoryLabel: 'Innovasjon & Fremtid',
    language: 'javascript',
    title: '⛓️ Desentralisert Konsensus & Blokkjede med Smart Contracts',
    description: 'Komplett blokkjede med kryptografisk hashing, Proof-of-Work og virtuell tilstandsmaskin.',
    prompt: 'Bygg en fullverdig blokkjede i JavaScript med kryptografiske SHA-256 blokklenker, Proof-of-Work mining med justerbar vanskelighetsgrad, transaksjonspool (Mempool), og en miniatyr smart contract-motor som oppdaterer saldoer og tilstand deterministisk. Ta med enhetstester.',
  },

  // PYTHON PRESETS
  {
    category: 'datastructure',
    categoryLabel: 'Datastruktur',
    language: 'python',
    title: '🐍 LRU Cache med O(1) oppslag',
    description: 'Datastruktur med fast kapasitet og minste nylig brukte utskifting.',
    prompt: 'Lag en komplett og trådsikker LRU Cache (Least Recently Used) i Python ved hjelp av en dobbeltlenket liste og et oppslagstabell (dict). Både get() og put() må ha O(1) tidskompleksitet. Ta med unittest-tester.',
  },
  {
    category: 'algorithm',
    categoryLabel: 'Algoritme',
    language: 'python',
    title: '🐍 Kvikksortering (Quicksort) med median-of-three',
    description: 'Effektiv sorteringsalgoritme med O(n log n) gjennomsnittlig tid.',
    prompt: 'Implementer kvikksortering (Quicksort) i Python med "median-of-three" pivotelement for å unngå verste fall O(n^2). Inkluder in-place partisjonering og unittest-tester med tilfeldige lister, duplikater og tomme lister.',
  },
  {
    category: 'syntax',
    categoryLabel: 'Grunnleggende Syntaks',
    language: 'python',
    title: '🐍 Dataclass, Type Hints & Generatorer',
    description: 'Moderne Python 3.12 syntaks med typesikkerhet og minneeffektiv streaming.',
    prompt: 'Lag et Python-skript som demonstrerer moderne idiomatisk syntaks: @dataclass med feltvalidering, type hints med Union/Optional, en custom generator for streaming av store datasett, og context manager (__enter__ / __exit__).',
  },

  // JAVASCRIPT PRESETS
  {
    category: 'datastructure',
    categoryLabel: 'Datastruktur',
    language: 'javascript',
    title: '📜 Trie (Prefikstre) for Autosøk',
    description: 'Lynrask ord- og prefikssøk for søkeforslag og ordbøker.',
    prompt: 'Bygg en komplett Trie (Prefikstre) datastruktur i ren JavaScript (ES6+). Metoder: insert(word), search(word), startsWith(prefix), og getWordsWithPrefix(prefix) for autofullfør. Inkluder enhetstester.',
  },
  {
    category: 'algorithm',
    categoryLabel: 'Algoritme',
    language: 'javascript',
    title: '📜 Dybde-først-søk (DFS) & Syklusdeteksjon i Graf',
    description: 'Traversering og oppdagelse av sirkulære avhengigheter i en rettet graf.',
    prompt: 'Lag en rettet graf (Directed Graph) i JavaScript med metoder for å legge til noder og kanter, kjøre dybde-først-søk (DFS), finne korteste sti, og detektere om det finnes sykluser/sirkulære avhengigheter. Ta med enhetstester.',
  },

  // JAVA PRESETS
  {
    category: 'datastructure',
    categoryLabel: 'Datastruktur',
    language: 'java',
    title: '☕ Generisk Binært Søketre (BST)',
    description: 'Type-sikkert søketre med innsetting, sletting og in-order traversering.',
    prompt: 'Lag et fullstendig generisk binært søketre (BinarySearchTree<T extends Comparable<T>>) i Java. Støtt insert, delete (med alle tre tilfeller), search, inOrderTraversal, og beregning av treets høyde. Ta med grundige enhetstester.',
  },
  {
    category: 'algorithm',
    categoryLabel: 'Algoritme',
    language: 'java',
    title: '☕ Dijkstra Korteste Sti i Vektet Graf',
    description: 'Klassisk algoritme for å finne billigste rute mellom noder.',
    prompt: 'Implementer Dijkstras algoritme for å finne korteste vei i en vektet graf i Java ved hjelp av PriorityQueue. Inkluder rekonstruksjon av selve stien fra start til mål, håndtering av utilgjengelige noder, og enhetstester.',
  },

  // C++ PRESETS
  {
    category: 'datastructure',
    categoryLabel: 'Datastruktur',
    language: 'cpp',
    title: '⚡ Sirkulær Ringbuffer med RAII',
    description: 'Minneeffektiv buffer med fast størrelse uten dynamisk reallokering.',
    prompt: 'Implementer en generisk sirkulær ringbuffer (template <typename T, size_t Capacity> class RingBuffer) i moderne C++ (C++20). Støtt push, pop, peek, is_full, is_empty, og iteratorer. Bruk RAII og unngå minnelekkasjer. Inkluder testfunksjoner med assert.',
  },
  {
    category: 'algorithm',
    categoryLabel: 'Algoritme',
    language: 'cpp',
    title: '⚡ Binærsøk & Nedre/Øvre grense',
    description: 'Logaritmisk O(log n) søk i sortert array med egendefinert sammenligning.',
    prompt: 'Skriv en komplett implementasjon av binærsøk, lower_bound og upper_bound i moderne C++ som fungerer på sorterte std::vector<T>. Håndter kanttilfeller som tom vektor, element ikke funnet, og like elementer. Inkluder grundige tester.',
  },

  // C# PRESETS
  {
    category: 'datastructure',
    categoryLabel: 'Datastruktur',
    language: 'csharp',
    title: '🔷 Generisk Min-Heap / Prioritetskø',
    description: 'Effektiv prioritetskø for henting av minste element i O(log n).',
    prompt: 'Implementer en fullstendig generisk Min-Heap (Binary Heap) i C# (.NET 8/9). Støtt Enqueue, Dequeue (fjerner minste), Peek, Count og Clear. Inkluder automatisk utvidelse av internt array og enhetstester.',
  },
  {
    category: 'algorithm',
    categoryLabel: 'Algoritme',
    language: 'csharp',
    title: '🔷 Flettesortering (Merge Sort) & Inversjoner',
    description: 'Stabil O(n log n) sorteringsalgoritme med telling av inversjoner.',
    prompt: 'Bygg en stabil MergeSort-algoritme i C# med generiske typer (IComparable<T>). Ta også med en funksjon som teller antall inversjoner i arrayet for å måle hvor usortert det var. Inkluder xUnit/NUnit eller assert-tester.',
  },
];
