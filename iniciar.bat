@echo off
title STAMPE - Sistema de Gestão de Pedidos
cd /d "E:\ruan"
if not exist node_modules npm install > nul 2>&1
echo Iniciando servidor...
npm run dev > vite.log 2>&1 &
timeout /t 5 > nul
start "" http://localhost:5173
echo.
echo STAMPE iniciado!
echo Acesse: http://localhost:5173
echo Se nao abrir, clique no terminal.
pause