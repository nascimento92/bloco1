import { useState } from 'react'
import { TORRES, ANDARES, APTS } from '../config/building'
import type { AptNum } from '../config/building'
import { addComplaint } from '../services/complaints'
import DirectionPicker from '../components/DirectionPicker'
import IntensityPicker from '../components/IntensityPicker'

type Direction = 'cima' | 'baixo' | 'lado'
type Intensity = 1 | 2 | 3 | 4 | 5

export default function Reclamacao() {
  const [torre, setTorre] = useState<number>(1)
  const [andar, setAndar] = useState<number>(1)
  const [apt, setApt] = useState<AptNum>('01')
  const [direction, setDirection] = useState<Direction | null>(null)
  const [intensity, setIntensity] = useState<Intensity | null>(null)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const boundaryWarning =
    (andar === 1 && direction === 'baixo') ||
    (andar === 14 && direction === 'cima')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!direction) { setError('Selecione a direção do barulho.'); return }
    setError('')
    setSaving(true)
    try {
      await addComplaint({
        torre,
        andar,
        apt,
        direction,
        ...(intensity != null ? { intensity } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
      })
      setDone(true)
    } catch {
      setError('Erro ao enviar. Verifique a conexão e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setDirection(null)
    setIntensity(null)
    setDescription('')
    setError('')
    setDone(false)
  }

  if (done) {
    return (
      <div className="card section-card success-card">
        <div className="success-icon">✅</div>
        <h2>Reclamação registrada!</h2>
        <p>Obrigado. A administração recebeu seu registro e vai acompanhar.</p>
        <button className="btn-secondary" onClick={reset}>
          Registrar outra reclamação
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="intro">
        Seu registro é anônimo para outros moradores. A administração usa os dados para identificar padrões de barulho.
      </div>

      <form className="card section-card" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Seu apartamento</legend>
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
        </fieldset>

        <fieldset>
          <legend>De onde vem o barulho?</legend>
          <DirectionPicker value={direction} onChange={setDirection} />
          {boundaryWarning && (
            <div className="alert alert-warning">
              Não há apartamentos nessa direção, mas vamos registrar mesmo assim.
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend>Intensidade <span className="optional">(opcional)</span></legend>
          <IntensityPicker value={intensity} onChange={setIntensity} />
        </fieldset>

        <div className="form-group">
          <label>
            Descrição <span className="optional">(opcional)</span>
          </label>
          <textarea
            rows={3}
            maxLength={500}
            placeholder="Ex.: música alta, festa, reforma, latidos…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Enviando…' : 'Enviar reclamação'}
        </button>
      </form>
    </>
  )
}
