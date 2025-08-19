const baseUrlDelete = 'http://localhost:3000';

// Variável para armazenar dados do usuário a ser deletado
let usuarioParaDeletar = null;

// Função para deletar usuário
async function deletarUsuario(id) {
    console.log('🗑️ Iniciando deleção de usuário:', id);
    
    try {
        const response = await fetch(`${baseUrlDelete}/users/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Usuário não encontrado');
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        console.log('✅ Usuário deletado com sucesso');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Erro ao deletar usuário:', error);
        return { success: false, error: error.message };
    }
}

// Função para abrir modal de confirmação de delete
function abrirModalDelete(id, nome, localidade) {
    console.log('🔓 Abrindo modal de delete:', { id, nome, localidade });
    
    const popupDeleteWrapper = document.getElementById('popup-delete-wrapper');
    const deleteUserName = document.getElementById('delete-user-name');
    const deleteUserLocalidade = document.getElementById('delete-user-localidade');
    
    if (!popupDeleteWrapper) {
        console.error('❌ Modal de delete não encontrado');
        return;
    }
    
    if (!deleteUserName || !deleteUserLocalidade) {
        console.error('❌ Elementos do modal de delete não encontrados');
        return;
    }
    
    // Armazenar dados do usuário
    usuarioParaDeletar = { id, nome: nome || 'Usuário', localidade: localidade || 'N/A' };
    
    // Atualizar informações no modal
    deleteUserName.textContent = nome || 'Usuário';
    deleteUserLocalidade.textContent = localidade || 'N/A';
    
    // Remover mensagens anteriores
    const mensagemExistente = document.querySelector('.mensagem-delete-feedback');
    if (mensagemExistente) {
        mensagemExistente.remove();
    }
    
    // Mostrar modal
    popupDeleteWrapper.classList.remove('hidden');
    
    console.log('✅ Modal de delete aberto para:', { id, nome, localidade });
}

// Função para fechar modal de delete
function fecharModalDelete() {
    const popupDeleteWrapper = document.getElementById('popup-delete-wrapper');
    if (popupDeleteWrapper) {
        popupDeleteWrapper.classList.add('hidden');
        usuarioParaDeletar = null;
        console.log('🔒 Modal de delete fechado');
    }
}

// Função para mostrar mensagem de feedback
function mostrarMensagemDelete(tipo, mensagem) {
    // Remover mensagem anterior se existir
    const mensagemExistente = document.querySelector('.mensagem-delete-feedback');
    if (mensagemExistente) {
        mensagemExistente.remove();
    }
    
    const popup = document.querySelector('#popup-delete-wrapper .popup');
    const div = document.createElement('div');
    div.className = 'mensagem-delete-feedback';
    div.style.cssText = `
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        border-radius: 0.5rem;
        font-size: 0.9rem;
        font-weight: 500;
        text-align: center;
        ${tipo === 'success' ? 
            'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 
            'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
        }
    `;
    div.textContent = mensagem;
    
    popup.insertBefore(div, popup.firstChild);
    
    // Remover mensagem após 3 segundos
    setTimeout(() => {
        if (div.parentNode) {
            div.remove();
        }
    }, 3000);
}

// Função para desabilitar/habilitar botões durante delete
function toggleBotoesDelete(disabled) {
    const btnCancelar = document.getElementById('btn-delete-cancelar');
    const btnConfirmar = document.getElementById('btn-delete-confirmar');
    
    if (btnCancelar) btnCancelar.disabled = disabled;
    if (btnConfirmar) {
        btnConfirmar.disabled = disabled;
        if (disabled) {
            btnConfirmar.textContent = '⏳ Deletando...';
            btnConfirmar.style.opacity = '0.7';
        } else {
            btnConfirmar.textContent = '🗑️ Deletar';
            btnConfirmar.style.opacity = '1';
        }
    }
}

// Função para processar confirmação de delete
async function processarDelete() {
    if (!usuarioParaDeletar) {
        console.error('❌ Nenhum usuário selecionado para delete');
        if (typeof showError === 'function') {
            showError('Erro de Delete', 'Nenhum usuário selecionado para delete');
        } else {
            mostrarMensagemDelete('error', '❌ Erro: Nenhum usuário selecionado');
        }
        return;
    }
    
    const { id, nome, localidade } = usuarioParaDeletar;
    
    console.log('🔄 Processando delete de:', { id, nome, localidade });
    
    // Desabilitar botões
    toggleBotoesDelete(true);
    
    try {
        // Executar delete
        const resultado = await deletarUsuario(id);
        
        // Reabilitar botões
        toggleBotoesDelete(false);
        
        if (resultado.success) {
            if (typeof showCrudSuccess === 'function') {
                showCrudSuccess('delete', 'usuário');
            } else if (typeof showSuccess === 'function') {
                showSuccess('Sucesso!', `Usuário "${nome}" deletado com sucesso!`);
            } else {
                mostrarMensagemDelete('success', `✅ Usuário "${nome}" deletado com sucesso!`);
            }
            
            // Fechar modal após 2 segundos
            setTimeout(() => {
                fecharModalDelete();
                
                // Atualizar lista de usuários
                if (typeof buscarUsuarios === 'function') {
                    console.log('🔄 Atualizando lista de usuários...');
                    setTimeout(() => buscarUsuarios(), 300);
                } else {
                    console.warn('⚠️ Função buscarUsuarios não encontrada');
                }
            }, 2000);
            
        } else {
            if (typeof showCrudError === 'function') {
                showCrudError('delete', resultado.error, 'usuário');
            } else if (typeof showError === 'function') {
                showError('Erro ao Deletar', resultado.error);
            } else {
                mostrarMensagemDelete('error', `❌ Erro ao deletar usuário: ${resultado.error}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro inesperado no delete:', error);
        toggleBotoesDelete(false);
        
        if (typeof showError === 'function') {
            showError('Erro Inesperado', error.message);
        } else {
            mostrarMensagemDelete('error', `❌ Erro inesperado: ${error.message}`);
        }
    }
}

// Função que será chamada pelos botões de delete da tabela
function confirmarDeleteUsuario(id, nome, localidade) {
    console.log('🎯 Confirmação de delete solicitada para:', { id, nome, localidade });
    
    // Limpar nome se contém caracteres de escape ou é inválido
    if (nome) {
        nome = nome.replace(/['"\\]/g, '').trim();
        if (nome === 'null' || nome === 'undefined' || nome === '') {
            nome = null;
        }
    }
    
    // Fallback para nome
    if (!nome || nome === 'N/A') {
        nome = 'Usuário';
    }
    
    console.log('📝 Dados processados para delete:', { id, nome, localidade });
    abrirModalDelete(id, nome, localidade);
}

// Função para testar se todos os elementos necessários existem
function verificarElementosDelete() {
    const elementos = {
        modal: document.getElementById('popup-delete-wrapper'),
        nomeSpan: document.getElementById('delete-user-name'),
        localidadeSpan: document.getElementById('delete-user-localidade'),
        btnCancelar: document.getElementById('btn-delete-cancelar'),
        btnConfirmar: document.getElementById('btn-delete-confirmar'),
        btnClose: document.getElementById('popup-delete-close-x')
    };
    
    const faltando = [];
    Object.entries(elementos).forEach(([nome, elemento]) => {
        if (!elemento) {
            faltando.push(nome);
        }
    });
    
    if (faltando.length > 0) {
        console.error('❌ Elementos de delete faltando:', faltando);
        return false;
    }
    
    console.log('✅ Todos os elementos de delete encontrados');
    return true;
}

// Inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🗑️ delete.js carregado - Inicializando funcionalidades de delete...');
    
    // Verificar se todos os elementos existem
    if (!verificarElementosDelete()) {
        console.error('❌ Falha na inicialização - elementos faltando');
        return;
    }
    
    // Conectar botões do modal de delete
    const btnDeleteCancelar = document.getElementById('btn-delete-cancelar');
    const btnDeleteConfirmar = document.getElementById('btn-delete-confirmar');
    const btnDeleteClose = document.getElementById('popup-delete-close-x');
    const popupDeleteWrapper = document.getElementById('popup-delete-wrapper');
    
    // Botão cancelar
    if (btnDeleteCancelar) {
        btnDeleteCancelar.addEventListener('click', () => {
            console.log('🚫 Delete cancelado pelo usuário');
            fecharModalDelete();
        });
        console.log('✅ Botão cancelar conectado');
    }
    
    // Botão confirmar delete
    if (btnDeleteConfirmar) {
        btnDeleteConfirmar.addEventListener('click', () => {
            console.log('⚠️ Delete confirmado pelo usuário');
            processarDelete();
        });
        console.log('✅ Botão confirmar conectado');
    }
    
    // Botão X para fechar
    if (btnDeleteClose) {
        btnDeleteClose.addEventListener('click', () => {
            console.log('❌ Modal fechado pelo X');
            fecharModalDelete();
        });
        console.log('✅ Botão X conectado');
    }
    
    // Fechar modal clicando fora
    if (popupDeleteWrapper) {
        popupDeleteWrapper.addEventListener('click', (event) => {
            if (event.target === popupDeleteWrapper) {
                console.log('🖱️ Modal fechado clicando fora');
                fecharModalDelete();
            }
        });
        console.log('✅ Click fora conectado');
    }
    
    // Fechar modal com ESC
    document.addEventListener('keydown', (event) => {
        const modal = document.getElementById('popup-delete-wrapper');
        if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            console.log('⌨️ Modal fechado com ESC');
            fecharModalDelete();
        }
    });
    console.log('✅ Tecla ESC conectada');
    
    console.log('🎉 Sistema de delete inicializado com sucesso!');
});

// Exportar funções para uso global
window.deletarUsuario = deletarUsuario;
window.confirmarDeleteUsuario = confirmarDeleteUsuario;
window.abrirModalDelete = abrirModalDelete;
window.fecharModalDelete = fecharModalDelete;

