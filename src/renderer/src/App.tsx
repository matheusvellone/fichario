import { useCallback, useEffect, useState } from 'react'
import type { ClienteBusca } from '../../shared/types'
import ListaClientes from './components/ListaClientes'
import ClienteForm from './components/ClienteForm'
import Notas from './components/Notas'
import AvisoAtualizacao from './components/AvisoAtualizacao'

type Selecao = { tipo: 'nenhum' } | { tipo: 'novo' } | { tipo: 'cliente'; id: number }

export default function App() {
  const [busca, setBusca] = useState('')
  const [clientes, setClientes] = useState<ClienteBusca[]>([])
  const [selecao, setSelecao] = useState<Selecao>({ tipo: 'nenhum' })
  const [versao, setVersao] = useState('')

  const carregar = useCallback(async () => {
    setClientes(await window.api.clientes.list(busca))
  }, [busca])

  useEffect(() => {
    const t = setTimeout(carregar, 200)
    return () => clearTimeout(t)
  }, [carregar])

  useEffect(() => {
    window.api.appVersion().then(setVersao)
  }, [])

  const clienteSelecionado =
    selecao.tipo === 'cliente' ? clientes.find((c) => c.id === selecao.id) : undefined

  return (
    <div className="flex h-screen">
      <aside className="flex w-72 shrink-0 flex-col border-r border-slate-300 bg-white">
        <ListaClientes
          busca={busca}
          onBusca={setBusca}
          clientes={clientes}
          selecionadoId={selecao.tipo === 'cliente' ? selecao.id : null}
          onSelecionar={(id) => setSelecao({ tipo: 'cliente', id })}
          onNovo={() => setSelecao({ tipo: 'novo' })}
        />
        <p className="border-t border-slate-200 px-3 py-1.5 text-xs text-slate-400">
          Versão {versao}
        </p>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {selecao.tipo === 'nenhum' && (
          <div className="flex h-full items-center justify-center text-center text-base text-slate-500">
            <p>
              Escolha um cliente na lista ao lado
              <br />
              ou clique em <strong>“+ Novo cliente”</strong>.
            </p>
          </div>
        )}

        {selecao.tipo === 'novo' && (
          <ClienteForm
            key="novo"
            onSalvo={async (c) => {
              setBusca('')
              setClientes(await window.api.clientes.list(''))
              setSelecao({ tipo: 'cliente', id: c.id })
            }}
            onCancelar={() => setSelecao({ tipo: 'nenhum' })}
          />
        )}

        {clienteSelecionado && (
          <div className="mx-auto max-w-4xl space-y-4">
            <ClienteForm
              key={clienteSelecionado.id}
              cliente={clienteSelecionado}
              onSalvo={carregar}
              onExcluido={async () => {
                setSelecao({ tipo: 'nenhum' })
                await carregar()
              }}
            />
            <Notas key={`notas-${clienteSelecionado.id}`} clienteId={clienteSelecionado.id} />
          </div>
        )}
      </main>

      <AvisoAtualizacao />
    </div>
  )
}
