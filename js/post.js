const baseUrlPost = 'http://localhost:3000';

// Função para criar usuário
async function criarUsuario(dadosUsuario) {
    console.log('📝 Iniciando criação de usuário:', dadosUsuario);
    console.log('🌐 URL da requisição:', `${baseUrlPost}/users`);
    
    try {
        const response = await fetch(`${baseUrlPost}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosUsuario)
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
            let errorMessage = `Erro HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                console.log('⚠️ Não foi possível ler erro JSON');
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('✅ Usuário criado com sucesso:', data);
        return { success: true, data };
        
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        console.error('❌ Detalhes do erro:', error.message);
        return { success: false, error: error.message };
    }
}

// Função para validar dados do formulário
function validarDadosUsuario(formData) {
    const errors = [];
    
    // Validar nome
    if (!formData.nome || formData.nome.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    // Validar idade
    if (!formData.idade || formData.idade < 1 || formData.idade > 120) {
        errors.push('Idade deve estar entre 1 e 120 anos');
    }
    
    // Validar CEP
    if (!formData.cep || formData.cep.length !== 8 || !/^\d+$/.test(formData.cep)) {
        errors.push('CEP deve ter 8 dígitos numéricos');
    }
    
    // Validar localidade
    if (!formData.localidade || formData.localidade.trim().length < 2) {
        errors.push('Localidade deve ter pelo menos 2 caracteres');
    }
    
    // Validar UF
    if (!formData.uf || formData.uf.length !== 2) {
        errors.push('UF deve ter 2 caracteres');
    }
    
    // Validar bairro
    if (!formData.bairro || formData.bairro.trim().length < 2) {
        errors.push('Bairro deve ter pelo menos 2 caracteres');
    }
    
    // Validar logradouro
    if (!formData.logradouro || formData.logradouro.trim().length < 2) {
        errors.push('Logradouro deve ter pelo menos 2 caracteres');
    }
    
    // Validar número
    if (!formData.numero || formData.numero.trim().length < 1) {
        errors.push('Número é obrigatório');
    }
    
    return errors;
}

// Função para mostrar mensagem de sucesso/erro
function mostrarMensagem(tipo, mensagem) {
    // Remover mensagem anterior se existir
    const mensagemExistente = document.querySelector('.mensagem-feedback');
    if (mensagemExistente) {
        mensagemExistente.remove();
    }
    
    const popup = document.querySelector('.popup');
    const div = document.createElement('div');
    div.className = 'mensagem-feedback';
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
    
    // Remover mensagem após 5 segundos
    setTimeout(() => {
        if (div.parentNode) {
            div.remove();
        }
    }, 5000);
}

// Função para desabilitar/habilitar formulário
function toggleFormulario(disabled) {
    const form = document.getElementById('form-criar-usuario');
    const inputs = form.querySelectorAll('input, select');
    const btnSubmit = form.querySelector('button[type="submit"]');
    
    inputs.forEach(input => {
        input.disabled = disabled;
    });
    
    if (disabled) {
        btnSubmit.textContent = '⏳ Criando...';
        btnSubmit.style.opacity = '0.7';
        btnSubmit.disabled = true;
    } else {
        btnSubmit.textContent = 'Criar Usuário';
        btnSubmit.style.opacity = '1';
        btnSubmit.disabled = false;
    }
}

// Função para processar envio do formulário
async function processarFormulario(event) {
    event.preventDefault();
    
    const form = event.target;
    
    // Verificar se é modo edição
    if (form.getAttribute('data-mode') === 'edit') {
        // Redirecionar para função de edição
        if (typeof processarEdicao === 'function') {
            return processarEdicao(event);
        } else {
            console.error('❌ Função processarEdicao não encontrada');
            return;
        }
    }
    
    const formData = new FormData(form);
    const dados = Object.fromEntries(formData.entries());
    
    // Validar dados
    console.log('📋 Dados coletados do formulário:', dados);
    
    const errors = validarDadosUsuario(dados);
    if (errors.length > 0) {
        console.log('❌ Erros de validação encontrados:', errors);
        
        if (typeof showRequiredFieldsError === 'function') {
            showRequiredFieldsError(errors);
        } else if (typeof showError === 'function') {
            showError('Erros de Validação', errors.join('\n• '));
        } else {
            mostrarMensagem('error', 'Erros encontrados:\n• ' + errors.join('\n• '));
        }
        return;
    }
    
    console.log('✅ Validação passou, dados corretos');
    
    // Desabilitar formulário durante envio
    toggleFormulario(true);
    
    // Preparar dados para envio
    const dadosUsuario = {
        nome: dados.nome.trim(),
        idade: parseInt(dados.idade),
        cep: dados.cep.trim(),
        localidade: dados.localidade.trim(),
        uf: dados.uf.trim(),
        bairro: dados.bairro.trim(),
        logradouro: dados.logradouro.trim(),
        numero: dados.numero.trim()
    };
    
    console.log('📝 Dados do usuário para criação:', dadosUsuario);
    
    try {
        // Criar usuário
        const resultado = await criarUsuario(dadosUsuario);
        
        if (resultado.success) {
            if (typeof showCrudSuccess === 'function') {
                showCrudSuccess('create', 'usuário');
            } else if (typeof showSuccess === 'function') {
                showSuccess('Sucesso!', 'Usuário criado com sucesso!');
            } else {
                mostrarMensagem('success', '✅ Usuário criado com sucesso!');
            }
            
            // Limpar formulário
            form.reset();
            
            // Fechar modal após 2 segundos
            setTimeout(() => {
                const popupWrapper = document.getElementById('popup-wrapper');
                if (popupWrapper) {
                    popupWrapper.classList.add('hidden');
                    
                    // Atualizar lista de usuários
                    if (typeof buscarUsuarios === 'function') {
                        setTimeout(() => buscarUsuarios(), 500);
                    }
                }
            }, 2000);
            
        } else {
            if (typeof showCrudError === 'function') {
                showCrudError('create', resultado.error, 'usuário');
            } else if (typeof showError === 'function') {
                showError('Erro ao Criar', resultado.error);
            } else {
                mostrarMensagem('error', `❌ Erro ao criar usuário: ${resultado.error}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro inesperado na criação:', error);
        if (typeof showError === 'function') {
            showError('Erro Inesperado', error.message);
        } else {
            mostrarMensagem('error', `❌ Erro inesperado: ${error.message}`);
        }
    } finally {
        // Reabilitar formulário
        toggleFormulario(false);
    }
}

// Função para abrir modal de criação
function abrirModalCriacao() {
    console.log('➕ Abrindo modal de criação');
    
    // Configurar modal para modo criação
    if (typeof configurarModalParaCriacao === 'function') {
        configurarModalParaCriacao();
    }
    
    // Abrir modal
    const popupWrapper = document.getElementById('popup-wrapper');
    if (popupWrapper) {
        popupWrapper.classList.remove('hidden');
        console.log('✅ Modal de criação aberto');
    }
}

// Função para fechar modal
function fecharModal() {
    console.log('❌ Fechando modal');
    
    const popupWrapper = document.getElementById('popup-wrapper');
    if (popupWrapper) {
        popupWrapper.classList.add('hidden');
        
        // Limpar dados de edição se existir
        if (typeof configurarModalParaCriacao === 'function') {
            configurarModalParaCriacao();
        }
        
        console.log('✅ Modal fechado');
    }
}

// Inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 post.js carregado - Funcionalidades de criação de usuário disponíveis');
    
    // Conectar formulário ao evento de envio
    const form = document.getElementById('form-criar-usuario');
    if (form) {
        form.addEventListener('submit', processarFormulario);
        console.log('✅ Formulário de criação conectado');
    }
    
    // Conectar botão de abrir modal
    const btnAbrirModal = document.getElementById('btn-abrir-modal');
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener('click', abrirModalCriacao);
        console.log('✅ Botão de abrir modal conectado');
    }
    
    // Conectar botão de fechar modal
    const btnFecharModal = document.getElementById('popup-close-x');
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', fecharModal);
        console.log('✅ Botão de fechar modal conectado');
    }
    
    // Fechar modal clicando fora
    const popupWrapper = document.getElementById('popup-wrapper');
    if (popupWrapper) {
        popupWrapper.addEventListener('click', (event) => {
            if (event.target === popupWrapper) {
                fecharModal();
            }
        });
        console.log('✅ Click fora do modal conectado');
    }
    
    // Fechar modal com ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const modal = document.getElementById('popup-wrapper');
            if (modal && !modal.classList.contains('hidden')) {
                fecharModal();
            }
        }
    });
    console.log('✅ Tecla ESC conectada');
});

// Exportar funções para uso global
window.criarUsuario = criarUsuario;
window.processarFormulario = processarFormulario;
window.abrirModalCriacao = abrirModalCriacao;
window.fecharModal = fecharModal;
