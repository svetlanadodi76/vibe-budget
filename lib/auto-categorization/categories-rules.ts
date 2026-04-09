/**
 * CATEGORII PREDEFINITE
 *
 * Lista cu categoriile sistem create automat pentru utilizatori noi.
 * Folosită la seed-ul inițial când userul nu are nicio categorie.
 */

export interface CategoryRule {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
  description: string;
  keywords: string[];
}

const CATEGORIES: CategoryRule[] = [
  // CHELTUIELI
  {
    name: "Transport",
    icon: "🚗", color: "#3b82f6", type: "expense",
    description: "Benzină, taxi, metrou, parcări",
    keywords: ["taxi", "bolt", "uber", "petrom", "lukoil", "benzin", "parcare", "autobuz", "troleibuz", "metrou"],
  },
  {
    name: "Cumpărături",
    icon: "🛍️", color: "#8b5cf6", type: "expense",
    description: "Haine, electronice, diverse",
    keywords: ["mega image", "linella", "carrefour", "kaufland", "lidl", "penny", "supermarket", "market"],
  },
  {
    name: "Locuință",
    icon: "🏠", color: "#f97316", type: "expense",
    description: "Chirie, utilități, reparații",
    keywords: ["chirie", "chisinau apa", "apa canal", "curent", "electric", "gaz", "termocom", "moldtelecom", "orange", "moldcell"],
  },
  {
    name: "Sănătate",
    icon: "💊", color: "#ec4899", type: "expense",
    description: "Medicamente, consulturi, analize",
    keywords: ["farmac", "hipocrat", "felicia", "medic", "doctor", "clinica", "spital", "dentist", "analiz"],
  },
  {
    name: "Divertisment",
    icon: "🎬", color: "#6366f1", type: "expense",
    description: "Restaurante, cinema, sport",
    keywords: ["restaurant", "la placinte", "cafe", "cafenea", "cinema", "gym", "fitness", "sport", "pizza", "sushi"],
  },
  {
    name: "Subscripții",
    icon: "📺", color: "#0ea5e9", type: "expense",
    description: "Netflix, Spotify, aplicații",
    keywords: ["netflix", "spotify", "youtube", "apple", "google", "abonament", "subscri"],
  },
  {
    name: "Educație",
    icon: "📚", color: "#10b981", type: "expense",
    description: "Cursuri, cărți, training",
    keywords: ["udemy", "coursera", "curs", "carte", "librarie", "training", "educatie"],
  },
  {
    name: "Cash",
    icon: "💵", color: "#d97706", type: "expense",
    description: "Retrageri numerar ATM",
    keywords: ["atm", "retragere", "numerar", "cash"],
  },
  {
    name: "Taxe și Impozite",
    icon: "🧾", color: "#ef4444", type: "expense",
    description: "Taxe stat, impozite, amenzi",
    keywords: ["taxa", "impozit", "amenda", "fisc", "sfs", "stat"],
  },
  {
    name: "Transfer Intern",
    icon: "🔄", color: "#64748b", type: "expense",
    description: "Transferuri între conturi proprii",
    keywords: ["transfer intern", "cont propriu"],
  },
  {
    name: "Transferuri",
    icon: "💸", color: "#94a3b8", type: "expense",
    description: "Transferuri către alte persoane",
    keywords: ["transfer catre", "transfer familie", "transfer"],
  },
  // VENITURI
  {
    name: "Venituri",
    icon: "💰", color: "#16a34a", type: "income",
    description: "Salariu, freelance, alte venituri",
    keywords: ["salariu", "freelance", "dividend", "ramburs", "bonus", "venit", "proiect"],
  },
];

export function getAllCategories(): CategoryRule[] {
  return CATEGORIES;
}
