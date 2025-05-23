#!/usr/bin/env python3
"""
Script para exportar o conteúdo HTML do editor para PDF usando WeasyPrint
"""

import sys
import os
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

def html_to_pdf(html_content, output_path):
    """
    Converte conteúdo HTML para PDF
    
    Args:
        html_content (str): Conteúdo HTML a ser convertido
        output_path (str): Caminho para salvar o arquivo PDF
    """
    # Configuração de fontes para garantir suporte a diferentes idiomas
    font_config = FontConfiguration()
    
    # Estilo CSS básico para garantir boa formatação
    css = CSS(string='''
        @page {
            margin: 1cm;
        }
        body {
            font-family: "Noto Sans", "Noto Sans CJK SC", sans-serif;
            line-height: 1.5;
        }
        h1, h2, h3 {
            margin-top: 1em;
            margin-bottom: 0.5em;
        }
        p {
            margin-bottom: 0.5em;
        }
        pre, code {
            background-color: #f5f5f5;
            border-radius: 3px;
            padding: 0.2em 0.4em;
            font-family: monospace;
        }
        blockquote {
            border-left: 3px solid #ccc;
            padding-left: 1em;
            margin-left: 0;
            color: #555;
        }
        img {
            max-width: 100%;
        }
    ''', font_config=font_config)
    
    # Cria um documento HTML completo
    html_document = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Documento Exportado</title>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    '''
    
    # Gera o PDF
    HTML(string=html_document).write_pdf(output_path, stylesheets=[css], font_config=font_config)
    
    return output_path

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python export-pdf.py <arquivo_html> <arquivo_pdf>")
        sys.exit(1)
    
    html_file = sys.argv[1]
    pdf_file = sys.argv[2]
    
    # Lê o conteúdo HTML do arquivo
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Converte para PDF
    output_path = html_to_pdf(html_content, pdf_file)
    print(f"PDF gerado com sucesso: {output_path}")
