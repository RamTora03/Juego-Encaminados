#!/usr/bin/env python3
"""
Script para abrir la wiki de Encaminados en el navegador predeterminado
Uso: python3 open_wiki.py
"""

import webbrowser
import os
from pathlib import Path

# Obtener la ruta del directorio donde está este script
script_dir = Path(__file__).parent
index_file = script_dir / "index.html"

# Verificar que el archivo existe
if not index_file.exists():
    print(f"Error: No se encontró {index_file}")
    exit(1)

# Convertir a URL del navegador
file_url = f"file://{index_file.absolute()}"

# Abrir en el navegador predeterminado
print(f"Abriendo wiki en: {file_url}")
webbrowser.open(file_url)
print("✓ Wiki abierta en tu navegador predeterminado")
