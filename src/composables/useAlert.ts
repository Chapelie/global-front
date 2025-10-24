import { ref, reactive } from 'vue'

interface AlertOptions {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
}

interface AlertState {
  show: boolean
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  showCancel: boolean
  confirmText: string
  cancelText: string
}

const alertState = reactive<AlertState>({
  show: false,
  title: '',
  message: '',
  type: 'info',
  showCancel: false,
  confirmText: 'OK',
  cancelText: 'Annuler'
})

let resolvePromise: ((value: boolean) => void) | null = null

export function useAlert() {
  const showAlert = (options: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolvePromise = resolve
      
      alertState.show = true
      alertState.title = options.title
      alertState.message = options.message
      alertState.type = options.type || 'info'
      alertState.showCancel = options.showCancel || false
      alertState.confirmText = options.confirmText || 'OK'
      alertState.cancelText = options.cancelText || 'Annuler'
    })
  }

  const confirm = () => {
    alertState.show = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }

  const cancel = () => {
    alertState.show = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  const close = () => {
    alertState.show = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  // Méthodes de convenance
  const success = (message: string, title = 'Succès') => {
    return showAlert({ title, message, type: 'success' })
  }

  const error = (message: string, title = 'Erreur') => {
    return showAlert({ title, message, type: 'error' })
  }

  const warning = (message: string, title = 'Attention') => {
    return showAlert({ title, message, type: 'warning' })
  }

  const info = (message: string, title = 'Information') => {
    return showAlert({ title, message, type: 'info' })
  }

  const confirmDialog = (message: string, title = 'Confirmation') => {
    return showAlert({ 
      title, 
      message, 
      type: 'warning', 
      showCancel: true,
      confirmText: 'Confirmer',
      cancelText: 'Annuler'
    })
  }

  return {
    alertState,
    showAlert,
    confirm,
    cancel,
    close,
    success,
    error,
    warning,
    info,
    confirmDialog
  }
}
