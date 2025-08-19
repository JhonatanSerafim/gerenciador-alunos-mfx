// Sistema de Toast para substituir os alerts
class ToastSystem {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toasts = [];
        this.counter = 0;
    }

    // Mostrar toast
    show(type, title, message, duration = 5000) {
        const toast = this.createToast(type, title, message);
        this.container.appendChild(toast);
        
        // Adicionar à lista de toasts ativos
        this.toasts.push(toast);
        
        // Auto-remover após o tempo especificado
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }
        
        // Retornar o toast para controle manual
        return toast;
    }

    // Criar elemento toast
    createToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = `toast-${++this.counter}`;
        
        // Ícone baseado no tipo
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="toastSystem.removeToast(this.parentElement)">×</button>
        `;
        
        return toast;
    }

    // Obter ícone baseado no tipo
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // Remover toast específico
    removeToast(toast) {
        if (toast && toast.parentNode) {
            // Adicionar classe para animação de saída
            toast.classList.add('fade-out');
            
            // Remover após a animação
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                    // Remover da lista
                    const index = this.toasts.indexOf(toast);
                    if (index > -1) {
                        this.toasts.splice(index, 1);
                    }
                }
            }, 300);
        }
    }

    // Remover todos os toasts
    clearAll() {
        this.toasts.forEach(toast => {
            this.removeToast(toast);
        });
    }

    // Métodos de conveniência para diferentes tipos
    success(title, message, duration) {
        return this.show('success', title, message, duration);
    }

    error(title, message, duration) {
        return this.show('error', title, message, duration);
    }

    warning(title, message, duration) {
        return this.show('warning', title, message, duration);
    }

    info(title, message, duration) {
        return this.show('info', title, message, duration);
    }

    // Toast de sucesso para operações CRUD
    crudSuccess(operation, entity = 'usuário') {
        const messages = {
            create: `${entity} criado com sucesso!`,
            update: `${entity} atualizado com sucesso!`,
            delete: `${entity} deletado com sucesso!`,
            read: `${entity}s carregados com sucesso!`
        };
        
        return this.success('Sucesso!', messages[operation] || 'Operação realizada com sucesso!');
    }

    // Toast de erro para operações CRUD
    crudError(operation, error = 'Erro desconhecido', entity = 'usuário') {
        const titles = {
            create: `Erro ao criar ${entity}`,
            update: `Erro ao atualizar ${entity}`,
            delete: `Erro ao deletar ${entity}`,
            read: `Erro ao carregar ${entity}s`
        };
        
        return this.error(titles[operation] || 'Erro', error);
    }

    // Toast de validação
    validationError(field, message) {
        return this.error('Erro de Validação', `${field}: ${message}`);
    }

    // Toast de campos obrigatórios
    requiredFieldsError(fields) {
        const fieldList = Array.isArray(fields) ? fields.join(', ') : fields;
        return this.error('Campos Obrigatórios', `Os seguintes campos são obrigatórios: ${fieldList}`);
    }
}

// Instância global do sistema de toast
const toastSystem = new ToastSystem();

// Funções de conveniência para uso global
window.showToast = (type, title, message, duration) => toastSystem.show(type, title, message, duration);
window.showSuccess = (title, message, duration) => toastSystem.success(title, message, duration);
window.showError = (title, message, duration) => toastSystem.error(title, message, duration);
window.showWarning = (title, message, duration) => toastSystem.warning(title, message, duration);
window.showInfo = (title, message, duration) => toastSystem.info(title, message, duration);

// Funções específicas para CRUD
window.showCrudSuccess = (operation, entity) => toastSystem.crudSuccess(operation, entity);
window.showCrudError = (operation, error, entity) => toastSystem.crudError(operation, error, entity);
window.showValidationError = (field, message) => toastSystem.validationError(field, message);
window.showRequiredFieldsError = (fields) => toastSystem.requiredFieldsError(fields);

// Inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🍞 Sistema de toast carregado e disponível');
});

// Exportar para uso em outros módulos
window.toastSystem = toastSystem;
