export const TORRES = [1, 2, 3, 4, 5, 6] as const
export const ANDARES = Array.from({ length: 14 }, (_, i) => i + 1) // 1º ao 14º andar
export const APTS = ['01', '02', '03', '04'] as const

export type AptNum = (typeof APTS)[number]

// Physical layout per floor:  [04][02] | hallway | [03][01]
export const ADJACENCY: Record<AptNum, AptNum> = {
  '01': '03',
  '03': '01',
  '02': '04',
  '04': '02',
}

// e.g. floor 5, final '02' → "Bloco 4 / Apt 502"
export const aptLabel = (torre: number, andar: number, apt: string) =>
  `Bloco ${torre} / Apt ${andar}${apt}`
