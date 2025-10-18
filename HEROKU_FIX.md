# ✅ SOLUÇÃO PARA O ERRO "Application error" NO HEROKU

## 🔴 Problema Identificado
O Heroku estava falhando porque as ferramentas de build (vite, esbuild) estão em `devDependencies` e não são instaladas quando você usa `npm install --production`.

## ✅ Solução Aplicada

Criado arquivo `.npmrc` que força o Heroku a instalar TODAS as dependências (incluindo devDependencies) durante o build.

## 🚀 Como fazer o deploy agora:

### 1. Remover a configuração antiga (se você já tentou)
```bash
# Remover variável NODE_ENV se você configurou
heroku config:unset NPM_CONFIG_PRODUCTION

# Ver todas as variáveis
heroku config
```

### 2. Fazer commit das mudanças
```bash
git add .
git commit -m "Fix Heroku build with .npmrc"
```

### 3. Deploy no Heroku
```bash
git push heroku main
```

### 4. Verificar logs
```bash
heroku logs --tail
```

## 📌 O que deve acontecer agora:

1. ✅ Heroku instala TODAS as dependências (inclusive vite e esbuild)
2. ✅ Build funciona corretamente
3. ✅ App inicia na porta correta (Heroku define automaticamente)
4. ✅ Redirecionamento para primorliquidacionbf.shop funciona

## 🔧 Variáveis de Ambiente Necessárias

```bash
# Definir apenas estas variáveis (não defina PORT - Heroku faz isso)
heroku config:set SESSION_SECRET=$(openssl rand -hex 32)
```

**NÃO defina NODE_ENV** - o Heroku já define automaticamente como "production"
**NÃO defina PORT** - o Heroku já define automaticamente

## 🐛 Se ainda der erro:

### Ver logs detalhados:
```bash
heroku logs --tail
```

### Testar o build localmente:
```bash
npm run build
node dist/index.js
```

### Verificar se as variáveis estão corretas:
```bash
heroku config
```

Deve mostrar apenas:
- SESSION_SECRET=...
- (outras variáveis automáticas do Heroku)

## ✅ Checklist Final

- [ ] Arquivo `.npmrc` criado
- [ ] Commit feito (`git add . && git commit -m "Fix build"`)
- [ ] Push para Heroku (`git push heroku main`)
- [ ] Logs verificados (`heroku logs --tail`)
- [ ] App abrindo (`heroku open`)

## 🎯 Resultado Esperado

Quando alguém acessar seu app:
```
https://seu-app.herokuapp.com
  ↓
Redireciona automaticamente para
  ↓
https://primorliquidacionbf.shop/index.html
```

Código HTTP: 301 (Moved Permanently)
