# CSI606-2021-02 - Remoto - Trabalho Final

**Discente:** Ana Cristina Pousa Machado

---

## Resumo

O Arena Cypher Management é um sistema web full-stack voltado para a organização de batalhas de rima freestyle. A aplicação permite cadastrar MCs, criar eventos com definição de confrontos, registrar resultados e acompanhar rankings ao longo do tempo.

O frontend foi desenvolvido com React e TypeScript, enquanto o backend utiliza Supabase, com PostgreSQL e Edge Functions. O sistema conta com autenticação de usuários, operações completas de CRUD para as principais entidades e controle de acesso por meio de Row Level Security, garantindo que cada usuário visualize apenas seus próprios dados.

A interface foi construída com Tailwind CSS, adotando tons de vermelho sobre fundo escuro para remeter à estética da cultura hip-hop.

De forma geral, o sistema oferece aos organizadores uma maneira prática de estruturar suas batalhas, registrar estatísticas e manter um histórico organizado de confrontos e resultados, com armazenamento seguro em banco de dados relacional.

---

## 1. Funcionalidades Implementadas

### Gestão de MCs (Participantes)
- **CRUD completo** de MCs com validação de formulários
- Cadastro de **nome artístico, vitórias, derrotas e empates**
- Cálculo automático do **total de batalhas**
- **Busca em tempo real** por nome
- **Edição e exclusão** individual de MCs
- Visualização em tabela responsiva

### Gestão de Batalhas
- **CRUD completo** de eventos/batalhas
- Cadastro de **nome, data, local** do evento
- **Definição de múltiplos confrontos** por batalha (adicionar/remover dinamicamente)
- Seleção de MCs participantes para cada confronto
- **Busca em tempo real** por nome da batalha ou local
- Visualização em grid de cards responsivos

### Resultados e Acompanhamento
- **Registro de vencedores** para cada confronto
- Atualização automática de **status da batalha** (Agendada → Concluída)
- **Dashboard com estatísticas**:
  - Próximo evento agendado
  - Total de MCs cadastrados
  - Total de batalhas agendadas
- **Ranking dos Top 3 MCs** baseado em número de vitórias
- **Listagem das 3 próximas batalhas** ordenadas por data

### Autenticação e Segurança
- Sistema de **login e cadastro de usuários**
- Autenticação via **Supabase Auth (JWT)**
- **Row Level Security** no PostgreSQL
- **Isolamento completo de dados** entre usuários
- Logout funcional com limpeza de sessão

## 2. Funcionalidades Previstas e Não Implementadas

### Chaveamento Automático
- **Sorteio automático** de confrontos
- **Geração de estrutura de eliminação** (chaves de 8, 16, 32 MCs)
- **Visualização de bracket/chave** estilo torneio

### Progressão Automática
- **Avanço automático** do vencedor para próxima fase
- **Atualização dinâmica** da estrutura de chaveamento
- **Finalização automática** do torneio com campeão

### Funcionalidades da Proposta Original
- **Regras básicas** das competições (campo não implementado)
- **Cidade de origem** dos MCs (simplificado)
- **Status de atividade** dos MCs (não implementado)
- **Tela de Acompanhamento Público** dedicada

## 3. Outras Funcionalidades Implementadas

Além das funcionalidades previstas na proposta, foram implementadas:

### Persistência Robusta
- **Banco de dados PostgreSQL** com 4 tabelas relacionadas
- **Edge Functions** para API REST
- **8 endpoints** completos (GET, POST, DELETE)
- **Conversão automática** entre snake_case (backend) e camelCase (frontend)

### Melhorias de UX
- **Busca em tempo real** em todas as listagens
- **Modais** para criação/edição (melhor fluxo)
- **Cards informativos** com visual moderno
- **Formatação de datas** em português brasileiro
- **Status visual** diferenciado (Agendada em vermelho, Concluída em verde)

### Arquitetura
- **10 componentes React** organizados por responsabilidade
- **TypeScript** em todo o projeto
- **Centralização de estado** (Lifting State Up)
- **Framework Hono** para API
- **DELETE endpoints individuais** (otimização)

## 4. Principais Desafios e Dificuldades

Durante o desenvolvimento do projeto, surgiram alguns desafios importantes na integração dos sistemas.

Um dos primeiros foi conectar o React ao Supabase garantindo a persistência correta dos dados. Houve inconsistência entre o padrão snake_case do PostgreSQL (como total_battles) e o camelCase do JavaScript (totalBattles). 
Para resolver isso, foram criadas funções de conversão responsáveis por ajustar os formatos sempre que os dados eram enviados ou recebidos.

Outro ponto foi a estrutura das batalhas. No backend, os dados ficam normalizados na tabela battle_participants, mas no frontend é mais simples trabalhar com um array de confrontos. 
Foi necessário criar uma lógica que reconstrói esses confrontos para exibição e depois converte novamente para o formato normalizado ao salvar.

A segurança também exigiu ajustes. Para garantir que cada usuário acessasse apenas seus próprios dados sem validações manuais em cada endpoint, foi utilizado o Row Level Security (RLS) do PostgreSQL. 
Assim, o próprio banco filtra automaticamente os registros conforme o usuário autenticado.

Por fim, a lógica de exclusão foi refatorada. Antes, ao deletar um MC ou batalha, todo o array era manipulado no frontend e salvo novamente no banco, o que era ineficiente. 
A solução foi implementar endpoints DELETE específicos (como /mcs/:id), tornando o processo mais rápido e alinhado aos padrões REST.

## 5. Instruções para Instalação e Execução

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Git

### Passo 1: Clone o Repositório
```bash
git clone https://github.com/anapousa/CSI606-Sistemas-Web.git
cd arena-cypher-management
```

### Passo 2: Instale as Dependências
```bash
npm install
```

### Passo 3: Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
3. Preencha as variáveis de ambiente no `.env`:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_SUPABASE_PROJECT_ID=seu_project_id
```

### Passo 4: Configure o Banco de Dados

Execute o schema SQL no Supabase SQL Editor:
```bash
# O arquivo está em: database-schema.sql
```

Ou via CLI do Supabase:
```bash
supabase db push
```

### Passo 5: Deploy das Edge Functions

```bash
supabase functions deploy make-server-[id]
```

### Passo 6: Execute o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### Primeiro Acesso

1. Clique em "Criar conta"
2. Cadastre-se com email e senha
3. Faça login

## 6. Referências

### Tecnologias Utilizadas
- **React 18** - [https://react.dev](https://react.dev)
- **TypeScript** - [https://www.typescriptlang.org](https://www.typescriptlang.org)
- **Tailwind CSS v4** - [https://tailwindcss.com](https://tailwindcss.com)
- **Supabase** - [https://supabase.com](https://supabase.com)
- **PostgreSQL** - [https://www.postgresql.org](https://www.postgresql.org)
- **Hono Framework** - [https://hono.dev](https://hono.dev)
- **Lucide React** - [https://lucide.dev](https://lucide.dev)

### Documentações Consultadas
- **Supabase Authentication** - [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
- **Row Level Security** - [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)
- **Edge Functions** - [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **React Hooks** - [https://react.dev/reference/react](https://react.dev/reference/react)
- **TypeScript Handbook** - [https://www.typescriptlang.org/docs/handbook/intro.html](https://www.typescriptlang.org/docs/handbook/intro.html)
