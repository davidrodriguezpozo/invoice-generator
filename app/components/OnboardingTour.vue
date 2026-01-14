<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[100]">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60" />

        <!-- Modal -->
        <div class="absolute inset-0 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <!-- Progress -->
            <div class="h-1 bg-gray-100">
              <div
                class="h-full bg-primary-600 transition-all duration-300"
                :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"
              />
            </div>

            <!-- Content -->
            <div class="p-8">
              <!-- Welcome Screen -->
              <div v-if="currentStep === 0" class="text-center">
                <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-100 flex items-center justify-center">
                  <svg class="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-3">{{ t('welcome') }}</h2>
                <p class="text-gray-600 mb-8">Create professional invoices in minutes. Let us show you how it works.</p>
              </div>

              <!-- Step Content -->
              <div v-else class="text-center">
                <div :class="['w-16 h-16 mx-auto mb-5 rounded-xl flex items-center justify-center', steps[currentStep].bgColor]">
                  <component :is="steps[currentStep].icon" :class="['w-8 h-8', steps[currentStep].iconColor]" />
                </div>
                <div class="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
                  Step {{ currentStep }} of {{ steps.length - 1 }}
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ steps[currentStep].title }}</h3>
                <p class="text-gray-600">{{ steps[currentStep].description }}</p>
              </div>

              <!-- Step Indicators -->
              <div class="flex items-center justify-center gap-2 mt-8 mb-6">
                <div
                  v-for="(_, index) in steps"
                  :key="index"
                  :class="[
                    'w-2 h-2 rounded-full transition-all',
                    index === currentStep ? 'w-8 bg-primary-600' : 'bg-gray-200'
                  ]"
                />
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between">
                <button
                  v-if="currentStep > 0"
                  @click="previousStep"
                  class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {{ t('previous') }}
                </button>
                <button
                  v-else
                  @click="skip"
                  class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {{ t('skipTour') }}
                </button>

                <button
                  v-if="currentStep < steps.length - 1"
                  @click="nextStep"
                  class="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {{ currentStep === 0 ? t('getStarted') : t('next') }}
                </button>
                <button
                  v-else
                  @click="finish"
                  class="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {{ t('finish') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { useInvoice } from '../composables/useInvoice'
import { useTranslations } from '../composables/useTranslations'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { completeOnboarding } = useInvoice()
const { t } = useTranslations()

const currentStep = ref(0)

// Icon components as render functions
const BuildingIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.5', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' })
])

const UserIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.5', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
])

const ListIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.5', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' })
])

const DownloadIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.5', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' })
])

const steps = [
  {
    title: '',
    description: '',
    icon: null,
    bgColor: '',
    iconColor: ''
  },
  {
    title: t.value('onboardingStep1Title'),
    description: t.value('onboardingStep1Desc'),
    icon: BuildingIcon,
    bgColor: 'bg-primary-100',
    iconColor: 'text-primary-600'
  },
  {
    title: t.value('onboardingStep2Title'),
    description: t.value('onboardingStep2Desc'),
    icon: UserIcon,
    bgColor: 'bg-success-100',
    iconColor: 'text-success-600'
  },
  {
    title: t.value('onboardingStep3Title'),
    description: t.value('onboardingStep3Desc'),
    icon: ListIcon,
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  {
    title: t.value('onboardingStep4Title'),
    description: t.value('onboardingStep4Desc'),
    icon: DownloadIcon,
    bgColor: 'bg-violet-100',
    iconColor: 'text-violet-600'
  }
]

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const skip = () => {
  completeOnboarding()
  emit('close')
}

const finish = () => {
  completeOnboarding()
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
