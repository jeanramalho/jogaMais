⚽ Joga+ (JogaMais)

Joga+ é uma aplicação web para criar e gerenciar campeonatos de futebol amador. A partir de uma conta de usuário é possível criar campeonatos, times, gerenciar jogadores, registrar partidas e eventos (gols, assistências), e a aplicação gera automaticamente classificação e artilharia.

> Projeto desenvolvido com foco em clareza, maintainability e experiência do usuário — ideal para quem quer um sistema simples e extensível para torneios locais.




---

🚀 Visão Geral

O Joga+ nasceu para resolver um problema real: gerenciar campeonatos manualmente dá muito trabalho. Com ele você consegue estruturar campeonatos (times, jogadores, partidas) e deixar que o sistema calcule classificações e artilharia automaticamente.

A interface é construída em React + TypeScript com Vite, enquanto os dados são armazenados/gerenciados via Supabase (instância Postgres + Auth). O projeto está preparado para deployment em plataformas como Vercel (há uma versão pública apontada no repositório).


---

🧰 Tecnologias e Ferramentas

React + TypeScript (Vite)

Supabase — autenticação, banco Postgres e storage

Tailwind CSS — utilitários CSS

Vite — bundler/dev server moderno

PL/pgSQL — funções/migrations (há scripts/migrations no repositório supabase)


> Fontes consultadas no repositório: estrutura src/, pasta supabase, tailwind.config.ts e arquivos de configuração do projeto. citeturn3view1turn3view2turn0view0




---

📦 Como rodar localmente

> Assumo que você tenha Node.js (versão recente LTS), npm (ou pnpm/yarn) e, opcionalmente, a CLI do Supabase instalada.



1. Clone o repositório

git clone https://github.com/jeanramalho/jogaMais.git
cd jogaMais

2. Instale dependências

npm install
# ou yarn
# yarn

3. Configure variáveis de ambiente

O repositório traz um arquivo de exemplo .env.exemple. Copie-o e preencha com suas credenciais do Supabase (URL e chave anônima) e outras variáveis necessárias:

cp .env.exemple .env
# edite .env com SUPABASE_URL e SUPABASE_ANON_KEY (ou as variáveis VITE_ conforme o projeto)

> Verifique a pasta supabase/ para ver migrations e comentários sobre o setup do banco. citeturn5view0turn3view2



4. Executar em modo desenvolvimento

npm run dev
# geralmente abre em http://localhost:5173 (Vite)

5. Build para produção

npm run build
npm run preview

> Se você usa Supabase localmente (CLI), rode o serviço antes de iniciar a aplicação ou configure a URL do banco apontando para sua instância.




---

🏗️ Arquitetura Técnica

Stack Principal

Frontend: React + TypeScript (Vite)
Styling: Tailwind CSS
Backend: Supabase (Postgres + Auth)
Deploy: Vercel / qualquer host estático + Supabase

Fluxo de Dados (resumido)

1. Usuário faz login/registro → Supabase Auth


2. Ações do usuário (criar campeonato, time, partida) → chamadas ao banco via SDK REST/Client


3. Ao criar partidas/registrar eventos → registros no banco que disparam cálculos (ranking/arti lharia)


4. Interface consome dados atualizados e renderiza classificação/estatísticas




---

💡 Decisões Técnicas (racional)

Supabase: entrega autenticação pronta, CRUD direto no Postgres e facilita o desenvolvimento sem precisar de um backend customizado inicialmente.

TypeScript + Vite: produtividade e velocidade de desenvolvimento com tipagem estática e HMR rápido.

Tailwind: velocidade na construção de layouts reutilizáveis e coerentes.



---

📡 Funcionalidades (principais)

Autenticação de usuários (registro/login)

Criar/editar/excluir campeonatos

Criar/editar/excluir times

Gerenciar jogadores por time

Criar partidas e registrar eventos (gols, assistências, cartões)

Cálculo automático de tabela de classificação (pontos, saldo, etc.)

Ranking de artilharia (top scorers) calculado automaticamente

Layout responsivo (desktop/mobile)


> Essas funcionalidades estão alinhadas com a descrição do projeto e com a estrutura do código no diretório src/. citeturn3view1




---

🎯 Fluxo de Uso (exemplo rápido)

1. Cadastre-se e faça login.


2. Crie um campeonato (nome, regras básicas).


3. Adicione os times participantes e cadastre os jogadores.


4. Programe as partidas do campeonato.


5. Durante/apos a partida, registre eventos (gols/assistências).


6. Confira a classificação atualizada e a lista de artilheiros.




---

🔧 Estrutura do Projeto (visão geral)

jogaMais/
├─ src/                 # Código React + rotas/components/pages
├─ supabase/            # Migrations, functions e config do supabase
├─ .env.exemple         # Exemplo de variáveis de ambiente
├─ package.json
├─ vite.config.ts
├─ tailwind.config.ts
└─ README.md


---

🛡️ Segurança

Nunca comite chaves (SUPABASE_ANON_KEY, SERVICE_ROLE_KEY) no repositório.

Em produção, prefira server-side (funções/proxy) para executar operações sensíveis que usem SERVICE_ROLE_KEY.

Revise regras RLS (Row Level Security) no Supabase para garantir que apenas usuários autorizados leem/gravam os dados apropriados.



---

🔁 Deploy

O projeto pode ser deployado facilmente no Vercel (front) apontando as variáveis de ambiente para a instância do Supabase.

Há um preview público indicado no repositório que serve como referência de deployment. citeturn0view0



---

🧭 Próximos passos / Sugestões de evolução

Implementar websockets/realtime para atualizar placares e eventos em tempo real.

Painel admin com permissões mais granulares.

Exportar classificações/estatísticas como CSV/PDF.

Testes automatizados (unit + e2e).

Suporte a regras configuráveis por campeonato (pontuação por vitória/empate, desempate por critérios personalizados).



---

💼 Sobre o autor

Desenvolvido por Jean Ramalho — contato: jeanramalho.dev@gmail.com.


---

📚 Referências (do repositório)

Repositório: jeanramalho/jogaMais (análise dos diretórios src/, supabase/, arquivos de configuração). citeturn0view0turn3view1turn3view2



---

> Se quiser, eu já adapto esse README para um README.md pronto para commitar (com badges, screenshots e instruções de CI/CD). Quer que eu gere a versão finalizada para commit?