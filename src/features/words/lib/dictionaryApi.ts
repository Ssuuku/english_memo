/**
 * Free Dictionary API ラッパー
 * https://github.com/meetDeveloper/freeDictionaryAPI
 */

export type DictionaryResult = {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
};

export async function fetchDictionaryDefinition(word: string): Promise<DictionaryResult | null> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error(`Failed to fetch definition for "${word}":`, error);
    return null;
  }
}

/**
 * 定義から簡潔な意味を抽出
 */
export function extractSimpleMeaning(dictResult: DictionaryResult): string {
  if (!dictResult.meanings || dictResult.meanings.length === 0) {
    return "";
  }

  // 最初の品詞の最初の定義を使用
  const firstMeaning = dictResult.meanings[0];
  if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
    return firstMeaning.definitions[0].definition;
  }

  return "";
}
