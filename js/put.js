const baseUrlPut = 'http://localhost:3000';

// Variável para armazenar dados do usuário sendo editado
let usuarioParaEditar = null;

// Função para atualizar usuário
async function atualizarUsuario(dadosUsuario) {
    console.log('✏️ Iniciando atualização de usuário:', dadosUsuario);
    
    try {
        const response = await fetch(`${baseUrlPut}/users/${dadosUsuario.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosUsuario)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Usuário atualizado com sucesso:', data);
        return { success: true, data };
        
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        return { success: false, error: error.message };
    }
}

// Função para buscar dados completos do usuário por ID
async function buscarUsuarioPorId(id) {
    console.log('🔍 Buscando dados do usuário:', id);
    
    try {
        const response = await fetch(`${baseUrlPut}/users/${id}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar usuário');
        }
        
        const data = await response.json();
        console.log('✅ Usuário encontrado:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        return null;
    }
}

// Função para abrir modal de edição
async function abrirModalEdicao(id, nome, idade, cep, localidade, uf, bairro, logradouro, numero) {
    console.log('✏️ Abrindo modal de edição para:', { id, nome, idade, cep, localidade, uf, bairro, logradouro, numero });
    console.log('🔍 Tipo do ID recebido:', typeof id, 'Valor:', id);
    
    // Verificar se o ID é válido
    if (!id || id === 'undefined' || id === 'null') {
        console.error('❌ ID inválido recebido:', id);
        return;
    }
    
    // Criar objeto com dados do usuário
    const dadosUsuario = {
        id: parseInt(id),
        nome: nome,
        idade: parseInt(idade) || 0,
        cep: cep || '',
        localidade: localidade || '',
        uf: uf || '',
        bairro: bairro || '',
        logradouro: logradouro || '',
        numero: numero || ''
    };
    
    console.log('📊 Dados do usuário para edição:', dadosUsuario);
    
    // Armazenar dados para edição (incluindo ID)
    usuarioParaEditar = dadosUsuario;
    
    // Configurar modal para modo edição
    configurarModalParaEdicao(dadosUsuario);
    
    // Abrir modal
    const popupWrapper = document.getElementById('popup-wrapper');
    if (popupWrapper) {
        popupWrapper.classList.remove('hidden');
        console.log('✅ Modal de edição aberto para ID:', dadosUsuario.id);
    }
}

// Função para configurar modal para modo edição
function configurarModalParaEdicao(dadosUsuario) {
    // Alterar título
    const titulo = document.querySelector('.popup-title');
    if (titulo) {
        titulo.textContent = 'Editar Usuário';
        titulo.style.color = '#7c3aed';
    }
    
    // Preencher campos
    const nomeInput = document.getElementById('nome');
    const idadeInput = document.getElementById('idade');
    const cepInput = document.getElementById('cep');
    const localidadeInput = document.getElementById('localidade');
    const ufInput = document.getElementById('uf');
    const bairroInput = document.getElementById('bairro');
    const logradouroInput = document.getElementById('logradouro');
    const numeroInput = document.getElementById('numero');
    
    // Preencher cada campo com os dados do usuário
    if (nomeInput) nomeInput.value = dadosUsuario.nome || '';
    if (idadeInput) idadeInput.value = dadosUsuario.idade || '';
    if (cepInput) cepInput.value = dadosUsuario.cep || '';
    if (localidadeInput) localidadeInput.value = dadosUsuario.localidade || '';
    if (ufInput) ufInput.value = dadosUsuario.uf || '';
    if (bairroInput) bairroInput.value = dadosUsuario.bairro || '';
    if (logradouroInput) logradouroInput.value = dadosUsuario.logradouro || '';
    if (numeroInput) numeroInput.value = dadosUsuario.numero || '';
    
    // Alterar botão de submit
    const btnSubmit = document.querySelector('button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.textContent = '✏️ Atualizar Usuário';
        btnSubmit.style.background = '#7c3aed';
    }
    
    // Marcar modal como modo edição
    const form = document.getElementById('form-criar-usuario');
    if (form) {
        form.setAttribute('data-mode', 'edit');
    }
    
    console.log('✅ Modal configurado para edição com dados:', dadosUsuario);
}

// Função para configurar modal para modo criação
function configurarModalParaCriacao() {
    // Alterar título
    const titulo = document.querySelector('.popup-title');
    if (titulo) {
        titulo.textContent = 'Criar Usuário';
        titulo.style.color = '#7c3aed';
    }
    
    // Limpar campos
    const form = document.getElementById('form-criar-usuario');
    if (form) {
        form.reset();
    }
    
    // Alterar botão de submit
    const btnSubmit = document.querySelector('button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.textContent = 'Criar Usuário';
        btnSubmit.style.background = '#7c3aed';
    }
    
    // Marcar modal como modo criação
    if (form) {
        form.setAttribute('data-mode', 'create');
    }
    
    // Limpar variável de edição
    usuarioParaEditar = null;
    
    console.log('✅ Modal configurado para criação');
}

// Função para processar envio do formulário (edição)
async function processarEdicao(event) {
    event.preventDefault();
    
    if (!usuarioParaEditar) {
        console.error('❌ Nenhum usuário selecionado para edição');
        if (typeof showError === 'function') {
            showError('Erro de Edição', 'Nenhum usuário selecionado para edição');
        } else {
            console.error('❌ Função showError não disponível');
        }
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    const dados = Object.fromEntries(formData.entries());
    
    console.log('📝 Dados coletados do formulário:', dados);
    
    // Validar dados básicos
    if (!dados.nome || !dados.localidade) {
        if (typeof showRequiredFieldsError === 'function') {
            showRequiredFieldsError(['Nome', 'Localidade']);
        } else if (typeof showError === 'function') {
            showError('Campos Obrigatórios', 'Nome e localidade são obrigatórios!');
        } else {
            console.error('❌ Funções de toast não disponíveis');
        }
        return;
    }
    
    // Preparar dados para envio
    const dadosAtualizacao = {
        id: usuarioParaEditar.id, // ID obtido da tabela
        nome: dados.nome.trim(),
        idade: parseInt(dados.idade) || 0,
        cep: dados.cep.trim(),
        localidade: dados.localidade.trim(),
        uf: dados.uf.trim(),
        bairro: dados.bairro.trim(),
        logradouro: dados.logradouro.trim(),
        numero: dados.numero.trim()
    };
    
    console.log('📝 Dados para atualização:', dadosAtualizacao);
    
    // Desabilitar formulário
    const btnSubmit = form.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.textContent = '⏳ Atualizando...';
    btnSubmit.style.opacity = '0.7';
    
    try {
        // Executar atualização
        const resultado = await atualizarUsuario(dadosAtualizacao);
        
        if (resultado.success) {
            if (typeof showCrudSuccess === 'function') {
                showCrudSuccess('update', 'usuário');
            } else if (typeof showSuccess === 'function') {
                showSuccess('Sucesso!', 'Usuário atualizado com sucesso!');
            } else {
                console.log('✅ Usuário atualizado com sucesso!');
            }
            
            // Fechar modal
            const popupWrapper = document.getElementById('popup-wrapper');
            if (popupWrapper) {
                popupWrapper.classList.add('hidden');
            }
            
            // Limpar dados de edição
            usuarioParaEditar = null;
            
            // Atualizar lista de usuários
            if (typeof buscarUsuarios === 'function') {
                setTimeout(() => buscarUsuarios(), 500);
            }
            
        } else {
            if (typeof showCrudError === 'function') {
                showCrudError('update', resultado.error, 'usuário');
            } else if (typeof showError === 'function') {
                showError('Erro ao Atualizar', resultado.error);
            } else {
                console.error('❌ Erro ao atualizar usuário:', resultado.error);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro inesperado na edição:', error);
        if (typeof showError === 'function') {
            showError('Erro Inesperado', error.message);
        } else {
            console.error('❌ Erro inesperado:', error.message);
        }
    } finally {
        // Reabilitar formulário
        btnSubmit.disabled = false;
        btnSubmit.textContent = '✏️ Atualizar Usuário';
        btnSubmit.style.opacity = '1';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('✏️ put.js carregado - Funcionalidades de edição disponíveis');
});

// Exportar funções para uso global
window.abrirModalEdicao = abrirModalEdicao;
window.configurarModalParaCriacao = configurarModalParaCriacao;
window.configurarModalParaEdicao = configurarModalParaEdicao;
window.processarEdicao = processarEdicao;
window.atualizarUsuario = atualizarUsuario;
