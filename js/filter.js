// Sistema de filtros para o gerenciador de usuários
const baseUrlFilter = 'http://localhost:3000';

// Função para aplicar filtro de busca
async function aplicarFiltro(filtro) {
    console.log('🔍 Aplicando filtro:', filtro);
    
    if (!filtro || filtro.trim() === '') {
        // Se filtro vazio, mostrar todos os usuários
        if (typeof buscarUsuarios === 'function') {
            await buscarUsuarios();
        } else {
            console.error('❌ Função buscarUsuarios não encontrada');
        }
        return;
    }
    
    try {
        // Buscar todos os usuários primeiro
        const response = await fetch(`${baseUrlFilter}/users`);
        
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
        if (typeof atualizarTabelaUsuarios === 'function') {
            atualizarTabelaUsuarios(usuariosFiltrados);
        } else {
            console.error('❌ Função atualizarTabelaUsuarios não encontrada');
        }
        
        // Mostrar resultado do filtro
        if (usuariosFiltrados.length === 0) {
            if (typeof showInfo === 'function') {
                showInfo('Nenhum Resultado', `Nenhum usuário encontrado para "${filtro}"`);
            } else {
                console.log('ℹ️ Nenhum usuário encontrado para o filtro');
            }
        } else {
            if (typeof showInfo === 'function') {
                showInfo('Filtro Aplicado', `${usuariosFiltrados.length} usuário(s) encontrado(s) para "${filtro}"`);
            } else {
                console.log(`ℹ️ ${usuariosFiltrados.length} usuário(s) encontrado(s)`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao aplicar filtro:', error);
        
        if (typeof showError === 'function') {
            showError('Erro de Filtro', `Erro ao aplicar filtro: ${error.message}`);
        } else {
            console.error('❌ Funções de toast não disponíveis');
        }
    }
}

// Função para limpar filtros
async function limparFiltros() {
    console.log('🧹 Limpando filtros...');
    
    // Limpar campo de busca
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Buscar todos os usuários
    if (typeof buscarUsuarios === 'function') {
        await buscarUsuarios();
    } else {
        console.error('❌ Função buscarUsuarios não encontrada');
    }
    
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
        if (typeof buscarUsuarios === 'function') {
            buscarUsuarios();
        }
        return;
    }
    
    // Aplicar filtro
    aplicarFiltro(filtro.trim());
}

// Função para inicializar funcionalidades de filtro
function inicializarFiltros() {
    const searchInput = document.getElementById('search-input');
    const btnPesquisar = document.getElementById('btn-pesquisar');
    const btnLimpar = document.querySelector('.btn-clear');
    
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
    
    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            limparFiltros();
        });
        console.log('✅ Botão limpar conectado');
    }
}

// Função para mostrar estatísticas de filtro
function mostrarEstatisticasFiltro(usuarios, filtro) {
    if (!filtro || filtro.trim() === '') {
        return;
    }
    
    const totalUsuarios = usuarios.length;
    const filtroAplicado = filtro.trim();
    
    if (typeof showInfo === 'function') {
        showInfo('Estatísticas do Filtro', 
            `Filtro: "${filtroAplicado}"\n` +
            `Total de usuários: ${totalUsuarios}\n` +
            `Resultados encontrados: ${totalUsuarios}`
        );
    } else {
        console.log(`ℹ️ Filtro "${filtroAplicado}": ${totalUsuarios} usuário(s) encontrado(s)`);
    }
}

// Função para salvar filtro no localStorage
function salvarFiltro(filtro) {
    if (filtro && filtro.trim() !== '') {
        try {
            localStorage.setItem('ultimoFiltro', filtro.trim());
            console.log('💾 Filtro salvo no localStorage:', filtro.trim());
        } catch (error) {
            console.error('❌ Erro ao salvar filtro no localStorage:', error);
        }
    }
}

// Função para carregar último filtro do localStorage
function carregarUltimoFiltro() {
    try {
        const ultimoFiltro = localStorage.getItem('ultimoFiltro');
        if (ultimoFiltro) {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = ultimoFiltro;
                console.log('📂 Último filtro carregado:', ultimoFiltro);
                
                // Aplicar filtro automaticamente
                setTimeout(() => {
                    aplicarFiltro(ultimoFiltro);
                }, 500);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar filtro do localStorage:', error);
    }
}

// Função para limpar filtro salvo
function limparFiltroSalvo() {
    try {
        localStorage.removeItem('ultimoFiltro');
        console.log('🗑️ Filtro salvo removido do localStorage');
    } catch (error) {
        console.error('❌ Erro ao remover filtro do localStorage:', error);
    }
}

// Função para exportar resultados filtrados
function exportarResultadosFiltrados(usuarios, filtro) {
    if (!usuarios || usuarios.length === 0) {
        if (typeof showWarning === 'function') {
            showWarning('Exportação', 'Nenhum usuário para exportar');
        } else {
            console.warn('⚠️ Nenhum usuário para exportar');
        }
        return;
    }
    
    try {
        const dados = usuarios.map(usuario => ({
            ID: usuario.id,
            Nome: usuario.nome,
            Idade: usuario.idade,
            CEP: usuario.cep,
            Localidade: usuario.localidade,
            UF: usuario.uf,
            Bairro: usuario.bairro,
            Logradouro: usuario.logradouro,
            Número: usuario.numero
        }));
        
        const csv = [
            Object.keys(dados[0]).join(','),
            ...dados.map(row => Object.values(row).map(value => `"${value || ''}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `usuarios_filtro_${filtro || 'todos'}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (typeof showSuccess === 'function') {
            showSuccess('Exportação', `${usuarios.length} usuário(s) exportado(s) com sucesso!`);
        } else {
            console.log(`✅ ${usuarios.length} usuário(s) exportado(s)`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao exportar resultados:', error);
        
        if (typeof showError === 'function') {
            showError('Erro de Exportação', `Erro ao exportar resultados: ${error.message}`);
        } else {
            console.error('❌ Funções de toast não disponíveis');
        }
    }
}

// Inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 filter.js carregado - Inicializando sistema de filtros...');
    
    // Aguardar um momento para garantir que outros módulos carregaram
    setTimeout(() => {
        inicializarFiltros();
        
        // Carregar último filtro se existir
        carregarUltimoFiltro();
        
        console.log('🎉 Sistema de filtros inicializado!');
    }, 100);
});

// Exportar funções para uso global
window.aplicarFiltro = aplicarFiltro;
window.limparFiltros = limparFiltros;
window.aplicarFiltroTempoReal = aplicarFiltroTempoReal;
window.mostrarEstatisticasFiltro = mostrarEstatisticasFiltro;
window.salvarFiltro = salvarFiltro;
window.carregarUltimoFiltro = carregarUltimoFiltro;
window.limparFiltroSalvo = limparFiltroSalvo;
window.exportarResultadosFiltrados = exportarResultadosFiltrados;
