import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Caminho relativo ao build: sobe de MCP/build/ até DIO_EXPLORER/DATA/
const DATA_PATH = join(__dirname, "../../DATA/trilhas_dio.json");

export interface Live {
  titulo: string;
  data: string;
  horario: string;
}

export interface Promocao {
  desconto_percentual: number;
  validade: string;
  cupom: string;
}

export interface PromocaoVitalicia {
  disponivel: boolean;
  preco_original: number;
  preco_vitalicio: number | null;
}

export interface Trilha {
  id: number;
  nome: string;
  tecnologia: string;
  nivel: string;
  numero_modulos: number;
  xp_total: number;
  badges_disponiveis: string[];
  promocoes: Promocao;
  promocao_vitalicia: PromocaoVitalicia;
  lives_ao_vivo: Live[];
}

export interface DioData {
  trilhas: Trilha[];
}

// ── Mapeamento de nível do usuário → nível das trilhas ──────────────────────
export const NIVEL_MAP: Record<string, string[]> = {
  iniciante: ["Básico", "Básico ao Intermediário", "Básico ao Avançado"],
  intermediario: ["Intermediário", "Intermediário ao Avançado", "Básico ao Avançado"],
  avancado: ["Avançado", "Intermediário ao Avançado"],
};

// ── Mapeamento de área → tecnologias relacionadas ────────────────────────────
export const AREA_MAP: Record<string, string[]> = {
  web: ["React", "Angular", "Vue.js", "TypeScript", "Node.js", "PHP", "Ruby", ".NET"],
  mobile: ["Flutter", "Swift", "Kotlin", "Android", "iOS"],
  cloud: ["Amazon Web Services", "Microsoft Azure", "Google Cloud Platform", "DevOps", "Kubernetes"],
  dados: ["Python", "Apache Spark", "Databricks", "Power BI", "SQL", "MongoDB"],
  seguranca: ["Cybersecurity", "Ethical Hacking"],
  backend: ["Python", "Java", "Node.js", "Go", "Rust", "PHP", ".NET", "Ruby"],
  ia: ["LLMs", "LangChain", "TensorFlow", "Scikit-Learn", "Python"],
  blockchain: ["Solidity", "Ethereum", "Web3"],
  devops: ["DevOps", "Docker", "Kubernetes", "CI-CD"],
  fundamentos: ["Redes", "Sistemas Operacionais", "Lógica", "Scrum", "Kanban"],
};

let _cache: DioData | null = null;

export function getDioData(): DioData {
  if (!_cache) {
    const raw = readFileSync(DATA_PATH, "utf-8");
    _cache = JSON.parse(raw) as DioData;
  }
  return _cache;
}

export function getTrilhas(): Trilha[] {
  return getDioData().trilhas;
}

export function getTrilhaById(id: number): Trilha | undefined {
  return getTrilhas().find((t) => t.id === id);
}

export function getTrilhaByNomeOuId(idOuNome: string | number): Trilha | undefined {
  const trilhas = getTrilhas();
  if (typeof idOuNome === "number" || /^\d+$/.test(String(idOuNome))) {
    return trilhas.find((t) => t.id === Number(idOuNome));
  }
  const termo = String(idOuNome).toLowerCase();
  return trilhas.find(
    (t) =>
      t.nome.toLowerCase().includes(termo) ||
      t.tecnologia.toLowerCase().includes(termo)
  );
}
