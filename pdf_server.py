from flask import Flask, request, send_file, jsonify
import os
import tempfile
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
import json

app = Flask(__name__)

@app.route('/export-to-pdf', methods=['POST'])
def export_to_pdf():
    """Endpoint para converter HTML em PDF usando WeasyPrint"""
    try:
        # Obtém o conteúdo HTML do request
        data = request.json
        html_content = data.get('html', '')
        
        if not html_content:
            return jsonify({"error": "Conteúdo HTML não fornecido"}), 400
        
        # Configuração de fontes
        font_config = FontConfiguration()
        
        # Cria arquivos temporários para o HTML e PDF
        with tempfile.NamedTemporaryFile(suffix='.html', delete=False) as html_file:
            html_file.write(html_content.encode('utf-8'))
            html_path = html_file.name
            
        pdf_path = html_path.replace('.html', '.pdf')
        
        # Gera o PDF usando WeasyPrint
        HTML(filename=html_path).write_pdf(
            pdf_path,
            font_config=font_config
        )
        
        # Envia o arquivo PDF como resposta
        response = send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='documento.pdf'
        )
        
        # Limpa os arquivos temporários após enviar a resposta
        @response.call_on_close
        def cleanup():
            if os.path.exists(html_path):
                os.remove(html_path)
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
                
        return response
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
