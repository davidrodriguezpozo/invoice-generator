import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<Toast[]>([])
const showSavedIndicator = ref(false)

export function useToast() {
  const showToast = (message: string, type: Toast['type'] = 'success', duration: number = 3000) => {
    const id = uuidv4()
    toasts.value.push({ id, message, type, duration })

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)

    return id
  }

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const showSaved = () => {
    showSavedIndicator.value = true
    setTimeout(() => {
      showSavedIndicator.value = false
    }, 1500)
  }

  const success = (message: string, duration?: number) => showToast(message, 'success', duration)
  const error = (message: string, duration?: number) => showToast(message, 'error', duration)
  const info = (message: string, duration?: number) => showToast(message, 'info', duration)
  const warning = (message: string, duration?: number) => showToast(message, 'warning', duration)

  return {
    toasts,
    showSavedIndicator,
    showToast,
    removeToast,
    showSaved,
    success,
    error,
    info,
    warning,
  }
}
