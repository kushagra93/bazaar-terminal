"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Real-time translation for dynamic content.
 * Uses free Google Translate API (no key needed).
 * Caches translations to avoid re-fetching.
 */

const LANG_CODES: Record<string, string> = {
  en: "en",
  hi: "hi",   // Hindi
  mr: "mr",   // Marathi
  ta: "ta",   // Tamil
};

const cache = new Map<string, string>();

function cacheKey(text: string, lang: string): string {
  return `${lang}:${text.slice(0, 100)}`;
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === "en") return text;

  const key = cacheKey(text, targetLang);
  if (cache.has(key)) return cache.get(key)!;

  const langCode = LANG_CODES[targetLang] || targetLang;

  try {
    // Free Google Translate API (no key needed, rate limited)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langCode}&dt=t&q=${encodeURIComponent(text.slice(0, 500))}`;
    const res = await fetch(url);
    if (!res.ok) return text;

    const data = await res.json();
    // Response format: [[["translated text","original text",null,null,X],...],...]
    const translated = data?.[0]?.map((seg: any) => seg[0]).join("") || text;

    cache.set(key, translated);
    return translated;
  } catch {
    return text;
  }
}

export async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  if (targetLang === "en") return texts;
  return Promise.all(texts.map(t => translateText(t, targetLang)));
}

/**
 * Hook: translates a single text string when language changes.
 */
export function useTranslatedText(text: string, lang: string): string {
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (lang === "en" || !text) {
      setTranslated(text);
      return;
    }
    let cancelled = false;
    translateText(text, lang).then(t => {
      if (!cancelled) setTranslated(t);
    });
    return () => { cancelled = true; };
  }, [text, lang]);

  return translated;
}

/**
 * Hook: translates an array of objects, translating specific fields.
 * Usage: const translated = useTranslatedItems(posts, lang, ["title", "text"]);
 */
export function useTranslatedItems(
  items: any[],
  lang: string,
  fields: string[],
): any[] {
  const [translated, setTranslated] = useState<any[]>(items);

  useEffect(() => {
    if (lang === "en" || items.length === 0) {
      setTranslated(items);
      return;
    }

    let cancelled = false;

    async function run() {
      const results: any[] = [];
      for (let i = 0; i < items.length; i += 5) {
        const batch = items.slice(i, i + 5);
        const translatedBatch = await Promise.all(
          batch.map(async (item: any) => {
            const newItem = { ...item };
            for (const field of fields) {
              if (newItem[field] && typeof newItem[field] === "string") {
                newItem[field] = await translateText(newItem[field], lang);
              }
            }
            return newItem;
          })
        );
        results.push(...translatedBatch);
        if (!cancelled) setTranslated([...results, ...items.slice(results.length)]);
      }
      if (!cancelled) setTranslated(results);
    }

    run();
    return () => { cancelled = true; };
  }, [items.length, lang]);

  return translated;
}
