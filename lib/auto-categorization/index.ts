/**
 * AUTO-CATEGORIZARE TRANZACȚII
 *
 * Funcție pură care compară descrierea unei tranzacții cu
 * lista de keywords ale userului și returnează categoryId dacă găsește match.
 *
 * EXEMPLU:
 * keywords: [{ keyword: "netflix", categoryId: "cat_123" }]
 * description: "NETFLIX SUBSCRIPTION" → returnează "cat_123"
 * description: "MEGA IMAGE" → returnează null (fără match)
 */

export interface Keyword {
  keyword: string;
  categoryId: string;
}

/**
 * Încearcă să găsească o categorie potrivită pentru o tranzacție.
 *
 * @param description - Descrierea tranzacției din extras bancar
 * @param keywords - Lista de keywords ale userului (pre-loaded, nu se face fetch aici)
 * @returns categoryId dacă găsește match, null dacă nu
 */
export function autoCategorizare(
  description: string,
  keywords: Keyword[]
): string | null {
  const desc = description.toLowerCase();
  for (const kw of keywords) {
    if (desc.includes(kw.keyword.toLowerCase())) {
      return kw.categoryId;
    }
  }
  return null;
}
