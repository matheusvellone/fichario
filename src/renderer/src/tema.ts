import { useState } from 'react'

export type Tema = 'claro' | 'escuro'

const CHAVE = 'tema'

function temaInicial(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo === 'claro' || salvo === 'escuro') return salvo
  } catch {
    // sem localStorage, segue a preferência do sistema
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
}

function aplicar(tema: Tema): void {
  document.documentElement.classList.toggle('dark', tema === 'escuro')
}

// Aplica antes do primeiro render para não piscar o tema claro
aplicar(temaInicial())

export function useTema(): [Tema, () => void] {
  const [tema, setTema] = useState<Tema>(temaInicial)

  const alternar = (): void => {
    const novo: Tema = tema === 'escuro' ? 'claro' : 'escuro'
    aplicar(novo)
    try {
      localStorage.setItem(CHAVE, novo)
    } catch {
      // ignora: o tema só não fica salvo
    }
    setTema(novo)
  }

  return [tema, alternar]
}
