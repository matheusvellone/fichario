import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'perigo'
type Tamanho = 'normal' | 'pequeno'

const estilos: Record<Variante, string> = {
  primario: 'bg-blue-600 text-white hover:bg-blue-700',
  secundario: 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50',
  perigo: 'bg-white text-red-700 border border-red-300 hover:bg-red-50'
}

const tamanhos: Record<Tamanho, string> = {
  normal: 'px-3 py-1.5',
  pequeno: 'px-2 py-0.5 text-xs'
}

export default function Botao({
  variante = 'primario',
  tamanho = 'normal',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; tamanho?: Tamanho }) {
  return (
    <button
      {...props}
      className={`rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tamanhos[tamanho]} ${estilos[variante]} ${className}`}
    />
  )
}
