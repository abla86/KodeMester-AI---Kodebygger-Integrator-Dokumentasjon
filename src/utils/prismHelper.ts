import Prism from 'prismjs';

// Import essential Prism grammar extensions safely
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';

export function highlightCode(code: string, language: string): string {
  if (!code) return '';
  
  const langNormalized = language.toLowerCase().trim();
  let grammar = Prism.languages[langNormalized];

  if (!grammar) {
    if (['ts', 'tsx'].includes(langNormalized)) grammar = Prism.languages.typescript;
    else if (['js', 'jsx'].includes(langNormalized)) grammar = Prism.languages.javascript;
    else if (['py'].includes(langNormalized)) grammar = Prism.languages.python;
    else if (['rs'].includes(langNormalized)) grammar = Prism.languages.rust;
    else if (['sh', 'shell', 'zsh'].includes(langNormalized)) grammar = Prism.languages.bash;
    else if (['htm', 'html', 'xml', 'svg'].includes(langNormalized)) grammar = Prism.languages.markup;
    else if (['cs'].includes(langNormalized)) grammar = Prism.languages.csharp;
    else grammar = Prism.languages.clike || Prism.languages.javascript;
  }

  try {
    return Prism.highlight(code, grammar, langNormalized);
  } catch (err) {
    console.warn('Prism highlight error, fallback to raw text:', err);
    // Escape HTML safely
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
