# Bloco 1 — Portal Quinta das Sapucaias

Aplicação web para gestão de moradores e reclamações de barulho do condomínio **Portal Quinta das Sapucaias** (Blocos 1 a 6, 1º ao 14º andar).

🔗 **[Acesse a aplicação](https://nascimento92.github.io/bloco1/)**

---

## Funcionalidades

### Público (sem login)
- **Regras de convivência** — exibição das normas do condomínio com acordeão por categoria
- **Registrar barulho** — formulário anônimo para reportar ruídos, com direção (cima / baixo / lado) e intensidade opcional

### Admin (acesso por PIN)
- **Moradores** — cadastro com nome, WhatsApp e vínculo (proprietário / inquilino); suporte a 2 moradores por apartamento; edição inline; filtros por bloco, andar, vínculo e nome; paginação
- **Análise** — ranking de apartamentos mais reclamados, mapa de calor por andar e histórico de ocorrências
- **Planta** — visualização do pavimento com cards por apartamento; cadastro rápido via modal ao clicar no apt; visão geral do bloco com filtro por ocupação e legenda de cores

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Banco de dados | Firebase Firestore |
| Deploy | GitHub Pages via GitHub Actions |

---

## Estrutura do projeto

```
src/
├── config/
│   ├── building.ts      # Torres, andares, finais e adjacência física
│   └── firebase.ts      # Inicialização do Firebase
├── services/
│   ├── complaints.ts    # CRUD de reclamações
│   └── residents.ts     # CRUD de moradores
├── lib/
│   └── analysis.ts      # Cálculo de suspeitos e heatmap
├── pages/
│   ├── Home.tsx         # Regras de convivência
│   ├── Reclamacao.tsx   # Formulário público de barulho
│   ├── AdminLogin.tsx   # Autenticação por PIN
│   ├── Moradores.tsx    # Gestão de moradores
│   ├── Analise.tsx      # Análise de reclamações
│   └── Planta.tsx       # Visualização do bloco
├── components/
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   ├── DirectionPicker.tsx
│   └── IntensityPicker.tsx
└── types/index.ts
```

---

## Configuração local

### Pré-requisitos
- Node.js 20+
- Projeto no [Firebase Console](https://console.firebase.google.com/) com Firestore habilitado

### Variáveis de ambiente

Crie `.env.local` na raiz com as credenciais do seu projeto Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ADMIN_PIN=1234
```

### Rodando localmente

```bash
npm install
npm run dev
```

### Build de produção

```bash
npm run build
```

---

## Deploy

O deploy é automático via GitHub Actions a cada push na branch `main`. O workflow:

1. Instala as dependências
2. Executa `npm run build`
3. Publica o conteúdo de `dist/` no GitHub Pages

Para configurar pela primeira vez: **Settings → Pages → Source → GitHub Actions**.

---

## Layout do pavimento

Cada andar segue a planta baixa das Torres 4, 5 e 6:

```
┌─────────┬──────┬─────────┐
│   04    │      │   03    │
│         │ Hall │         │
│   02    │      │   01    │
└─────────┴──────┴─────────┘
```

- **Ala esquerda:** finais 04 (frente) e 02 (fundos)
- **Ala direita:** finais 03 (frente) e 01 (fundos)
- Apartamento = andar + final (ex: 5º andar, final 02 → **Apt 502**)
