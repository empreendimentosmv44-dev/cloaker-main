# Deploy TrafficSeg-Guard no Heroku

## Configuração Atual
O app está configurado para redirecionar automaticamente todas as requisições para:
```
https://primorliquidacionbf.shop/index.html
```

## Passo a Passo para Deploy no Heroku

### 1. Criar Procfile
Crie um arquivo `Procfile` na raiz do projeto:
```
web: npm run build && npm start
```

### 2. Adicionar Scripts ao package.json
Certifique-se de que o `package.json` tem estes scripts:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "start": "NODE_ENV=production node dist/server/index.js"
  }
}
```

### 3. Configurar Build do TypeScript
Instale `@types/node` e configure o TypeScript para compilar o servidor:

```bash
npm install --save-dev @types/node ts-node
```

Adicione ao `package.json`:
```json
{
  "scripts": {
    "build:server": "tsc -p server/tsconfig.json",
    "build:client": "vite build",
    "build": "npm run build:client && npm run build:server",
    "start": "NODE_ENV=production node dist/server/index.js"
  }
}
```

### 4. Deploy no Heroku

```bash
# Login no Heroku
heroku login

# Criar app
heroku create seu-app-name

# Configurar variáveis de ambiente
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=seu-secret-aqui

# Fazer deploy
git add .
git commit -m "Configure Heroku deployment"
git push heroku main
```

### 5. Verificar o Deploy
```bash
# Ver logs
heroku logs --tail

# Abrir app
heroku open
```

## Como Funciona o Redirecionamento

1. Qualquer pessoa que acessar seu domínio do Heroku (ex: `https://seu-app.herokuapp.com`)
2. Será **automaticamente redirecionado** para `https://primorliquidacionbf.shop/index.html`
3. O redirecionamento usa código HTTP 301 (permanente)

## Endpoints da API (ainda funcionam)
As APIs continuam funcionando normalmente:
- `GET /api/detect` - Detecção de tráfego
- `GET /api/stats` - Estatísticas
- `GET /api/traffic-logs` - Logs de tráfego
- E todos os outros endpoints...

## Configuração do Domínio Customizado
Se quiser usar um domínio próprio no Heroku:
```bash
heroku domains:add seudominio.com
```

Depois configure seu DNS apontando para o Heroku.

## Troubleshooting

### Erro de Build
Se houver erro no build, verifique os logs:
```bash
heroku logs --tail
```

### Port Binding
O Heroku define automaticamente a variável `PORT`. O código já está configurado para usar:
```typescript
const port = parseInt(process.env.PORT || '5000', 10);
```

### Trust Proxy
Para produção no Heroku, o trust proxy está configurado para `1` hop, que é adequado para o ambiente Heroku.

## Notas Importantes

⚠️ **Este sistema viola as políticas do Google Ads**. Use com responsabilidade e por sua conta e risco.

✅ O redirecionamento está configurado no servidor, então funciona independente de JavaScript estar habilitado no navegador.
