import { useEffect, useState, type ReactNode } from 'react'
import type { TipoCadastro } from '../../shared/types'
import { CADASTROS } from './cadastros'
import TelaCadastros, { type Selecao } from './components/TelaCadastros'
import TelaNotas from './components/TelaNotas'
import AvisoAtualizacao from './components/AvisoAtualizacao'
import { useTema } from './tema'

type Aba = TipoCadastro | 'notas'

export default function App() {
  const [aba, setAba] = useState<Aba>('cliente')
  const [selecoes, setSelecoes] = useState<Record<TipoCadastro, Selecao>>({
    cliente: { tipo: 'nenhum' },
    fornecedor: { tipo: 'nenhum' }
  })
  const [versao, setVersao] = useState('')
  const [tema, alternarTema] = useTema()

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
      <header className="flex items-center gap-1 border-b border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 pt-2">
        {(['cliente', 'fornecedor'] as const).map((tipo) => (
          <AbaBotao key={tipo} ativa={aba === tipo} onClick={() => setAba(tipo)}>
            {CADASTROS[tipo].plural}
          </AbaBotao>
        ))}
        <AbaBotao ativa={aba === 'notas'} onClick={() => setAba('notas')}>
          Notas
        </AbaBotao>
        <button
          onClick={alternarTema}
          title={tema === 'escuro' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
          className="mb-1.5 ml-auto rounded-md px-2 py-1 text-base leading-none text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          {tema === 'escuro' ? '☀️' : '🌙'}
        </button>
        <span className="pb-2 pl-2 text-xs text-slate-400 dark:text-slate-500">Versão {versao}</span>
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
          ? 'border-slate-300 dark:border-slate-600 border-b-white dark:border-b-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'
          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}
