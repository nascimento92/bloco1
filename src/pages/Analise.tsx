import { useState, useEffect, useCallback, Fragment } from 'react'
import { TORRES, ANDARES, APTS, aptLabel } from '../config/building'
import { getComplaints } from '../services/complaints'
import { getResidents } from '../services/residents'
import { computeSuspects, buildHeatmap } from '../lib/analysis'
import type { Complaint, Resident, Suspect } from '../types'

const MEDALS = ['🥇', '🥈', '🥉']

function heatColor(count: number, max: number): string {
  if (max === 0 || count === 0) return '#fff'
  const t = count / max
  // white → #c0407a
  const r = Math.round(255 + (192 - 255) * t)
  const g = Math.round(255 + (64  - 255) * t)
  const b = Math.round(255 + (122 - 255) * t)
  return `rgb(${r},${g},${b})`
}

export default function Analise() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [residents, setResidents]   = useState<Resident[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [weighted, setWeighted]     = useState(false)
  const [filterTorre, setFilterTorre] = useState<number | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [activeTorre, setActiveTorre] = useState<number>(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [c, r] = await Promise.all([getComplaints(), getResidents()])
      setComplaints(c)
      setResidents(r)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const residentMap = Object.fromEntries(
    residents.map(r => [`${r.torre}-${r.andar}-${r.apt}`, r.nome])
  )

  const filtered = filterTorre
    ? complaints.filter(c => c.torre === filterTorre)
    : complaints

  const suspects = computeSuspects(filtered, weighted)
  const heatmap  = buildHeatmap(suspects)

  const torreSuspects = suspects.filter(s => !filterTorre || s.torre === filterTorre)

  const maxForTorre = Math.max(
    0,
    ...Object.values(heatmap[activeTorre] ?? {}).flatMap(andObj =>
      Object.values(andObj as Record<string, number>)
    )
  )

  function aptKey(s: Suspect) { return `${s.torre}-${s.andar}-${s.apt}` }

  return (
    <>
      {/* Controls */}
      <div className="card controls-bar">
        <label className="toggle-label-inline">
          <input type="checkbox" checked={weighted} onChange={e => setWeighted(e.target.checked)} />
          Pontuação ponderada pela intensidade
        </label>
        <select value={filterTorre ?? ''} onChange={e => setFilterTorre(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Todos os blocos</option>
          {TORRES.map(t => <option key={t} value={t}>Bloco {t}</option>)}
        </select>
        <button className="btn-secondary" onClick={load} disabled={loading}>
          {loading ? '…' : '↻ Atualizar'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">Erro ao carregar dados. Verifique a conexão e tente novamente.</div>
      )}

      {/* Ranking */}
      <section className="card section-card">
        <h2>Ranking de Apartamentos Acusados</h2>
        {loading ? (
          <div className="spinner" />
        ) : torreSuspects.length === 0 ? (
          <p className="empty-state">Nenhuma reclamação registrada ainda.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Apartamento</th>
                  <th>Moradores</th>
                  <th>Reclamações</th>
                  <th>Pontuação</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {torreSuspects.map((s, i) => {
                  const key = aptKey(s)
                  const isExpanded = expandedRow === key
                  return (
                    <Fragment key={key}>
                      <tr className={i < 3 ? 'row-top' : ''}>
                        <td>{MEDALS[i] ?? i + 1}</td>
                        <td>{aptLabel(s.torre, s.andar, s.apt)}</td>
                        <td className="td-muted">{residentMap[key] ?? '—'}</td>
                        <td><strong>{s.count}</strong></td>
                        <td>{s.score}</td>
                        <td>
                          <button className="btn-icon" onClick={() => setExpandedRow(isExpanded ? null : key)} title="Detalhar">
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="row-detail">
                          <td colSpan={6}>
                            <ul className="source-list">
                              {s.sources.map((src, j) => (
                                <li key={j}>
                                  <strong>{src.reporter}</strong>
                                  {src.intensity != null && <span className="badge intensity-badge">{src.intensity}⭐</span>}
                                  {src.createdAt && (
                                    <span className="td-muted"> — {src.createdAt.toDate().toLocaleString('pt-BR')}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Heatmap */}
      <section className="card section-card">
        <h2>Mapa de Calor por Andar</h2>
        <div className="heatmap-tabs">
          {TORRES.map(t => (
            <button
              key={t}
              className={`tab-btn${activeTorre === t ? ' active' : ''}`}
              onClick={() => setActiveTorre(t)}
            >
              Bloco {t}
            </button>
          ))}
        </div>

        <div className="heatmap-legend">
          <span>Branco = sem acusações</span>
          <span>Rosa = mais acusações</span>
        </div>

        {/* Wing labels */}
        <div className="heatmap-wing-bar">
          <div className="heatmap-wing-label">← Ala esq.</div>
          <div className="heatmap-wing-label">Ala dir. →</div>
        </div>

        <div className="heatmap-grid">
          {/* Header: apt numbers in their real 2×2 positions */}
          <div className="hfg">
            <div className="hfl hcol">Andar</div>
            <div className="hap-04 hcol">04</div>
            <div className="hsh" />
            <div className="hap-03 hcol">03</div>
            <div className="hap-02 hcol">02</div>
            <div className="hap-01 hcol">01</div>
          </div>

          {/* Floor rows 15 → 2, each floor as a 2×2 grid */}
          {[...ANDARES].reverse().map(a => {
            const floorData = heatmap[activeTorre]?.[a] ?? {}
            const cell = (apt: '04' | '03' | '02' | '01', cls: string) => {
              const count = (floorData[apt] as number | undefined) ?? 0
              return (
                <div
                  className={`heatmap-apt ${cls}`}
                  style={{ backgroundColor: heatColor(count, maxForTorre) }}
                  title={`${aptLabel(activeTorre, a, apt)}: ${count} acusação(ões)`}
                >
                  {count > 0 ? count : ''}
                </div>
              )
            }
            return (
              <div key={a} className="hfg">
                <div className="hfl">{a}º</div>
                {cell('04', 'hap-04')}
                <div className="hsh">▲</div>
                {cell('03', 'hap-03')}
                {cell('02', 'hap-02')}
                {cell('01', 'hap-01')}
              </div>
            )
          })}
        </div>
      </section>

      {/* Complaint log */}
      <section className="card section-card">
        <h2>Histórico de Reclamações ({complaints.length})</h2>
        {loading ? <div className="spinner" /> : complaints.length === 0 ? (
          <p className="empty-state">Nenhuma reclamação ainda.</p>
        ) : (
          <ul className="complaint-log">
            {complaints.map(c => (
              <li key={c.id} className="complaint-log-item">
                <span className="log-reporter">Bloco {c.torre} / Apt {c.andar}{c.apt}</span>
                <span className="log-arrow">→</span>
                <span className={`log-direction dir-${c.direction}`}>
                  {{ cima: '⬆️ cima', baixo: '⬇️ baixo', lado: '↔️ lado' }[c.direction]}
                </span>
                {c.intensity && <span className="badge">{c.intensity}⭐</span>}
                {c.description && <span className="log-desc">{c.description}</span>}
                <span className="td-muted log-date">
                  {c.createdAt?.toDate().toLocaleString('pt-BR') ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
