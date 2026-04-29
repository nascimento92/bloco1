import { useState, useEffect, useRef } from 'react'
import { TORRES, ANDARES, APTS } from '../config/building'
import type { AptNum } from '../config/building'
import { addResident, getResidents, updateResident, deleteResident } from '../services/residents'
import type { Resident } from '../types'

const PAGE_SIZE = 10

function emptyForm() {
  return { torre: 1, andar: 1, apt: '01' as AptNum, nome: '', whatsapp: '', tipo: 'proprietario' as const }
}

export default function Moradores() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [status, setStatus]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [page, setPage]           = useState(0)

  const [filterNome,  setFilterNome]  = useState('')
  const [filterBloco, setFilterBloco] = useState<number | ''>('')
  const [filterAndar, setFilterAndar] = useState<number | ''>('')
  const [filterTipo,  setFilterTipo]  = useState<'' | 'proprietario' | 'inquilino'>('')

  const [torre,    setTorre]    = useState(1)
  const [andar,    setAndar]    = useState(1)
  const [apt,      setApt]      = useState<AptNum>('01')
  const [nome,     setNome]     = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [tipo,     setTipo]     = useState<'proprietario' | 'inquilino'>('proprietario')

  const formRef = useRef<HTMLElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setResidents(await getResidents()) }
    catch { setStatus({ type: 'error', msg: 'Erro ao carregar moradores.' }) }
    finally { setLoading(false) }
  }

  function resetForm() {
    const d = emptyForm()
    setTorre(d.torre); setAndar(d.andar); setApt(d.apt)
    setNome(d.nome); setWhatsapp(d.whatsapp); setTipo(d.tipo)
    setEditingId(null); setStatus(null)
  }

  function startEdit(r: Resident) {
    setTorre(r.torre); setAndar(r.andar); setApt(r.apt as AptNum)
    setNome(r.nome); setWhatsapp(r.whatsapp ?? ''); setTipo(r.tipo)
    setEditingId(r.id!); setStatus(null)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)

    const siblings = residents.filter(
      r => r.torre === torre && r.andar === andar && r.apt === apt && r.id !== editingId
    )
    if (siblings.length >= 2) {
      setStatus({ type: 'error', msg: 'Este apartamento já possui 2 moradores cadastrados.' })
      return
    }

    const data = { torre, andar, apt, nome: nome.trim(), whatsapp: whatsapp.trim() || undefined, tipo }
    setSaving(true)
    try {
      if (editingId) {
        await updateResident(editingId, data)
        setStatus({ type: 'success', msg: 'Morador atualizado com sucesso!' })
      } else {
        await addResident(data)
        setStatus({ type: 'success', msg: 'Morador cadastrado com sucesso!' })
      }
      resetForm()
      await load()
    } catch {
      setStatus({ type: 'error', msg: 'Erro ao salvar. Verifique a conexão e tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(r: Resident) {
    if (!window.confirm(`Remover ${r.nome} (Bloco ${r.torre} / Apt ${r.andar}${r.apt})?`)) return
    if (editingId === r.id) resetForm()
    try {
      await deleteResident(r.id!)
      setResidents(prev => prev.filter(x => x.id !== r.id))
    } catch {
      setStatus({ type: 'error', msg: 'Erro ao remover morador.' })
    }
  }

  const filtered = residents.filter(r =>
    (!filterNome  || r.nome.toLowerCase().includes(filterNome.toLowerCase())) &&
    (!filterBloco || r.torre === filterBloco) &&
    (!filterAndar || r.andar === filterAndar) &&
    (!filterTipo  || r.tipo === filterTipo)
  )

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function applyFilter(fn: () => void) { fn(); setPage(0) }

  const hasFilter = filterNome !== '' || filterBloco !== '' || filterAndar !== '' || filterTipo !== ''
  function clearFilters() { setFilterNome(''); setFilterBloco(''); setFilterAndar(''); setFilterTipo(''); setPage(0) }

  return (
    <>
      <section className="card section-card" ref={formRef}>
        <h2>{editingId ? 'Editar Morador' : 'Cadastrar Morador'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Bloco</label>
              <select value={torre} onChange={e => setTorre(Number(e.target.value))}>
                {TORRES.map(t => <option key={t} value={t}>Bloco {t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Andar</label>
              <select value={andar} onChange={e => setAndar(Number(e.target.value))}>
                {ANDARES.map(a => <option key={a} value={a}>{a}º andar</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Apartamento</label>
              <select value={apt} onChange={e => setApt(e.target.value as AptNum)}>
                {APTS.map(a => <option key={a} value={a}>Apt {andar}{a}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex.: João Silva"
              maxLength={120}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>WhatsApp <span className="optional">(opcional)</span></label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={20}
              />
            </div>
            <div className="form-group">
              <label>Vínculo</label>
              <select value={tipo} onChange={e => setTipo(e.target.value as 'proprietario' | 'inquilino')}>
                <option value="proprietario">Proprietário</option>
                <option value="inquilino">Inquilino</option>
              </select>
            </div>
          </div>
          {status && <div className={`alert alert-${status.type}`}>{status.msg}</div>}
          <div className="form-row" style={{ gap: '.5rem' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Cadastrar'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card section-card">
        <div className="section-header-row">
          <h2>Moradores Cadastrados {!loading && `(${hasFilter ? `${filtered.length} de ` : ''}${residents.length})`}</h2>
          {hasFilter && (
            <button className="btn-link" onClick={clearFilters}>Limpar filtros</button>
          )}
        </div>

        {!loading && residents.length > 0 && (
          <div className="filter-bar">
            <input
              className="filter-input"
              type="text"
              placeholder="Buscar por nome…"
              value={filterNome}
              onChange={e => applyFilter(() => setFilterNome(e.target.value))}
            />
            <select
              className="filter-select"
              value={filterBloco}
              onChange={e => applyFilter(() => setFilterBloco(e.target.value ? Number(e.target.value) : ''))}
            >
              <option value="">Todos os blocos</option>
              {TORRES.map(t => <option key={t} value={t}>Bloco {t}</option>)}
            </select>
            <select
              className="filter-select"
              value={filterAndar}
              onChange={e => applyFilter(() => setFilterAndar(e.target.value ? Number(e.target.value) : ''))}
            >
              <option value="">Todos os andares</option>
              {ANDARES.map(a => <option key={a} value={a}>{a}º andar</option>)}
            </select>
            <select
              className="filter-select"
              value={filterTipo}
              onChange={e => applyFilter(() => setFilterTipo(e.target.value as typeof filterTipo))}
            >
              <option value="">Todos os vínculos</option>
              <option value="proprietario">Proprietário</option>
              <option value="inquilino">Inquilino</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="spinner" />
        ) : residents.length === 0 ? (
          <p className="empty-state">Nenhum morador cadastrado ainda.</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">Nenhum morador encontrado com esses filtros.</p>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bloco</th>
                    <th>Apt</th>
                    <th>Nome</th>
                    <th>WhatsApp</th>
                    <th>Vínculo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(r => (
                    <tr key={r.id} className={editingId === r.id ? 'row-editing' : ''}>
                      <td>{r.torre}</td>
                      <td>{r.andar}{r.apt}</td>
                      <td>{r.nome}</td>
                      <td className="td-muted">{r.whatsapp || '—'}</td>
                      <td className="td-muted">{r.tipo === 'inquilino' ? 'Inquilino' : 'Proprietário'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn-icon" onClick={() => startEdit(r)} title="Editar">✏️</button>
                        <button className="btn-icon btn-danger" onClick={() => handleDelete(r)} title="Remover">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn-secondary pagination-btn"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                >
                  ← Anterior
                </button>
                <span className="pagination-info">
                  {page + 1} / {totalPages}
                </span>
                <button
                  className="btn-secondary pagination-btn"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
