import { useEffect, useState, type ReactNode } from 'react'
import type { TipoCadastro } from '../../shared/types'
import { CADASTROS } from './cadastros'
import TelaCadastros, { type Selecao } from './components/TelaCadastros'
import TelaNotas from './components/TelaNotas'
import AvisoAtualizacao from './components/AvisoAtualizacao'

type Aba = TipoCadastro | 'notas'

export default function App() {
  const [aba, setAba] = useState<Aba>('cliente')
  const [selecoes, setSelecoes] = useState<Record<TipoCadastro, Selecao>>({
    cliente: { tipo: 'nenhum' },
    fornecedor: { tipo: 'nenhum' }
  })
  const [versao, setVersao] = useState('')

  useEffect(() => {
    window.api.appVersion().then(setVersao)
  }, [])

  const selecionar = (tipo: TipoCadastro, selecao: Selecao): void =>
    setSelecoes((atual) => ({ ...atual, [tipo]: selecao }))

  // Abre a ficha de um cliente/fornecedor a partir de uma nota
  const abrir = (tipo: TipoCadastro, id: number): void => {
    selecionar(tipo, { tipo: 'cadastro', id })
    setAba(tipo)
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-1 border-b border-slate-300 bg-white px-3 pt-2">
        {(['cliente', 'fornecedor'] as const).map((tipo) => (
          <AbaBotao key={tipo} ativa={aba === tipo} onClick={() => setAba(tipo)}>
            {CADASTROS[tipo].plural}
          </AbaBotao>
        ))}
        <AbaBotao ativa={aba === 'notas'} onClick={() => setAba('notas')}>
          Notas
        </AbaBotao>
        <span className="ml-auto pb-2 text-xs text-slate-400">Versão {versao}</span>
      </header>

      {aba === 'notas' ? (
        <main className="flex-1 overflow-y-auto p-6">
          <TelaNotas onAbrir={abrir} />
        </main>
      ) : (
        <TelaCadastros
          key={aba}
          tipo={aba}
          selecao={selecoes[aba]}
          onSelecao={(s) => selecionar(aba, s)}
          onAbrir={abrir}
        />
      )}

      <AvisoAtualizacao />
    </div>
  )
}

function AbaBotao({
  ativa,
  onClick,
  children
}: {
  ativa: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px rounded-t-md border px-4 py-1.5 font-medium ${
        ativa
          ? 'border-slate-300 border-b-white bg-white text-slate-900'
          : 'border-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  )
}
