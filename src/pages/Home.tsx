import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const WA_LINK = 'https://chat.whatsapp.com/DwyIlkv7mAA2RT1RM7A9uU?mode=gi_t'

interface Section {
  id: string
  label: string
  rules: { icon: string; title: string; body: string }[]
}

const SECTIONS: Section[] = [
  {
    id: 'silencio',
    label: '🔇 Silêncio & Horários',
    rules: [
      { icon: '🌙', title: 'Horário de silêncio', body: 'Das 22h às 8h é período de silêncio. Evite barulhos altos, festas e reformas nesse intervalo.' },
      { icon: '🔨', title: 'Reformas e obras',    body: 'Obras são permitidas de segunda a sexta, das 8h às 18h, e sábados das 8h às 13h. Proibidas aos domingos e feriados.' },
      { icon: '🎵', title: 'Música e TV',         body: 'Mantenha o volume em nível moderado. Lembre-se que o som se propaga facilmente pelas paredes e lajes.' },
    ],
  },
  {
    id: 'limpeza',
    label: '🗑️ Limpeza & Descarte',
    rules: [
      { icon: '♻️', title: 'Coleta seletiva', body: 'Separe recicláveis do lixo orgânico. Utilize os coletores identificados no térreo.' },
      { icon: '🛗', title: 'Áreas comuns',    body: 'Mantenha corredores, escadas e hall limpos. Não deixe objetos bloqueando a circulação.' },
      { icon: '🚬', title: 'Cigarro e bitucas', body: 'É proibido fumar nas áreas comuns fechadas. Descarte bitucas em locais apropriados, nunca no chão.' },
    ],
  },
  {
    id: 'animais',
    label: '🐾 Animais de Estimação',
    rules: [
      { icon: '🐕', title: 'Circulação no bloco', body: 'Animais devem circular no colo ou na guia pelas áreas comuns. Nunca soltos nos corredores ou elevadores.' },
      { icon: '💩', title: 'Dejetos', body: 'Recolha sempre os dejetos do seu animal nas áreas externas. Deixe o ambiente limpo para todos.' },
    ],
  },
  {
    id: 'garagem',
    label: '🚗 Garagem & Estacionamento',
    rules: [
      { icon: '🅿️', title: 'Vagas demarcadas', body: 'Utilize apenas a vaga de sua unidade. Não ocupe vagas alheias ou áreas de manobra.' },
      { icon: '🚦', title: 'Velocidade', body: 'Trafegue devagar na garagem. A segurança de crianças e pedestres depende da sua atenção.' },
    ],
  },
  {
    id: 'respeito',
    label: '🤝 Respeito Mútuo',
    rules: [
      { icon: '💬', title: 'Comunicação gentil', body: 'Em caso de desconforto, converse com o vizinho de forma respeitosa antes de escalar para a administração.' },
      { icon: '🌿', title: 'Janelas', body: 'Não sacuda tapetes, jogue água ou outros itens para fora.' },
    ],
  },
]

export default function Home() {
  const [open, setOpen] = useState<Record<string, boolean>>({})

  function toggle(id: string) {
    setOpen(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>
      <div className="intro">
        Prezados vizinhos, estas regras foram criadas de forma colaborativa para que todos possamos desfrutar de um ambiente
        tranquilo, seguro e agradável. O respeito mútuo é a base de uma boa convivência. Conte sempre com a cooperação de todos!
      </div>

      {SECTIONS.map(sec => (
        <div key={sec.id} className={`section${open[sec.id] ? ' open' : ''}`}>
          <button
            className="section-toggle"
            aria-expanded={!!open[sec.id]}
            onClick={() => toggle(sec.id)}
          >
            <span className="toggle-label">{sec.label}</span>
            <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className="section-body">
            <div className="section-body-inner">
              <div className="rules-grid">
                {sec.rules.map(r => (
                  <div key={r.title} className="rule-card">
                    <span className="icon">{r.icon}</span>
                    <div>
                      <h3>{r.title}</h3>
                      <p>{r.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="whatsapp-section">
        <h2>📲 Entre no Grupo do WhatsApp</h2>
        <p>Fique por dentro dos avisos, combine mutirões e fortaleça a comunidade do Bloco 1.</p>
        <div id="qrcode">
          <QRCodeSVG value={WA_LINK} size={200} fgColor="#128c7e" bgColor="#ffffff" level="H" />
        </div>
        <br />
        <a className="wa-btn" href={WA_LINK} target="_blank" rel="noopener noreferrer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Entrar no grupo
        </a>
      </div>
    </>
  )
}
