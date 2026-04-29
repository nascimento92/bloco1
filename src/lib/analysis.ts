import { ADJACENCY, aptLabel } from '../config/building'
import type { AptNum } from '../config/building'
import type { Complaint, Suspect } from '../types'

function resolveSuspect(c: Complaint): { torre: number; andar: number; apt: string } | null {
  if (c.direction === 'cima') {
    if (c.andar >= 14) return null
    return { torre: c.torre, andar: c.andar + 1, apt: c.apt }
  }
  if (c.direction === 'baixo') {
    if (c.andar <= 1) return null
    return { torre: c.torre, andar: c.andar - 1, apt: c.apt }
  }
  // 'lado'
  return { torre: c.torre, andar: c.andar, apt: ADJACENCY[c.apt as AptNum] }
}

export function computeSuspects(complaints: Complaint[], weighted = false): Suspect[] {
  const map = new Map<string, Suspect>()

  for (const c of complaints) {
    const s = resolveSuspect(c)
    if (!s) continue

    const key = `${s.torre}-${s.andar}-${s.apt}`
    const existing = map.get(key)
    const entry: Suspect = existing ?? { ...s, count: 0, score: 0, sources: [] }
    entry.count += 1
    entry.score += c.intensity ?? 1
    entry.sources.push({
      reporter: aptLabel(c.torre, c.andar, c.apt),
      intensity: c.intensity,
      createdAt: c.createdAt,
    })
    map.set(key, entry)
  }

  const list = [...map.values()]
  if (weighted) {
    list.sort((a, b) => b.score - a.score || b.count - a.count)
  } else {
    list.sort((a, b) => b.count - a.count || b.score - a.score)
  }
  return list
}

export type HeatmapData = Record<number, Record<number, Record<string, number>>>

export function buildHeatmap(suspects: Suspect[]): HeatmapData {
  const map: HeatmapData = {}
  for (const s of suspects) {
    map[s.torre] ??= {}
    map[s.torre][s.andar] ??= {}
    map[s.torre][s.andar][s.apt] = s.count
  }
  return map
}
