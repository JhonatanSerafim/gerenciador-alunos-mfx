const baseUrlGet = 'http://localhost:3000';

// Função para buscar usuários
async function buscarUsuarios() {
    console.log('🔍 Iniciando busca de usuários...');
    
    try {
        const response = await fetch(`${baseUrlGet}/users`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const usuarios = await response.json();
        console.log('✅ Usuários carregados:', usuarios);
        
        // Atualizar tabela
        atualizarTabelaUsuarios(usuarios);
        
        return { success: true, data: usuarios };
        
    } catch (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        
        if (typeof showCrudError === 'function') {
            showCrudError('read', error.message, 'usuário');
        } else if (typeof showError === 'function') {
            showError('Erro ao Carregar', `Erro ao carregar usuários: ${error.message}`);
        } else {
            console.error('❌ Funções de toast não disponíveis');
        }
        
        // Mostrar mensagem de erro na tabela
        mostrarErroNaTabela(error.message);
        
        return { success: false, error: error.message };
    }
}

// Função para atualizar tabela de usuários
function atualizarTabelaUsuarios(usuarios) {
    const tbody = document.querySelector('tbody');
    
    if (!tbody) {
        console.error('❌ Tbody não encontrado');
        return;
    }
    
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #666; padding: 20px;">
                    Nenhum usuário encontrado
                </td>
            </tr>
        `;
        console.log('ℹ️ Nenhum usuário para exibir');
        return;
    }
    
    // Limpar tabela
    tbody.innerHTML = '';
    
    // Adicionar cada usuário
    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        
        // Verificar se os dados são válidos
        const nome = usuario.nome || 'N/A';
        const localidade = usuario.localidade || 'N/A';
        const id = usuario.id || 'N/A';
        
        row.innerHTML = `
            <td>${id}</td>
            <td>${nome}</td>
            <td>${localidade}</td>
            <td>
                <button onclick="editarUsuario('${id}', '${nome}', '${usuario.idade || ''}', '${usuario.cep || ''}', '${localidade}', '${usuario.uf || ''}', '${usuario.bairro || ''}', '${usuario.logradouro || ''}', '${usuario.numero || ''}')" class="btn-edit" title="Editar usuário">
                    ✏️
                </button>
                <button onclick="confirmarDeleteUsuario('${id}', '${nome}', '${localidade}')" class="btn-delete" title="Deletar usuário">
                    🗑️
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log(`✅ Tabela atualizada com ${usuarios.length} usuários`);
}

// Função para mostrar erro na tabela
function mostrarErroNaTabela(mensagem) {
    const tbody = document.querySelector('tbody');
    
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #dc3545; padding: 20px;">
                    ❌ Erro ao carregar usuários: ${mensagem}
                </td>
            </tr>
        `;
    }
}

// Função para editar usuário (chamada pelos botões da tabela)
function editarUsuario(id, nome, idade, cep, localidade, uf, bairro, logradouro, numero) {
    console.log('✏️ Editando usuário:', { id, nome, idade, cep, localidade, uf, bairro, logradouro, numero });
    
    // Verificar se a função de abrir modal existe
    if (typeof abrirModalEdicao === 'function') {
        abrirModalEdicao(id, nome, idade, cep, localidade, uf, bairro, logradouro, numero);
    } else {
        console.error('❌ Função abrirModalEdicao não encontrada');
        if (typeof showError === 'function') {
            showError('Erro de Sistema', 'Função de edição não disponível');
        } else {
            console.error('❌ Funções de toast não disponíveis');
        }
    }
}

// Função para buscar usuário específico por ID
async function buscarUsuarioPorId(id) {
    console.log('🔍 Buscando usuário específico:', id);
    
    try {
        const response = await fetch(`${baseUrlGet}/users/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Usuário não encontrado');
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const usuario = await response.json();
        console.log('✅ Usuário encontrado:', usuario);
        return { success: true, data: usuario };
        
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        return { success: false, error: error.message };
    }
}

// Função para buscar usuários com filtro
async function buscarUsuariosComFiltro(filtro) {
    console.log('🔍 Buscando usuários com filtro:', filtro);
    
    try {
        // Buscar todos os usuários primeiro
        const response = await fetch(`${baseUrlGet}/users`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const todosUsuarios = await response.json();
        
        // Aplicar filtro localmente
        const usuariosFiltrados = todosUsuarios.filter(usuario => {
            const nome = (usuario.nome || '').toLowerCase();
            const localidade = (usuario.localidade || '').toLowerCase();
            const filtroLower = filtro.toLowerCase();
            
            return nome.includes(filtroLower) || localidade.includes(filtroLower);
        });
        
        console.log(`✅ Filtro aplicado: ${usuariosFiltrados.length} usuários encontrados`);
        
        // Atualizar tabela com resultados filtrados
        atualizarTabelaUsuarios(usuariosFiltrados);
        
        return { success: true, data: usuariosFiltrados };
        
    } catch (error) {
        console.error('❌ Erro ao buscar usuários com filtro:', error);
        
        if (typeof showError === 'function') {
            showError('Erro de Filtro', `Erro ao aplicar filtro: ${error.message}`);
        } else {
            console.error('❌ Funções de toast não disponíveis');
        }
        
        return { success: false, error: error.message };
    }
}

// Função para limpar filtros e mostrar todos os usuários
async function limparFiltros() {
    console.log('🧹 Limpando filtros...');
    
    // Limpar campo de busca
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Buscar todos os usuários
    await buscarUsuarios();
    
    if (typeof showInfo === 'function') {
        showInfo('Filtros Limpos', 'Todos os usuários são exibidos');
    } else {
        console.log('ℹ️ Filtros limpos');
    }
}

// Função para aplicar filtro em tempo real
function aplicarFiltroTempoReal(filtro) {
    if (!filtro || filtro.trim() === '') {
        // Se filtro vazio, mostrar todos
        buscarUsuarios();
        return;
    }
    
    // Aplicar filtro
    buscarUsuariosComFiltro(filtro.trim());
}

// Função para inicializar funcionalidades de busca
function inicializarBusca() {
    const searchInput = document.getElementById('search-input');
    const btnPesquisar = document.getElementById('btn-pesquisar');
    
    if (searchInput) {
        // Busca em tempo real com debounce
        let timeoutId;
        searchInput.addEventListener('input', (event) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                aplicarFiltroTempoReal(event.target.value);
            }, 300);
        });
        
        // Busca ao pressionar Enter
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                aplicarFiltroTempoReal(event.target.value);
            }
        });
        
        console.log('✅ Campo de busca inicializado');
    }
    
    if (btnPesquisar) {
        btnPesquisar.addEventListener('click', () => {
            const filtro = searchInput ? searchInput.value : '';
            aplicarFiltroTempoReal(filtro);
        });
        console.log('✅ Botão de pesquisa conectado');
    }
}

// Função para verificar se o backend está disponível
async function verificarBackend() {
    try {
        const response = await fetch(`${baseUrlGet}/users`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Função para mostrar status de conexão
function mostrarStatusConexao(conectado) {
    const header = document.querySelector('.header-title');
    if (header) {
        if (conectado) {
            header.style.color = '#28a745';
            header.title = 'Conectado ao backend';
        } else {
            header.style.color = '#dc3545';
            header.title = 'Desconectado do backend';
        }
    }
}

// Inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔍 get.js carregado - Inicializando funcionalidades de busca...');
    
    // Verificar conexão com backend
    const backendConectado = await verificarBackend();
    mostrarStatusConexao(backendConectado);
    
    if (backendConectado) {
        console.log('✅ Backend conectado');
        
        // Carregar usuários iniciais
        await buscarUsuarios();
        
        // Inicializar funcionalidades de busca
        inicializarBusca();
        
    } else {
        console.error('❌ Backend não conectado');
        
        if (typeof showError === 'function') {
            showError('Erro de Conexão', 'Não foi possível conectar ao backend. Verifique se o servidor está rodando.');
        } else {
            console.error('❌ Funções de toast não disponíveis');
        }
        
        // Mostrar erro na tabela
        mostrarErroNaTabela('Backend não conectado');
    }
    
    console.log('🎉 Sistema de busca inicializado!');
});

// Exportar funções para uso global
window.buscarUsuarios = buscarUsuarios;
window.buscarUsuarioPorId = buscarUsuarioPorId;
window.buscarUsuariosComFiltro = buscarUsuariosComFiltro;
window.limparFiltros = limparFiltros;
window.editarUsuario = editarUsuario;
window.aplicarFiltroTempoReal = aplicarFiltroTempoReal;
