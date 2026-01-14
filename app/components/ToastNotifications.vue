<template>
  <!-- Toast Container -->
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto max-w-sm',
            toastClasses[toast.type]
          ]"
          role="alert"
          :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        >
          <!-- Icon -->
          <div :class="iconBgClasses[toast.type]" class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
            <svg v-if="toast.type === 'success'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="toast.type === 'error'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else-if="toast.type === 'warning'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Message -->
          <span class="flex-1">{{ toast.message }}</span>

          <!-- Close Button -->
          <button
            @click="removeToast(toast.id)"
            class="p-1 rounded-lg hover:bg-black/10 transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- Auto-save Indicator -->
    <Transition name="fade">
      <div
        v-if="showSavedIndicator"
        class="fixed bottom-4 left-4 z-[100] flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-600 shadow-sm"
      >
        <svg class="w-3.5 h-3.5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
        <span>Saved</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, showSavedIndicator, removeToast } = useToast()

const toastClasses = {
  success: 'bg-gray-900 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-primary-600 text-white',
}

const iconBgClasses = {
  success: 'bg-success-500 text-white',
  error: 'bg-white/20 text-white',
  warning: 'bg-white/20 text-white',
  info: 'bg-white/20 text-white',
}
</script>

<style scoped>
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.2s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
