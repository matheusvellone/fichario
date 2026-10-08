import { useEffect } from 'react'

// Chama `fechar` quando a pessoa aperta Esc (usado nas janelas sobrepostas)
export function useEsc(fechar: () => void): void {
  useEffect(() => {
    const aoApertar = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') fechar()
    }
    window.addEventListener('keydown', aoApertar)
    return () => window.removeEventListener('keydown', aoApertar)
  }, [fechar])
}
