# Mosaic 1001 Albums 🎵

> Um rastreador de hábitos visual e interativo para o desafio **"1001 Albums You Must Hear Before You Die"**, integrado à API pública do [1001 Albums Generator](https://1001albumsgenerator.com).

---

## 🎨 O Conceito

O **Mosaic 1001** transforma a jornada de escuta dos 1.001 álbuns em uma experiência visual gamificada:

- **Mosaico Preto & Branco:** Todos os álbuns da lista iniciam em escala de cinza (grayscale).
- **Explosão de Cores:** Ao ouvir e registrar um álbum, o card ganha vida em cores completas, acompanhado de sua nota (estrelas), data de escuta e comentário.
- **Zero Login:** Não requer criação de conta nem senhas. Toda a sincronização se apoia no *slug* público do seu projeto no gerador e no armazenamento local (`localStorage`).

---

## ✨ Funcionalidades Implementadas

### 1. Álbum do Dia em Destaque (`TodayHero`)
- Apresenta o álbum do dia fornecido pela API com capa em alta resolução, ano de lançamento e gêneros musicais.
- **Avaliação Rápida:** Atribuição de notas de 1 a 5 estrelas diretamente pela interface.
- **Deep Link do Spotify:** Atalho de um clique para abrir e reproduzir o álbum no Spotify.
- **Link Oficial:** Atalho direto para a página do seu projeto no *1001 Albums Generator* para submeter avaliações oficiais.

### 2. Contador Regressivo em Tempo Real (`NextAlbumCountdown`)
- Temporizador regressivo indicando o tempo exato restante até o lançamento do próximo álbum (com base na data retornada pela API ou à meia-noite).
- Atualização e recarregamento automático dos dados quando o contador chega a zero.

### 3. Mosaico Completo de Álbuns (`AlbumCard` & Grade)
- Catálogo completo com **1.101 álbuns** catalogados cronologicamente.
- Transições de cores fluidas com Tailwind CSS.
- Exibição de nota (1 a 5 estrelas), data de geração/conclusão e notas/resenhas gravadas.
- Possibilidade de marcar/desmarcar álbuns manualmente direto pelo mosaico.

### 4. Filtros, Busca & Ordenação
- **Busca em tempo real:** Pesquisa instantânea por título do álbum ou nome do artista.
- **Filtros rápidos:** Visualização entre *Todos*, *Pendentes* e *Ouvidos*.
- **Ordenação cronológica:** No filtro de álbuns ouvidos, é possível alternar entre ordem histórica crescente (do primeiro ouvido em diante) e decrescente (mais recentes primeiro).
- **Barra de Progresso:** Indicador visual de percentual e quantidade total de álbuns concluídos.

### 5. Arquitetura de Proxy & Produção
- Configuração de proxy reverso no **Vite** (desenvolvimento) e no **Nginx** (produção) em `/api-1001/` para integração transparente com a API oficial sem problemas de CORS.
- **Dockerfile Multi-Stage:** Compilação do app estático em Node 22 Alpine e entrega de alta performance via Nginx Alpine com regras de cache agressivo para imagens e assets.
- **Docker Compose:** Orquestração pronta para implantação em servidores (ex: Oracle Cloud, VPS) conectando-se a redes existentes (como Cloudflare ou Caddy/Traefik).

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Frontend** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Biblioteca de interfaces com tipagem estática rigorosa |
| **Build & Dev** | [Vite 8](https://vitejs.dev/) | Ferramenta de build ultrarrápida com Hot Module Replacement |
| **Estilização** | [Tailwind CSS v4](https://tailwindcss.com/) | Framework de CSS utilitário para animações e design responsivo |
| **Servidor Web** | [Nginx](https://nginx.org/) | Servidor web e proxy reverso para assets estáticos e API |
| **Contêineres** | [Docker](https://www.docker.com/) & Docker Compose | Ambientes reproduzíveis e prontos para produção |

---

## 📁 Estrutura do Projeto

```text
mosaic-1001/
├── frontend/
│   ├── public/                 # Favicon e ícones estáticos
│   ├── scripts/
│   │   └── fetch-albums.mjs    # Script de ingestão da base de 1.101 álbuns via API
│   ├── src/
│   │   ├── assets/             # Imagens e vetores
│   │   ├── components/         # Componentes modulares
│   │   │   ├── AlbumCard.tsx           # Card individual com efeito P&B/Cor e Spotify
│   │   │   ├── NextAlbumCountdown.tsx  # Temporizador regressivo para o próximo álbum
│   │   │   └── TodayHero.tsx           # Destaque do álbum de hoje com avaliação rápida
│   │   ├── data/
│   │   │   └── albums.json     # Catálogo completo indexado com metadados
│   │   ├── types/              # Interfaces TypeScript (álbum, histórico, API)
│   │   ├── App.tsx             # Estado principal, filtros, busca e persistência
│   │   ├── index.css           # Entrada de estilos Tailwind v4
│   │   └── main.tsx            # Ponto de montagem da aplicação React
│   ├── Dockerfile              # Build multi-stage (Node Alpine -> Nginx Alpine)
│   ├── nginx.conf              # Configuração Nginx com proxy reverso /api-1001/
│   ├── CaddyFile               # Configuração alternativa pronta para uso com Caddy
│   └── vite.config.ts          # Configuração do Vite com proxy de desenvolvimento
├── docker-compose.yml          # Definição do serviço Docker para produção
├── PROJECT_SPEC.md             # Especificação e arquitetura original do projeto
└── README.md                   # Documentação do projeto
```

---

## 🚀 Como Executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- Gerenciador de pacotes `npm`.
- *(Opcional)* [Docker](https://www.docker.com/) e Docker Compose para execução conteinerizada.

---

### Modo Desenvolvimento

1. Entre no diretório do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse no navegador:
   ```text
   http://localhost:5173
   ```

*(Opcional)* Para atualizar ou reprocessar o catálogo de álbuns diretamente da API oficial:
```bash
node scripts/fetch-albums.mjs
```

---

### Modo Produção com Docker

1. Crie a rede externa no Docker (caso ainda não exista):
   ```bash
   docker network create web_network
   ```

2. Suba o contêiner:
   ```bash
   docker compose up -d --build
   ```

3. A aplicação estará ativa e servindo os arquivos estáticos e o proxy na porta `80`.

---

## 🗺️ Roadmap & Próximos Passos

De acordo com o planejamento traçado no [PROJECT_SPEC.md](PROJECT_SPEC.md):

- [x] **Stage 1 (Frontend):** Aplicação React + Vite + Tailwind com catálogo completo e integração com API do projeto.
- [x] **Deploy & Containerização:** Dockerfile otimizado e proxy Nginx.
- [ ] **Stage 1 (Backend & Widget API):** Servidor dedicado Node.js com SQLite (`better-sqlite3`) expondo o endpoint minimalista `GET /api/project/:slug/widget`.
- [ ] **Stage 2 (Android App):** Empacotamento híbrido com Capacitor.
- [ ] **Stage 2 (Home Screen Widget):** Widget nativo para Android utilizando Jetpack Glance consumindo a API minimalista do álbum do dia.
