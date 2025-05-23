/**
 * Rich Text Editor - Script Principal
 * Implementação em JavaScript puro (sem frameworks)
 * Funcionalidades: formatação de texto, alternância de tema, exportação
 */

// ===== Variáveis Globais =====
let isLightMode = true; // Controle do tema atual
let editorContent = ''; // Conteúdo do editor para operações
let autoSaveInterval; // Intervalo para salvamento automático
const STORAGE_KEY = 'rich-text-editor-content'; // Chave para armazenamento no localStorage

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos principais
    const editor = document.getElementById('editor');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const charCount = document.getElementById('char-count');
    const overlay = document.getElementById('overlay');
    const linkDialog = document.getElementById('link-dialog');
    
    // Inicialização do editor
    initEditor();
    
    // Inicialização dos manipuladores de eventos
    initFormatButtons();
    initDropdowns();
    initThemeToggle();
    initExportButtons();
    initLinkDialog();
    initImageDialog();
    initLinkDialog();
    initKeyboardShortcuts();
    
    /**
     * Inicializa o editor e configura eventos básicos
     */
    function initEditor() {
        // Carrega o conteúdo salvo do localStorage, se existir
        loadFromLocalStorage();
        
        // Limpa o texto placeholder quando o editor recebe foco pela primeira vez
        editor.addEventListener('focus', function handleFirstFocus() {
            if (editor.textContent.trim() === 'Comece a digitar seu texto aqui...') {
                editor.textContent = '';
            }
            editor.removeEventListener('focus', handleFirstFocus);
        }, { once: true });
        
        // Atualiza a contagem de caracteres quando o conteúdo muda
        editor.addEventListener('input', () => {
            updateCharCount();
            saveToLocalStorage(); // Salva o conteúdo a cada alteração
        });
        
        // Inicializa a contagem de caracteres
        updateCharCount();
        
        // Configura o autosave a cada 30 segundos
        setupAutoSave();
    }
    
    /**
     * Salva o conteúdo do editor no localStorage
     */
    function saveToLocalStorage() {
        const content = editor.innerHTML;
        localStorage.setItem(STORAGE_KEY, content);
        console.log('Conteúdo salvo no localStorage');
    }
    
    /**
     * Carrega o conteúdo do editor do localStorage
     */
    function loadFromLocalStorage() {
        const savedContent = localStorage.getItem(STORAGE_KEY);
        if (savedContent) {
            editor.innerHTML = savedContent;
            console.log('Conteúdo carregado do localStorage');
        }
    }
    
    /**
     * Configura o salvamento automático a cada 30 segundos
     */
    function setupAutoSave() {
        // Limpa qualquer intervalo existente
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
        }
        
        // Configura novo intervalo de 30 segundos
        autoSaveInterval = setInterval(() => {
            saveToLocalStorage();
        }, 30000); // 30 segundos
    }
    
    /**
     * Atualiza a contagem de caracteres no editor
     */
    function updateCharCount() {
        const text = editor.innerText || '';
        const count = text.length;
        charCount.textContent = `${count} caracteres`;
    }
    
    /**
     * Inicializa os botões de formatação na barra de ferramentas
     */
    function initFormatButtons() {
        // Formatação básica de texto
        document.getElementById('bold').addEventListener('click', () => execFormatCommand('bold'));
        document.getElementById('italic').addEventListener('click', () => execFormatCommand('italic'));
        document.getElementById('underline').addEventListener('click', () => execFormatCommand('underline'));
        document.getElementById('font-size-increase').addEventListener('click', increaseFontSize);
        document.getElementById('font-size-decrease').addEventListener('click', decreaseFontSize);
        
        // Desfazer e refazer
        document.getElementById('undo').addEventListener('click', () => execFormatCommand('undo'));
        document.getElementById('redo').addEventListener('click', () => execFormatCommand('redo'));
        
        // Alinhamento de texto
        document.getElementById('align-left').addEventListener('click', () => execFormatCommand('justifyLeft'));
        document.getElementById('align-center').addEventListener('click', () => execFormatCommand('justifyCenter'));
        document.getElementById('align-right').addEventListener('click', () => execFormatCommand('justifyRight'));
        document.getElementById('align-justify').addEventListener('click', () => execFormatCommand('justifyFull'));
        
        // Listas
        document.getElementById('ordered-list').addEventListener('click', () => execFormatCommand('insertOrderedList'));
        document.getElementById('unordered-list').addEventListener('click', () => execFormatCommand('insertUnorderedList'));
        
        // Títulos (H1, H2, H3)
        document.getElementById('h1').addEventListener('click', () => formatHeading('h1'));
        document.getElementById('h2').addEventListener('click', () => formatHeading('h2'));
        document.getElementById('h3').addEventListener('click', () => formatHeading('h3'));
        document.getElementById('p').addEventListener('click', () => formatHeading('p'));
        
        // Seletor de fontes
        document.getElementById('font-roboto')?.addEventListener('click', () => setFontFamily('Roboto, sans-serif'));
        document.getElementById('font-arial')?.addEventListener('click', () => setFontFamily('Arial, sans-serif'));
        document.getElementById('font-times')?.addEventListener('click', () => setFontFamily('Times New Roman, serif'));
        document.getElementById('font-courier')?.addEventListener('click', () => setFontFamily('Courier New, monospace'));
        document.getElementById('font-georgia')?.addEventListener('click', () => setFontFamily('Georgia, serif'));
        
        // Seletor de cores
        document.getElementById('color-black')?.addEventListener('click', () => setTextColor('#000000'));
        document.getElementById('color-red')?.addEventListener('click', () => setTextColor('#FF0000'));
        document.getElementById('color-blue')?.addEventListener('click', () => setTextColor('#0000FF'));
        document.getElementById('color-green')?.addEventListener('click', () => setTextColor('#008000'));
        document.getElementById('color-purple')?.addEventListener('click', () => setTextColor('#800080'));
        document.getElementById('color-orange')?.addEventListener('click', () => setTextColor('#FFA500'));
        
        // Adiciona feedback visual aos botões de formatação
        const formatButtons = document.querySelectorAll('.toolbar-btn');
        formatButtons.forEach(button => {
            button.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Evita que o editor perca o foco
            });
            
            // Adiciona classe 'active' ao clicar e remove após um curto período
            button.addEventListener('click', function() {
                this.classList.add('active');
                setTimeout(() => {
                    this.classList.remove('active');
                }, 200);
            });
        });
    }
    
    /**
     * Inicializa os dropdowns na barra de ferramentas
     */
    function initDropdowns() {
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                
                const dropdown = this.nextElementSibling;
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                // Fecha todos os outros dropdowns
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
                
                document.querySelectorAll('.dropdown-toggle').forEach(btn => {
                    btn.setAttribute('aria-expanded', 'false');
                });
                
                // Alterna o estado do dropdown atual
                if (!isExpanded) {
                    dropdown.classList.add('show');
                    this.setAttribute('aria-expanded', 'true');
                    
                    // Fecha o dropdown quando clicar fora dele
                    const closeDropdown = function(event) {
                        if (!dropdown.contains(event.target) && event.target !== toggle) {
                            dropdown.classList.remove('show');
                            toggle.setAttribute('aria-expanded', 'false');
                            document.removeEventListener('click', closeDropdown);
                        }
                    };
                    
                    // Adiciona o evento com um pequeno atraso para evitar que o clique atual o feche imediatamente
                    setTimeout(() => {
                        document.addEventListener('click', closeDropdown);
                    }, 0);
                }
            });
        });
    }
    
    /**
     * Inicializa o botão de alternância de tema (dark/light mode)
     */
    function initThemeToggle() {
        themeToggle.addEventListener('click', () => {
            isLightMode = !isLightMode;
            
            if (isLightMode) {
                document.body.classList.remove('dark-mode');
                document.body.classList.add('light-mode');
                themeIcon.textContent = 'dark_mode';
            } else {
                document.body.classList.remove('light-mode');
                document.body.classList.add('dark-mode');
                themeIcon.textContent = 'light_mode';
            }
        });
    }
    
    /**
     * Inicializa os botões de exportação
     */
    function initExportButtons() {
        document.getElementById('export-html').addEventListener('click', exportAsHTML);
        document.getElementById('export-markdown').addEventListener('click', exportAsMarkdown);
        document.getElementById('export-pdf').addEventListener('click', exportAsPDF);
    }
    
    /**
     * Inicializa o diálogo de inserção de link
     */
    function initLinkDialog() {
        const cancelLinkBtn = document.getElementById('cancel-link');
        const insertLinkBtn = document.getElementById('insert-link');
        
        // Fecha o diálogo ao clicar em Cancelar
        cancelLinkBtn.addEventListener('click', hideLinkDialog);
        
        // Insere o link ao clicar em Inserir
        insertLinkBtn.addEventListener('click', () => {
            const url = document.getElementById('link-url').value;
            const text = document.getElementById('link-text').value;
            
            if (url) {
                insertLink(url, text);
                hideLinkDialog();
            }
        });
        
        // Fecha o diálogo ao clicar no overlay
        overlay.addEventListener('click', hideLinkDialog);
    }
    
    /**
     * Inicializa os atalhos de teclado
     */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Verifica se o Ctrl (ou Command no Mac) está pressionado
            const isCtrlPressed = e.ctrlKey || e.metaKey;
            
            if (isCtrlPressed) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        execFormatCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        execFormatCommand('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        execFormatCommand('underline');
                        break;
                    case 'z':
                        e.preventDefault();
                        execFormatCommand('undo');
                        break;
                    case 'y':
                        e.preventDefault();
                        execFormatCommand('redo');
                        break;
                }
            }
        });
    }
    
    // ===== Funções de Formatação =====
    
    /**
     * Executa um comando de formatação do document.execCommand
     * @param {string} command - Comando de formatação
     * @param {string} [value=null] - Valor opcional para o comando
     */
    function execFormatCommand(command, value = null) {
        document.execCommand(command, false, value);
        editor.focus();
        updateCharCount();
    }
    
    /**
     * Aumenta o tamanho da fonte do texto selecionado
     */
    function increaseFontSize() {
        changeFontSize(2); // Aumenta em 2px
    }
    
    /**
     * Diminui o tamanho da fonte do texto selecionado
     */
    function decreaseFontSize() {
        changeFontSize(-2); // Diminui em 2px
    }
    
    /**
     * Altera o tamanho da fonte do texto selecionado
     * @param {number} sizeDelta - Quantidade de pixels para aumentar/diminuir
     */
    function changeFontSize(sizeDelta) {
        const selection = window.getSelection();
        
        if (selection.rangeCount) {
            const range = selection.getRangeAt(0);
            
            if (!range.collapsed) {
                // Se há texto selecionado
                const selectedContent = range.extractContents();
                const span = document.createElement('span');
                
                // Verifica se o conteúdo selecionado já tem um tamanho de fonte definido
                let fontSize = 16; // Tamanho padrão em px
                
                // Procura por spans com estilo de fonte no conteúdo selecionado
                const existingSpans = selectedContent.querySelectorAll('span[style*="font-size"]');
                if (existingSpans.length > 0) {
                    // Pega o tamanho da primeira span encontrada
                    const existingSize = window.getComputedStyle(existingSpans[0]).fontSize;
                    fontSize = parseInt(existingSize);
                }
                
                // Aplica o novo tamanho
                span.style.fontSize = (fontSize + sizeDelta) + 'px';
                span.appendChild(selectedContent);
                range.insertNode(span);
            } else {
                // Se não há seleção, aplica ao parágrafo atual
                const currentNode = selection.focusNode;
                let paragraph = currentNode;
                
                // Encontra o elemento pai mais próximo (parágrafo, div, etc)
                if (currentNode.nodeType === 3) { // Nó de texto
                    paragraph = currentNode.parentNode;
                }
                
                if (paragraph) {
                    // Obtém o tamanho atual
                    const currentSize = window.getComputedStyle(paragraph).fontSize;
                    const currentSizeNum = parseFloat(currentSize);
                    
                    // Aplica o novo tamanho
                    paragraph.style.fontSize = (currentSizeNum + sizeDelta) + 'px';
                }
            }
            
            // Restaura o foco no editor
            editor.focus();
        }
    }
    
    /**
     * Formata o texto selecionado como um título (h1, h2, h3) ou parágrafo
     * @param {string} tag - Tag HTML a ser aplicada (h1, h2, h3, p)
     */
    function formatHeading(tag) {
        // Salva a seleção atual
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const selectedContent = range.extractContents();
        
        // Cria o elemento de título
        const heading = document.createElement(tag);
        heading.appendChild(selectedContent);
        
        // Insere o título no lugar da seleção
        range.insertNode(heading);
        
        // Limpa a seleção e foca no editor
        selection.removeAllRanges();
        editor.focus();
    }
    
    /**
     * Insere um bloco de código no editor
     */
    function insertCodeBlock() {
        const selection = window.getSelection();
        
        if (selection.rangeCount) {
            const range = selection.getRangeAt(0);
            const selectedContent = range.extractContents();
            
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            
            code.appendChild(selectedContent);
            pre.appendChild(code);
            
            range.insertNode(pre);
            selection.removeAllRanges();
            editor.focus();
        }
    }
    
    /**
     * Mostra o diálogo de inserção de link
     */
    function showLinkDialog() {
        // Salva a seleção atual para uso posterior
        editorContent = saveSelection();
        
        // Preenche o campo de texto do link com o texto selecionado
        const selection = window.getSelection();
        const selectedText = selection.toString();
        document.getElementById('link-text').value = selectedText;
        
        // Limpa o campo de URL
        document.getElementById('link-url').value = '';
        
        // Mostra o diálogo e o overlay
        linkDialog.classList.add('show');
        linkDialog.setAttribute('aria-hidden', 'false');
        overlay.classList.add('show');
        
        // Foca no campo de URL
        document.getElementById('link-url').focus();
    }
    
    /**
     * Esconde o diálogo de inserção de link
     */
    function hideLinkDialog() {
        linkDialog.classList.remove('show');
        linkDialog.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('show');
        
        // Restaura o foco no editor
        editor.focus();
    }
    
    /**
     * Insere um link no editor
     * @param {string} url - URL do link
     * @param {string} [text=''] - Texto do link (opcional)
     */
    function insertLink(url, text = '') {
        // Restaura a seleção salva
        restoreSelection(editorContent);
        
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        // Se não houver texto selecionado, usa o texto fornecido ou a URL
        const linkText = selectedText || text || url;
        
        // Cria o elemento de link
        const link = document.createElement('a');
        link.href = url.startsWith('http') ? url : `https://${url}`;
        link.textContent = linkText;
        link.target = '_blank'; // Abre em nova aba
        link.rel = 'noopener noreferrer'; // Segurança para links externos
        
        // Insere o link no lugar da seleção
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(link);
        
        // Limpa a seleção e foca no editor
        selection.removeAllRanges();
        editor.focus();
    }
    
    /**
     * Salva a seleção atual para uso posterior
     * @returns {Range} - Objeto Range da seleção
     */
    function saveSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            return selection.getRangeAt(0);
        }
        return null;
    }
    
    /**
     * Restaura uma seleção previamente salva
     * @param {Range} range - Objeto Range a ser restaurado
     */
    function restoreSelection(range) {
        if (range) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    // ===== Funções de Exportação =====
    
    /**
     * Exporta o conteúdo do editor como HTML
     */
    function exportAsHTML() {
        const content = editor.innerHTML;
        downloadFile(content, 'documento.html', 'text/html');
    }
    
    /**
     * Exporta o conteúdo do editor como Markdown
     */
    function exportAsMarkdown() {
        const html = editor.innerHTML;
        const markdown = convertHtmlToMarkdown(html);
        downloadFile(markdown, 'documento.md', 'text/markdown');
    }
    
    /**
     * Exporta o conteúdo do editor como PDF usando WeasyPrint
     */
    function exportAsPDF() {
        // Salva o conteúdo atual em um arquivo HTML temporário
        const content = editor.innerHTML;
        const outputPdfFile = 'documento.pdf';
        
        // Cria um documento HTML completo
        const htmlDocument = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Documento Exportado</title>
            <style>
                body {
                    font-family: "Roboto", sans-serif;
                    line-height: 1.5;
                    margin: 2cm;
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
                img {
                    max-width: 100%;
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
        `;
        
        // Usa a API Fetch para enviar o conteúdo HTML para o servidor
        fetch('http://localhost:5000/export-to-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ html: htmlDocument }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao exportar para PDF');
            }
            return response.blob();
        })
        .then(blob => {
            // Cria um URL para o blob e inicia o download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = outputPdfFile;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Erro na exportação para PDF:', error);
            alert('Não foi possível exportar para PDF. Alternativa: salvando como HTML...');
            // Fallback para exportação HTML se a exportação PDF falhar
            exportAsHTML();
        });
    }
    
    /**
     * Converte HTML para Markdown
     * @param {string} html - Conteúdo HTML a ser convertido
     * @returns {string} - Conteúdo convertido para Markdown
     */
    function convertHtmlToMarkdown(html) {
        // Cria um elemento temporário para manipular o HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Função recursiva para converter elementos para Markdown
        function processNode(node) {
            let result = '';
            
            // Processa diferentes tipos de nós
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                
                // Processa os filhos primeiro para obter o conteúdo interno
                let innerContent = '';
                for (const child of node.childNodes) {
                    innerContent += processNode(child);
                }
                
                // Aplica formatação Markdown com base na tag
                switch (tagName) {
                    case 'h1':
                        return `# ${innerContent}\n\n`;
                    case 'h2':
                        return `## ${innerContent}\n\n`;
                    case 'h3':
                        return `### ${innerContent}\n\n`;
                    case 'p':
                        return `${innerContent}\n\n`;
                    case 'strong':
                    case 'b':
                        return `**${innerContent}**`;
                    case 'em':
                    case 'i':
                        return `*${innerContent}*`;
                    case 'u':
                        return `<u>${innerContent}</u>`;
                    case 'a':
                        return `[${innerContent}](${node.getAttribute('href')})`;
                    case 'pre':
                        return `\`\`\`\n${innerContent}\n\`\`\`\n\n`;
                    case 'code':
                        return node.parentNode.tagName.toLowerCase() === 'pre' ? innerContent : `\`${innerContent}\``;
                    case 'ul':
                        return innerContent;
                    case 'ol':
                        return innerContent;
                    case 'li': {
                        const parent = node.parentNode.tagName.toLowerCase();
                        const prefix = parent === 'ol' ? '1. ' : '- ';
                        return `${prefix}${innerContent}\n`;
                    }
                    case 'br':
                        return '\n';
                    case 'span':
                        // Verifica se o span tem estilo de fonte aumentada
                        if (node.style.fontSize) {
                            return innerContent; // Retorna apenas o conteúdo, pois Markdown não suporta tamanho de fonte
                        }
                        return innerContent;
                    default:
                        return innerContent;
                }
            }
            
            return '';
        }
        
        // Processa todos os nós filhos do elemento temporário
        let markdown = '';
        for (const child of temp.childNodes) {
            markdown += processNode(child);
        }
        
        return markdown.trim();
    }
    
    /**
     * Cria e inicia o download de um arquivo
     * @param {string} content - Conteúdo do arquivo
     * @param {string} filename - Nome do arquivo
     * @param {string} contentType - Tipo MIME do conteúdo
     */
    function downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        // Limpa após o download
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
});

    /**
     * Define a família de fonte para o texto selecionado
     * @param {string} fontFamily - Nome da família de fonte a ser aplicada
     */
    function setFontFamily(fontFamily) {
        execFormatCommand('fontName', fontFamily);
        editor.focus();
    }
    
    /**
     * Define a cor do texto selecionado
     * @param {string} color - Código hexadecimal da cor a ser aplicada
     */
    function setTextColor(color) {
        execFormatCommand('foreColor', color);
        editor.focus();
    }

/**
 * Inicializa o diálogo de inserção de imagem
 */
function initImageDialog() {
    const insertImageBtn = document.getElementById('insert-image');
    const imageDialog = document.getElementById('image-dialog');
    const overlay = document.getElementById('overlay');
    const cancelImageBtn = document.getElementById('cancel-image');
    const confirmImageBtn = document.getElementById('insert-image-btn');
    const imageUrlInput = document.getElementById('image-url');
    const imageUploadInput = document.getElementById('image-upload');
    const imageAltInput = document.getElementById('image-alt');
    const imagePreview = document.getElementById('image-preview');
    
    // Abre o diálogo ao clicar no botão de inserir imagem
    insertImageBtn.addEventListener('click', () => {
        imageDialog.classList.add('show');
        overlay.classList.add('show');
        imageUrlInput.value = '';
        imageAltInput.value = '';
        imagePreview.innerHTML = '';
        editor.focus();
    });
    
    // Fecha o diálogo ao clicar em cancelar
    cancelImageBtn.addEventListener('click', () => {
        imageDialog.classList.remove('show');
        overlay.classList.remove('show');
        editor.focus();
    });
    
    // Preview da imagem ao inserir URL
    imageUrlInput.addEventListener('input', () => {
        const url = imageUrlInput.value.trim();
        if (url) {
            previewImage(url);
        } else {
            imagePreview.innerHTML = '';
        }
    });
    
    // Preview da imagem ao selecionar arquivo
    imageUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Insere a imagem no editor
    confirmImageBtn.addEventListener('click', () => {
        const url = imageUrlInput.value.trim();
        const file = imageUploadInput.files[0];
        const alt = imageAltInput.value.trim();
        
        if (url) {
            insertImageToEditor(url, alt);
        } else if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                insertImageToEditor(event.target.result, alt);
            };
            reader.readAsDataURL(file);
        }
        
        imageDialog.classList.remove('show');
        overlay.classList.remove('show');
        editor.focus();
    });
    
    /**
     * Exibe preview da imagem no diálogo
     * @param {string} src - URL ou Data URL da imagem
     */
    function previewImage(src) {
        imagePreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Preview';
        img.onerror = () => {
            imagePreview.innerHTML = '<p>Não foi possível carregar a imagem</p>';
        };
        imagePreview.appendChild(img);
    }
    
    /**
     * Insere a imagem no editor na posição atual do cursor
     * @param {string} src - URL ou Data URL da imagem
     * @param {string} alt - Texto alternativo para a imagem
     */
    function insertImageToEditor(src, alt) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt || 'Imagem';
        img.style.maxWidth = '100%';
        
        // Insere a imagem na posição atual do cursor
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            
            // Move o cursor após a imagem
            range.setStartAfter(img);
            range.setEndAfter(img);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Adiciona um parágrafo após a imagem se não houver
            if (!img.nextSibling || (img.nextSibling.nodeType !== 1 && !img.nextSibling.textContent.trim())) {
                const p = document.createElement('p');
                p.innerHTML = '<br>';
                img.parentNode.insertBefore(p, img.nextSibling);
            }
        }
        
        // Salva o conteúdo no localStorage
        saveToLocalStorage();
    }
}
