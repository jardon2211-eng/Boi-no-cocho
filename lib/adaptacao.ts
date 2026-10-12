import { SUGESTAO_PROTOCOLO_PADRAO } from "./calculations";

export const DIAS_POR_FASE = 3;
export const TOTAL_FASES = 5; // 5 fases x 3 dias = 15 dias de adaptação
export const HORARIOS_TRATO = ["07:00", "12:00", "17:00"] as const;

export type FaseCalculada = {
  numero: number;
  diaInicio: number;
  diaFim: number;
  pctRacao: number;
  pctVolumoso: number;
  racaoAnimalKg: number; // por animal, por dia
  volumosoAnimalKg: number;
  racaoLoteDiaKg: number;
  volumosoLoteDiaKg: number;
  racaoLoteTratoKg: number; // por trato (dia dividido pelos 3 tratos)
  volumosoLoteTratoKg: number;
};

/** Plano das 5 fases de adaptação, a partir do peso médio vivo e do nº de animais do lote. */
export function planoAdaptacao(pesoMedioKg: number, animais: number): FaseCalculada[] {
  return SUGESTAO_PROTOCOLO_PADRAO.slice(0, TOTAL_FASES).map((p, i) => {
    const racaoAnimalKg = pesoMedioKg * (p.pctRacao / 100);
    const volumosoAnimalKg = pesoMedioKg * (p.pctVolumoso / 100);
    const racaoLoteDiaKg = racaoAnimalKg * animais;
    const volumosoLoteDiaKg = volumosoAnimalKg * animais;
    return {
      numero: i + 1,
      diaInicio: i * DIAS_POR_FASE + 1,
      diaFim: (i + 1) * DIAS_POR_FASE,
      pctRacao: p.pctRacao,
      pctVolumoso: p.pctVolumoso,
      racaoAnimalKg,
      volumosoAnimalKg,
      racaoLoteDiaKg,
      volumosoLoteDiaKg,
      racaoLoteTratoKg: racaoLoteDiaKg / HORARIOS_TRATO.length,
      volumosoLoteTratoKg: volumosoLoteDiaKg / HORARIOS_TRATO.length,
    };
  });
}

/** Número da fase em que o lote está hoje (1 a 5), ou null se a adaptação já terminou. */
export function faseDeHoje(diaDeConfinamento: number): number | null {
  const dia = Math.max(1, diaDeConfinamento);
  if (dia > TOTAL_FASES * DIAS_POR_FASE) return null;
  return Math.ceil(dia / DIAS_POR_FASE);
}

export function fmtKg(valor: number, casas = 2): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}
