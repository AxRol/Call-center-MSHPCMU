import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const isMobile   = ref(false)
const isOpen     = ref(true)   // desktop: ouvert par défaut

function checkMobile() {
  const mobile = window.innerWidth < 768
  if (mobile !== isMobile.value) {
    isMobile.value = mobile
    // Sur mobile fermer automatiquement, sur desktop rouvrir
    isOpen.value = !mobile
  }
}

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  if (isMobile.value) isOpen.value = false
}

// Indique si le contenu principal doit décaler (desktop ouvert uniquement)
const mainShift = computed(() => !isMobile.value && isOpen.value)

let _mounted = false
function init() {
  if (_mounted) return
  _mounted = true
  checkMobile()
  window.addEventListener('resize', checkMobile)
}

export function useSidebar() {
  return { isOpen, isMobile, mainShift, toggle, close, init }
}
