# Sistema de Autenticação - Backend IA Estudo

## Instalação e Configuração

### 1. Instalar Dependências

```bash
npm install bcryptjs @types/bcryptjs class-validator class-transformer @nestjs/jwt @nestjs/passport passport passport-jwt @types/passport-jwt
```

### 2. Configurar Variáveis de Ambiente

Crie ou atualize o arquivo `.env`:

```env
# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui

# Google AI
GOOGLE_API_KEY=sua_chave_api_google

# Supabase
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_supabase

# Porta do servidor
PORT=3000
```

### 3. Atualizar Banco de Dados (Supabase)

Execute o script `ADD_PASSWORD_COLUMN.sql` no Editor SQL do Supabase:

1. Acesse o painel do Supabase
2. Vá para "SQL Editor"
3. Cole e execute o conteúdo do arquivo `ADD_PASSWORD_COLUMN.sql`
4. Verifique se as colunas foram adicionadas corretamente

### 4. Executar o Projeto

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## Estrutura do Projeto

```
src/
├── auth/                    # Módulo de autenticação
│   ├── auth.controller.ts   # Controller de auth
│   ├── auth.service.ts      # Serviço de auth
│   ├── auth.module.ts       # Módulo de auth
│   └── jwt-auth.guard.ts    # Guard JWT
├── users/                   # Módulo de usuários
│   ├── dto/                 # DTOs de validação
│   │   ├── create-user.dto.ts
│   │   ├── login.dto.ts
│   │   └── update-user.dto.ts
│   ├── users.controller.ts  # Controller de usuários
│   ├── users.service.ts     # Serviço de usuários
│   └── users.module.ts      # Módulo de usuários
├── ia/                      # Módulo de IA (atualizado)
├── supabase/                # Módulo do Supabase
└── main.ts                  # Arquivo principal
```

## Funcionalidades Implementadas

### ✅ Autenticação Completa
- Registro com nome, email e senha
- Login com email e senha
- Tokens JWT válidos por 7 dias
- Hash de senha com bcrypt

### ✅ Validação de Dados
- Validação de email único
- Validação de senha (mínimo 6 caracteres)
- Validação de nome (mínimo 2 caracteres)
- Validação global com class-validator

### ✅ Sistema de Planos
- Plano gratuito: 10 requisições
- Plano premium: requisições ilimitadas
- Controle automático de limites
- Upgrade para premium

### ✅ Proteção de Endpoints
- Todos os endpoints de IA protegidos
- Todos os endpoints de usuários protegidos
- Verificação de limites antes de cada requisição
- Incremento automático do contador

### ✅ Migração Segura
- Script SQL para adicionar colunas sem quebrar estrutura
- Tratamento de usuários existentes
- Triggers automáticos para limites

## Testando o Sistema

Use o arquivo `teste_auth.http` para testar todos os endpoints:

1. **Registrar usuário**: `POST /auth/register`
2. **Fazer login**: `POST /auth/login`
3. **Usar IA**: `POST /chat` (com token)
4. **Verificar limites**: `GET /users/:id/limits`
5. **Fazer upgrade**: `POST /users/:id/upgrade`

## Fluxo de Uso

### 1. Registro
```bash
POST /auth/register
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

### 2. Login
```bash
POST /auth/login
{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

### 3. Usar Serviços
```bash
POST /chat
Authorization: Bearer seu_token
{
  "prompt": "Explique IA"
}
```

### 4. Verificar Limites
```bash
GET /users/seu_id/limits
Authorization: Bearer seu_token
```

## Tratamento de Erros

### Usuários Existentes
- Usuários criados antes da implementação precisam redefinir senha
- Erro específico: "Conta criada antes da implementação de senhas"

### Limites Atingidos
- Usuários gratuitos com 10 requisições recebem erro
- Erro: "Limite de requisições atingido. Faça upgrade para o plano premium."

### Validação
- Emails duplicados são rejeitados
- Senhas muito curtas são rejeitadas
- Tokens inválidos retornam 401

## Segurança

- ✅ Senhas hasheadas com bcrypt (12 rounds)
- ✅ Tokens JWT com expiração
- ✅ Validação de dados em todos os endpoints
- ✅ Controle de acesso baseado em autenticação
- ✅ Limites de requisições para usuários gratuitos
- ✅ Headers de segurança configurados

## Próximos Passos

1. **Implementar refresh tokens**
2. **Adicionar recuperação de senha**
3. **Implementar verificação de email**
4. **Adicionar logs de auditoria**
5. **Implementar rate limiting**
6. **Adicionar testes automatizados**

## Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências foram instaladas
2. Confirme se as variáveis de ambiente estão corretas
3. Execute o script SQL no Supabase
4. Teste com o arquivo `teste_auth.http` 