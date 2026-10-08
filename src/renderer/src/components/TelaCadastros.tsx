import { useCallback, useEffect, useState } from 'react'
import type { CadastroBusca, TipoCadastro } from '../../../shared/types'
import { CADASTROS } from '../cadastros'
import CadastroForm from './CadastroForm'
import ListaCadastros from './ListaCadastros'
import NotasCadastro from './NotasCadastro'

export type Selecao = { tipo: 'nenhum' } | { tipo: 'novo' } | { tipo: 'cadastro'; id: number }

interface Props {
  tipo: TipoCadastro
  // A seleção fica no App para não se perder ao trocar de aba
  selecao: Selecao
  onSelecao: (s: Selecao) => void
  onAbrir: (tipo: TipoCadastro, id: number) => void
}

// Lista + ficha de clientes ou de fornecedores
export default function TelaCadastros({ tipo, selecao, onSelecao, onAbrir }: Props) {
  const textos = CADASTROS[tipo]
  const [busca, setBusca] = useState('')
  const [cadastros, setCadastros] = useState<CadastroBusca[]>([])

  const carregar = useCallback(async () => {
    setCadastros(await textos.api().list(busca))
  }, [textos, busca])

  useEffect(() => {
    const t = setTimeout(carregar, 200)
    return () => clearTimeout(t)
  }, [carregar])

  const selecionado =
    selecao.tipo === 'cadastro' ? cadastros.find((c) => c.id === selecao.id) : undefined

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-72 shrink-0 flex-col border-r border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
        <ListaCadastros
          tipo={tipo}
          busca={busca}
          onBusca={setBusca}
          cadastros={cadastros}
          selecionadoId={selecao.tipo === 'cadastro' ? selecao.id : null}
          onSelecionar={(id) => onSelecao({ tipo: 'cadastro', id })}
          onNovo={() => onSelecao({ tipo: 'novo' })}
        />
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {selecao.tipo === 'nenhum' && (
          <div className="flex h-full items-center justify-center text-center text-base text-slate-500 dark:text-slate-400">
            <p>
              Escolha um {textos.singular} na lista ao lado
              <br />
              ou clique em <strong>“+ {textos.novo}”</strong>.
            </p>
          </div>
        )}

        {selecao.tipo === 'novo' && (
          <CadastroForm
            key="novo"
            tipo={tipo}
            onSalvo={async (c) => {
              setBusca('')
              setCadastros(await textos.api().list(''))
              onSelecao({ tipo: 'cadastro', id: c.id })
            }}
            onCancelar={() => onSelecao({ tipo: 'nenhum' })}
          />
        )}

        {selecionado && (
          <div className="mx-auto max-w-4xl space-y-4">
            <CadastroForm
              key={selecionado.id}
              tipo={tipo}
              cadastro={selecionado}
              onSalvo={carregar}
              onExcluido={async () => {
                onSelecao({ tipo: 'nenhum' })
                await carregar()
              }}
            />
            <NotasCadastro
              key={`notas-${selecionado.id}`}
              tipo={tipo}
              id={selecionado.id}
              onAbrir={onAbrir}
            />
          </div>
        )}
      </main>
    </div>
  )
}
