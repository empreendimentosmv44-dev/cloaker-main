#!/bin/bash

# SCRIPT DE DEPLOY PARA HEROKU - TrafficSeg-Guard
# Execute este script passo a passo

echo "==================================="
echo "DEPLOY TRAFFICSEG-GUARD NO HEROKU"
echo "==================================="
echo ""

# Passo 1: Verificar se está logado no Heroku
echo "📌 Passo 1: Login no Heroku"
heroku login

# Passo 2: Criar app (ou usar existente)
echo ""
echo "📌 Passo 2: Criar app no Heroku"
echo "Digite o nome do seu app (ou pressione Enter para nome aleatório):"
read APP_NAME

if [ -z "$APP_NAME" ]; then
  heroku create
else
  heroku create $APP_NAME
fi

# Passo 3: Configurar variáveis
echo ""
echo "📌 Passo 3: Configurar variáveis de ambiente"
heroku config:set SESSION_SECRET=$(openssl rand -hex 32)

# Passo 4: Ver configurações
echo ""
echo "📌 Configurações atuais:"
heroku config

# Passo 5: Fazer commit
echo ""
echo "📌 Passo 4: Preparando arquivos para deploy"
git add .
git commit -m "Deploy to Heroku with redirect fix"

# Passo 6: Deploy
echo ""
echo "📌 Passo 5: Fazendo deploy..."
git push heroku main

# Passo 7: Ver logs
echo ""
echo "📌 Passo 6: Verificando logs..."
heroku logs --tail

echo ""
echo "==================================="
echo "✅ DEPLOY CONCLUÍDO!"
echo "==================================="
echo ""
echo "Para abrir o app:"
echo "  heroku open"
echo ""
echo "Para ver logs:"
echo "  heroku logs --tail"
echo ""
