// Arquivo principal que coordena todas as funcionalidades
console.log('🚀 script.js carregado - Inicializando sistema principal...');

// Variáveis globais
let usuariosAtuais = [];
let filtroAtivo = '';

// Função para inicializar o sistema
async function inicializarSistema() {
    console.log('🔧 Inicializando sistema principal...');
    
    try {
        // Verificar se o backend está disponível
        const backendConectado = await verificarBackend();
        
        if (backendConectado) {
            console.log('✅ Backend conectado, inicializando funcionalidades...');
            
            // Carregar usuários iniciais
            if (typeof buscarUsuarios === 'function') {
                await buscarUsuarios();
            } else {
                console.error('❌ Função buscarUsuarios não encontrada');
            }
            
            // Inicializar funcionalidades de busca
            if (typeof inicializarBusca === 'function') {
                inicializarBusca();
            } else {
                console.error('❌ Função inicializarBusca não encontrada');
            }
            
            // Inicializar funcionalidades de filtro
            if (typeof inicializarFiltros === 'function') {
                inicializarFiltros();
            } else {
                console.error('❌ Função inicializarFiltros não encontrada');
            }
            
            // Mostrar mensagem de sucesso
            if (typeof showSuccess === 'function') {
                showSuccess('Sistema Inicializado', 'Gerenciador de usuários carregado com sucesso!');
            } else {
                console.log('✅ Sistema inicializado com sucesso');
            }
            
        } else {
            console.error('❌ Backend não conectado');
            
            if (typeof showError === 'function') {
                showError('Erro de Conexão', 'Não foi possível conectar ao backend. Verifique se o servidor está rodando.');
            } else {
                console.error('❌ Funções de toast não disponíveis');
            }
        }
        
    } catch (error) {
        console.error('❌ Erro na inicialização do sistema:', error);
        
        if (typeof showError === 'function') {
            showError('Erro de Inicialização', `Erro ao inicializar sistema: ${error.message}`);
        } else {
            console.error('❌ Funções de toast não disponíveis');
        }
    }
}

// Função para verificar se o backend está disponível
async function verificarBackend() {
    try {
        const response = await fetch('http://localhost:3000/users');
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

// Função para atualizar status de conexão periodicamente
function iniciarMonitoramentoConexao() {
    setInterval(async () => {
        const conectado = await verificarBackend();
        mostrarStatusConexao(conectado);
        
        if (!conectado && usuariosAtuais.length > 0) {
            if (typeof showWarning === 'function') {
                showWarning('Conexão Perdida', 'Conexão com o backend foi perdida. Algumas funcionalidades podem não funcionar.');
            } else {
                console.warn('⚠️ Conexão com backend perdida');
            }
        }
    }, 30000); // Verificar a cada 30 segundos
}

// Função para mostrar estatísticas do sistema
function mostrarEstatisticasSistema() {
    const totalUsuarios = usuariosAtuais.length;
    const filtroAtivo = document.getElementById('search-input')?.value || '';
    
    if (typeof showInfo === 'function') {
        showInfo('Estatísticas do Sistema', 
            `Total de usuários: ${totalUsuarios}\n` +
            `Filtro ativo: ${filtroAtivo || 'Nenhum'}\n` +
            `Backend: ${verificarBackend() ? 'Conectado' : 'Desconectado'}`
        );
    } else {
        console.log(`ℹ️ Estatísticas: ${totalUsuarios} usuários, filtro: ${filtroAtivo || 'nenhum'}`);
    }
}

// Função para limpar todos os dados
function limparTodosDados() {
    if (typeof showWarning === 'function') {
        showWarning('Limpeza de Dados', 'Esta ação limpará todos os dados locais. Deseja continuar?');
    } else {
        console.warn('⚠️ Limpeza de dados solicitada');
    }
    
    // Limpar filtros
    if (typeof limparFiltros === 'function') {
        limparFiltros();
    }
    
    // Limpar localStorage
    try {
        localStorage.clear();
        console.log('🗑️ localStorage limpo');
    } catch (error) {
        console.error('❌ Erro ao limpar localStorage:', error);
    }
    
    // Recarregar usuários
    if (typeof buscarUsuarios === 'function') {
        setTimeout(() => buscarUsuarios(), 500);
    }
    
    if (typeof showSuccess === 'function') {
        showSuccess('Dados Limpos', 'Todos os dados locais foram limpos com sucesso!');
    } else {
        console.log('✅ Dados limpos com sucesso');
    }
}

// Função para exportar todos os usuários
function exportarTodosUsuarios() {
    if (usuariosAtuais.length === 0) {
        if (typeof showWarning === 'function') {
            showWarning('Exportação', 'Nenhum usuário para exportar');
        } else {
            console.warn('⚠️ Nenhum usuário para exportar');
        }
        return;
    }
    
    try {
        const dados = usuariosAtuais.map(usuario => ({
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
        link.setAttribute('download', `todos_usuarios_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (typeof showSuccess === 'function') {
            showSuccess('Exportação', `${usuariosAtuais.length} usuário(s) exportado(s) com sucesso!`);
        } else {
            console.log(`✅ ${usuariosAtuais.length} usuário(s) exportado(s)`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao exportar usuários:', error);
        
        if (typeof showError === 'function') {
            showError('Erro de Exportação', `Erro ao exportar usuários: ${error.message}`);
        } else {
            console.error('❌ Funções de toast não disponíveis');
        }
    }
}

// Função para recarregar sistema
async function recarregarSistema() {
    console.log('🔄 Recarregando sistema...');
    
    if (typeof showInfo === 'function') {
        showInfo('Recarregando', 'Sistema está sendo recarregado...');
    } else {
        console.log('ℹ️ Recarregando sistema...');
    }
    
    try {
        // Limpar dados atuais
        usuariosAtuais = [];
        filtroAtivo = '';
        
        // Recarregar usuários
        if (typeof buscarUsuarios === 'function') {
            await buscarUsuarios();
        }
        
        // Limpar filtros
        if (typeof limparFiltros === 'function') {
            limparFiltros();
        }
        
        if (typeof showSuccess === 'function') {
            showSuccess('Sistema Recarregado', 'Sistema foi recarregado com sucesso!');
        } else {
            console.log('✅ Sistema recarregado com sucesso');
        }
        
    } catch (error) {
        console.error('❌ Erro ao recarregar sistema:', error);
        
        if (typeof showError === 'function') {
            showError('Erro de Recarga', `Erro ao recarregar sistema: ${error.message}`);
        } else {
            console.error('❌ Funções de toast não disponíveis');
        }
    }
}

// Função para mostrar ajuda do sistema
function mostrarAjuda() {
    const ajuda = `
🎯 **Gerenciador de Usuários - Ajuda**

📝 **Criar Usuário:**
• Clique no botão "+" para abrir o modal
• Preencha todos os campos obrigatórios
• Clique em "Criar Usuário"

✏️ **Editar Usuário:**
• Clique no botão "✏️" na linha do usuário
• Modifique os campos desejados
• Clique em "Atualizar Usuário"

🗑️ **Deletar Usuário:**
• Clique no botão "🗑️" na linha do usuário
• Confirme a ação no modal

🔍 **Pesquisar:**
• Digite no campo de busca
• Pesquisa em tempo real por nome ou localidade
• Use o botão "Limpar" para remover filtros

📊 **Funcionalidades:**
• Exportar dados em CSV
• Filtros inteligentes
• Validação de campos
• Interface responsiva

⌨️ **Atalhos:**
• ESC: Fechar modais
• Enter: Aplicar filtro de busca
    `;
    
    if (typeof showInfo === 'function') {
        showInfo('Ajuda do Sistema', ajuda);
    } else {
        console.log('ℹ️ Ajuda do sistema:', ajuda);
    }
}

// Função para verificar integridade dos dados
function verificarIntegridadeDados() {
    const problemas = [];
    
    usuariosAtuais.forEach((usuario, index) => {
        if (!usuario.id) problemas.push(`Usuário ${index + 1}: ID ausente`);
        if (!usuario.nome) problemas.push(`Usuário ${index + 1}: Nome ausente`);
        if (!usuario.localidade) problemas.push(`Usuário ${index + 1}: Localidade ausente`);
    });
    
    if (problemas.length === 0) {
        if (typeof showSuccess === 'function') {
            showSuccess('Integridade OK', 'Todos os dados estão íntegros!');
        } else {
            console.log('✅ Dados íntegros');
        }
    } else {
        if (typeof showWarning === 'function') {
            showWarning('Problemas Encontrados', `Encontrados ${problemas.length} problema(s):\n${problemas.join('\n')}`);
        } else {
            console.warn('⚠️ Problemas encontrados:', problemas);
        }
    }
}

// Inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 DOM carregado, iniciando sistema...');
    
    // Aguardar carregamento dos outros módulos
    setTimeout(async () => {
        await inicializarSistema();
        
        // Iniciar monitoramento de conexão
        iniciarMonitoramentoConexao();
        
        console.log('🎉 Sistema principal inicializado com sucesso!');
    }, 200);
});

// Exportar funções para uso global
window.inicializarSistema = inicializarSistema;
window.verificarBackend = verificarBackend;
window.mostrarStatusConexao = mostrarStatusConexao;
window.mostrarEstatisticasSistema = mostrarEstatisticasSistema;
window.limparTodosDados = limparTodosDados;
window.exportarTodosUsuarios = exportarTodosUsuarios;
window.recarregarSistema = recarregarSistema;
window.mostrarAjuda = mostrarAjuda;
window.verificarIntegridadeDados = verificarIntegridadeDados;
