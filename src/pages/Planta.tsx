import { useState, useEffect, useRef } from 'react'
import { TORRES, ANDARES } from '../config/building'
import { getResidents, addResident, deleteResident } from '../services/residents'
import { getComplaints } from '../services/complaints'
import { computeSuspects } from '../lib/analysis'
import type { Resident, Complaint } from '../types'

type AptNum = '01' | '02' | '03' | '04'
type ViewMode = 'andar' | 'geral'
type Filter = 'todos' | 'proprietario' | 'inquilino' | 'vazio'

interface ModalTarget { bloco: number; andar: number; apt: AptNum }

const APT_LAYOUT: AptNum[] = ['04', '02', '03', '01']

export default function Planta() {
  const [bloco, setBloco]   = useState(1)
  const [andar, setAndar]   = useState(1)
  const [view, setView]     = useState<ViewMode>('andar')
  const [filter, setFilter] = useState<Filter>('todos')
  const [residents, setResidents]   = useState<Resident[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  // Modal state
  const [modal, setModal]       = useState<ModalTarget | null>(null)
  const [mNome, setMNome]       = useState('')
  const [mWhatsapp, setMWhatsapp] = useState('')
  const [mTipo, setMTipo]       = useState<'proprietario' | 'inquilino'>('proprietario')
  const [mSaving, setMSaving]   = useState(false)
  const [mError, setMError]     = useState('')
  const mInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true); setError(false)
    try {
      const [r, c] = await Promise.all([getResidents(), getComplaints()])
      setResidents(r); setComplaints(c)
    } catch { setError(true) }
    finally { setLoading(false) }
  }

  // Multi-resident map
  const residentsByApt = new Map<string, Resident[]>()
  for (const r of residents) {
    const key = `${r.torre}-${r.andar}-${r.apt}`
    residentsByApt.set(key, [...(residentsByApt.get(key) ?? []), r])
  }

  const suspects   = computeSuspects(complaints)
  const suspectMap = new Map(suspects.map(s => [`${s.torre}-${s.andar}-${s.apt}`, s.count]))

  // ── Modal ─────────────────────────────────────────────────────
  function openModal(target: ModalTarget) {
    setModal(target)
    setMNome(''); setMWhatsapp(''); setMTipo('proprietario'); setMError('')
    setTimeout(() => mInputRef.current?.focus(), 50)
  }

  function closeModal() { setModal(null); setMError('') }

  async function handleModalSave(e: React.FormEvent) {
    e.preventDefault()
    if (!modal) return
    const existing = residentsByApt.get(`${modal.bloco}-${modal.andar}-${modal.apt}`) ?? []
    if (existing.length >= 2) { setMError('Máximo de 2 moradores por apartamento.'); return }
    setMSaving(true); setMError('')
    try {
      await addResident({
        torre: modal.bloco,
        andar: modal.andar,
        apt: modal.apt,
        nome: mNome.trim(),
        whatsapp: mWhatsapp.trim() || undefined,
        tipo: mTipo,
      })
      await loadData()
      setMNome(''); setMWhatsapp(''); setMTipo('proprietario')
      // keep modal open so user can see the result / add a second resident
    } catch { setMError('Erro ao salvar. Tente novamente.') }
    finally { setMSaving(false) }
  }

  async function handleModalDelete(id: string) {
    if (!window.confirm('Remover este morador?')) return
    try { await deleteResident(id); await loadData() }
    catch { setMError('Erro ao remover.') }
  }

  // Modal residents (updated after save)
  const modalResidents = modal
    ? (residentsByApt.get(`${modal.bloco}-${modal.andar}-${modal.apt}`) ?? [])
    : []
  const modalAptNum = modal ? `${modal.andar}${modal.apt}` : ''
  const modalFull   = modalResidents.length >= 2

  // ── Andar view ────────────────────────────────────────────────
  function DetailCard({ apt }: { apt: AptNum }) {
    const key     = `${bloco}-${andar}-${apt}`
    const list    = residentsByApt.get(key) ?? []
    const accused = suspectMap.get(key) ?? 0
    const aptNum  = `${andar}${apt}`
    const col = apt === '04' || apt === '02' ? 1 : 3
    const row = apt === '04' || apt === '03' ? 1 : 2

    return (
      <div
        className="fp-apt-card fp-apt-card--clickable"
        style={{ gridColumn: col, gridRow: row }}
        onClick={() => openModal({ bloco, andar, apt })}
        title="Clique para cadastrar morador"
      >
        <span className={`fp-apt-badge${list.length ? ' fp-apt-badge--ok' : ''}`}>{aptNum}</span>
        {list.length === 0 ? (
          <div className="fp-vacant">Vazio — clique para cadastrar</div>
        ) : (
          <>
            {list.map(r => {
              const initials = r.nome.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
              return (
                <div key={r.id} className="fp-resident">
                  <div className="fp-avatar">{initials}</div>
                  <div>
                    <div className="fp-resident-name">{r.nome}</div>
                    <div className="fp-resident-tipo">{r.tipo === 'inquilino' ? 'Inquilino' : 'Proprietário'}</div>
                  </div>
                </div>
              )
            })}
            {accused > 0 && (
              <div className="fp-accused">
                <div className="fp-accused-label">Reclamações</div>
                <div className="fp-accused-count">{accused}</div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ── Geral view ────────────────────────────────────────────────
  const blocoResidents = residents.filter(r => r.torre === bloco)
  const occupiedKeys   = new Set(blocoResidents.map(r => `${r.andar}-${r.apt}`))
  const totalApts      = ANDARES.length * 4
  const occupied       = occupiedKeys.size
  const vacant         = totalApts - occupied

  function aptClass(list: Resident[]): string {
    const isVacant = list.length === 0
    const hasProp  = list.some(r => r.tipo === 'proprietario')
    const hasInq   = list.some(r => r.tipo === 'inquilino')
    const dimmed   =
      (filter === 'vazio'        && !isVacant) ||
      (filter === 'proprietario' && !hasProp)  ||
      (filter === 'inquilino'    && !hasInq)
    let base = 'ov-cell ov-cell--clickable'
    if (isVacant)           base += ' ov-vacant'
    else if (hasProp && hasInq) base += ' ov-mixed'
    else if (hasProp)       base += ' ov-proprietario'
    else                    base += ' ov-inquilino'
    if (dimmed)             base += ' ov-dimmed'
    return base
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'todos',        label: 'Todos'         },
    { key: 'proprietario', label: 'Proprietários' },
    { key: 'inquilino',    label: 'Inquilinos'    },
    { key: 'vazio',        label: 'Vazios'        },
  ]

  return (
    <>
      {/* Controls */}
      <div className="card controls-bar">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Bloco</label>
          <select value={bloco} onChange={e => setBloco(Number(e.target.value))}>
            {TORRES.map(t => <option key={t} value={t}>Bloco {t}</option>)}
          </select>
        </div>
        {view === 'andar' && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Andar</label>
            <select value={andar} onChange={e => setAndar(Number(e.target.value))}>
              {ANDARES.map(a => <option key={a} value={a}>{a}º andar</option>)}
            </select>
          </div>
        )}
        <div className="view-toggle">
          <button className={`view-toggle-btn${view === 'andar' ? ' active' : ''}`} onClick={() => setView('andar')}>Andar</button>
          <button className={`view-toggle-btn${view === 'geral' ? ' active' : ''}`} onClick={() => setView('geral')}>Visão Geral</button>
        </div>
      </div>

      {error && <div className="alert alert-error">Erro ao carregar dados.</div>}

      {/* ── Andar view ── */}
      {view === 'andar' && (
        <section className="card section-card">
          <h2 className="fp-title">Bloco {bloco} — {andar}º Andar</h2>
          {loading ? <div className="spinner" /> : (
            <div className="fp-grid">
              <DetailCard apt="04" />
              <div className="fp-hall">Hall</div>
              <DetailCard apt="03" />
              <DetailCard apt="02" />
              <DetailCard apt="01" />
            </div>
          )}
        </section>
      )}

      {/* ── Visão Geral view ── */}
      {view === 'geral' && (
        <section className="card section-card">
          <div className="ov-header">
            <h2 className="fp-title" style={{ marginBottom: 0 }}>Bloco {bloco} — Visão Geral</h2>
            {!loading && (
              <div className="ov-stats">
                <span className="ov-stat ov-stat--ok">{occupied} ocupados</span>
                <span className="ov-stat ov-stat--vacant">{vacant} vazios</span>
                <span className="ov-stat">{totalApts} total</span>
              </div>
            )}
          </div>
          <div className="ov-legend">
            <span className="ov-legend-dot ov-proprietario" />Proprietário
            <span className="ov-legend-dot ov-inquilino" />Inquilino
            <span className="ov-legend-dot ov-mixed" />Ambos
            <span className="ov-legend-dot ov-vacant" />Vazio
          </div>
          <div className="ov-filters">
            {FILTERS.map(f => (
              <button key={f.key} className={`tab-btn${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
            ))}
          </div>
          {loading ? <div className="spinner" /> : (
            <div className="ov-grid">
              <div className="ov-row ov-header-row">
                <div className="ov-floor-label" />
                <div className="ov-col-label">04</div>
                <div className="ov-col-label">02</div>
                <div className="ov-shaft-label">Hall</div>
                <div className="ov-col-label">03</div>
                <div className="ov-col-label">01</div>
              </div>
              {[...ANDARES].reverse().map(a => (
                <div key={a} className="ov-row">
                  <div className="ov-floor-label">{a}º</div>
                  {APT_LAYOUT.map((apt, i) => {
                    const key  = `${bloco}-${a}-${apt}`
                    const list = residentsByApt.get(key) ?? []
                    return (
                      <>
                        {i === 2 && <div key="shaft" className="ov-shaft" />}
                        <div
                          key={apt}
                          className={aptClass(list)}
                          title={list.map(r => r.nome).join(' · ') || 'Vazio — clique para cadastrar'}
                          onClick={() => openModal({ bloco, andar: a, apt })}
                        >
                          <span className="ov-apt-num">{a}{apt}</span>
                          {list.length === 0
                            ? <span className="ov-apt-name ov-apt-name--vacant">Vazio</span>
                            : list.map(r => <span key={r.id} className="ov-apt-name">{r.nome.split(' ')[0]}</span>)
                          }
                        </div>
                      </>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Modal de cadastro rápido ── */}
      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Bloco {modal.bloco} — Apt {modalAptNum}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {/* Moradores existentes */}
            {modalResidents.length > 0 && (
              <div className="modal-current">
                {modalResidents.map(r => (
                  <div key={r.id} className="modal-resident-row">
                    <div className="fp-avatar" style={{ width: 32, height: 32, fontSize: '.8rem' }}>
                      {r.nome.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="fp-resident-name" style={{ fontSize: '.9rem' }}>{r.nome}</div>
                      <div className="fp-resident-tipo">{r.tipo === 'inquilino' ? 'Inquilino' : 'Proprietário'}</div>
                    </div>
                    <button className="btn-icon btn-danger" onClick={() => handleModalDelete(r.id!)} title="Remover">🗑️</button>
                  </div>
                ))}
              </div>
            )}

            {modalFull ? (
              <p className="modal-full-msg">Apartamento com 2 moradores cadastrados.</p>
            ) : (
              <form onSubmit={handleModalSave} className="modal-form">
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    ref={mInputRef}
                    type="text"
                    value={mNome}
                    onChange={e => setMNome(e.target.value)}
                    placeholder="Nome do morador"
                    maxLength={120}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>WhatsApp <span className="optional">(opcional)</span></label>
                    <input
                      type="tel"
                      value={mWhatsapp}
                      onChange={e => setMWhatsapp(e.target.value)}
                      placeholder="(11) 99999-9999"
                      maxLength={20}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vínculo</label>
                    <select value={mTipo} onChange={e => setMTipo(e.target.value as typeof mTipo)}>
                      <option value="proprietario">Proprietário</option>
                      <option value="inquilino">Inquilino</option>
                    </select>
                  </div>
                </div>
                {mError && <div className="alert alert-error">{mError}</div>}
                <button type="submit" className="btn-primary" disabled={mSaving} style={{ width: '100%' }}>
                  {mSaving ? 'Salvando…' : 'Cadastrar morador'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
