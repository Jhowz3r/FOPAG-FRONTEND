# FOPAG - Sistema de Folha de Pagamento

Sistema frontend web para gestão de folha de pagamento, desenvolvido com Next.js, React e TypeScript.

## Stack Tecnológica

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **React Hook Form + Zod**
- **Axios**
- **JWT Authentication**

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado na porta **3002** por padrão.

## Estrutura do Projeto

```
/app
  /login          - Tela de autenticação
  /dashboard      - Dashboard principal
    /cadastros    - Módulo de cadastros
      /empresas   - Cadastro de empresas
      /filiais    - Cadastro de filiais
      /eventos    - Cadastro de eventos
      /sindicatos - Cadastro de sindicatos
      /funcionarios - Cadastro de funcionários
    /calculos     - Módulo de cálculos
    /relatorios   - Módulo de relatórios
    /arquivos     - Módulo de arquivos
    /esocial      - Módulo eSocial
    /ajuda        - Ajuda do sistema
    /ferramentas  - Ferramentas auxiliares
```

## Configuração

1. Copie o arquivo `.env.local.example` para `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Edite o arquivo `.env.local` e configure a URL da API backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
```

**Importante**: 
- A URL deve incluir o prefixo `/api/v1` conforme configurado no backend.
- O frontend roda na porta **3002** e o backend deve estar na porta **3003** (ou ajuste conforme necessário).

## Pré-requisitos

- Node.js 18 ou superior
- Backend do FOPAG rodando e acessível (porta 3003 por padrão)

