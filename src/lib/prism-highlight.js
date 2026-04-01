import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";

const loadedLanguages = new Set();

const languageAliases = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  html: "markup",
  xml: "markup",
  svg: "markup",
  md: "markdown",
  shell: "bash",
  sh: "bash",
  yml: "yaml",
};

function normalizeLanguage(language) {
  const normalizedLanguage = (language || "text").trim().toLowerCase();
  return languageAliases[normalizedLanguage] || normalizedLanguage || "text";
}

function ensureLanguage(language) {
  const normalizedLanguage = normalizeLanguage(language);

  if (
    normalizedLanguage === "text" ||
    normalizedLanguage === "plain" ||
    loadedLanguages.has(normalizedLanguage) ||
    Prism.languages[normalizedLanguage]
  ) {
    loadedLanguages.add(normalizedLanguage);
    return normalizedLanguage;
  }

  try {
    loadLanguages([normalizedLanguage]);
    loadedLanguages.add(normalizedLanguage);
    return normalizedLanguage;
  } catch {
    return "text";
  }
}

export function highlightCode(code, language) {
  const normalizedLanguage = ensureLanguage(language);

  if (normalizedLanguage === "text" || !Prism.languages[normalizedLanguage]) {
    return {
      language: normalizedLanguage,
      html: Prism.util.encode(code),
    };
  }

  return {
    language: normalizedLanguage,
    html: Prism.highlight(code, Prism.languages[normalizedLanguage], normalizedLanguage),
  };
}
