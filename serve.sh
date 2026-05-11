#!/bin/bash
# Servidor para compartir la wiki en internet

cd /Users/Natramcue/Desktop/Juego/wiki

echo "🚀 Iniciando servidor..."
echo "📍 La wiki estará disponible en: http://localhost:8000"
echo ""
echo "Para compartir en internet:"
echo "1. Instala ngrok: brew install ngrok"
echo "2. En otra terminal ejecuta: ngrok http 8000"
echo "3. Comparte el enlace https://... que aparece"
echo ""

python3 -m http.server 8000
