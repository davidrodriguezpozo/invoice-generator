<template>
  <div class="space-y-2">
    <label class="flex items-center gap-2 text-xs font-medium text-gray-500">
      {{ t('logo') }}
      <span class="text-gray-400 font-normal">({{ t('recommendedSize') }})</span>
    </label>

    <!-- Upload Area -->
    <div
      v-if="!logo"
      class="relative group"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <label
        for="logo-upload"
        :class="[
          'flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        ]"
      >
        <div :class="[
          'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
          isDragging ? 'bg-primary-100' : 'bg-gray-100 group-hover:bg-gray-200'
        ]">
          <svg :class="['w-6 h-6', isDragging ? 'text-primary-600' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="text-center">
          <span :class="['text-sm font-medium', isDragging ? 'text-primary-600' : 'text-gray-600']">
            {{ t('dragDropLogo') }}
          </span>
        </div>
      </label>
      <input
        id="logo-upload"
        type="file"
        accept="image/*"
        @change="handleFileInput"
        class="hidden"
      />
    </div>

    <!-- Logo Preview -->
    <div v-else class="relative group">
      <div class="border border-gray-200 rounded-xl p-3 bg-white">
        <img
          :src="logo"
          alt="Company logo"
          class="w-full h-16 object-contain"
        />
      </div>

      <!-- Hover Overlay -->
      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
        <label
          for="logo-upload-change"
          class="p-2.5 bg-white rounded-lg hover:bg-gray-100 cursor-pointer transition-colors shadow-lg"
          :title="t('changeLogo')"
        >
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </label>
        <button
          @click="handleRemove"
          class="p-2.5 bg-white rounded-lg hover:bg-red-50 transition-colors shadow-lg"
          :title="t('removeLogo')"
        >
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <input
        id="logo-upload-change"
        type="file"
        accept="image/*"
        @change="handleFileInput"
        class="hidden"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useInvoice } from '../composables/useInvoice'
import { useTranslations } from '../composables/useTranslations'

const { invoice, setLogo, removeLogo } = useInvoice()
const { t } = useTranslations()

const isDragging = ref(false)

const logo = computed(() => invoice.value.logo)

const compressImage = (
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedDataUrl)
    }

    img.src = URL.createObjectURL(file)
  })
}

const processFile = async (file: File) => {
  if (file && file.type.startsWith('image/')) {
    try {
      const compressedLogo = await compressImage(file, 200, 200, 0.8)
      setLogo(compressedLogo)
    } catch (error) {
      console.error('Error compressing image:', error)
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoData = e.target?.result as string
        setLogo(logoData)
      }
      reader.readAsDataURL(file)
    }
  }
}

const handleFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleRemove = () => {
  removeLogo()
  // Reset file inputs
  const inputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>
  inputs.forEach(input => input.value = '')
}
</script>
