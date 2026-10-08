import { useState } from 'react'
import type { Nota, TipoCadastro } from '../../../shared/types'
import { formatarDia, formatarMoeda } from '../format'
import Botao from './Botao'
import Confirmar from './Confirmar'
import NotaForm from './NotaForm'

interface Props {
  notas: Nota[]
  vazio: string
  // Dentro da tela de um cliente/fornecedor não repete o nome dele em cada nota
  contexto?: TipoCadastro
  onAbrir: (tipo: TipoCadastro, id: number) => void
  onMudou: () => void
}

export default function ListaNotas({ notas, vazio, contexto, onAbrir, onMudou }: Props) {
  const [editando, setEditando] = useState<Nota | null>(null)
  const [excluindo, setExcluindo] = useState<Nota | null>(null)

  async function excluir() {
    if (!excluindo) return
    await window.api.notas.remove(excluindo.id)
    setExcluindo(null)
    onMudou()
  }

  if (notas.length === 0) return <p className="text-slate-500 dark:text-slate-400">{vazio}</p>

  return (
    <>
      <ul className="divide-y divide-slate-100 dark:divide-slate-700 rounded-md border border-slate-200 dark:border-slate-700">
        {notas.map((n) => (
          <li key={n.id} className="flex items-center gap-3 px-3 py-2">
            <span className="w-20 shrink-0 text-slate-500 dark:text-slate-400">{formatarDia(n.data)}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate">
                {n.descricao || (n.tipo === 'entrada' ? 'Dinheiro recebido' : 'Conta paga')}
              </div>
              <div className="flex gap-3 text-xs">
                {contexto !== 'cliente' && n.cliente_id !== null && (
                  <Vinculo
                    rotulo="Cliente"
                    nome={n.cliente_nome}
                    excluido={n.cliente_excluido_em !== null}
                    onAbrir={() => onAbrir('cliente', n.cliente_id!)}
                  />
                )}
                {contexto !== 'fornecedor' && n.fornecedor_id !== null && (
                  <Vinculo
                    rotulo="Fornecedor"
                    nome={n.fornecedor_nome}
                    excluido={n.fornecedor_excluido_em !== null}
                    onAbrir={() => onAbrir('fornecedor', n.fornecedor_id!)}
                  />
                )}
              </div>
            </div>
            <span
              className={`shrink-0 font-semibold ${n.tipo === 'entrada' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
            >
              {n.tipo === 'entrada' ? '+ ' : '− '}
              {formatarMoeda(n.valor_centavos)}
            </span>
            <div className="flex shrink-0 gap-1">
              <Botao tamanho="pequeno" variante="secundario" onClick={() => setEditando(n)}>
                Editar
              </Botao>
              <Botao tamanho="pequeno" variante="perigo" onClick={() => setExcluindo(n)}>
                Excluir
              </Botao>
            </div>
          </li>
        ))}
      </ul>

      {editando && (
        <NotaForm
          nota={editando}
          tipo={editando.tipo}
          clienteId={editando.cliente_id}
          fornecedorId={editando.fornecedor_id}
          escolherFornecedor={contexto !== 'fornecedor'}
          onSalvo={() => {
            setEditando(null)
            onMudou()
          }}
          onCancelar={() => setEditando(null)}
        />
      )}

      {excluindo && (
        <Confirmar
          mensagem={`Excluir "${excluindo.descricao || formatarMoeda(excluindo.valor_centavos)}" de ${formatarDia(excluindo.data)}? Isso não pode ser desfeito.`}
          textoConfirmar="Sim, excluir"
          onConfirmar={excluir}
          onCancelar={() => setExcluindo(null)}
        />
      )}
    </>
  )
}

// Nome do cliente/fornecedor da nota; vira link para a ficha, exceto se ele foi excluído
function Vinculo({
  rotulo,
  nome,
  excluido,
  onAbrir
}: {
  rotulo: string
  nome: string | null
  excluido: boolean
  onAbrir: () => void
}) {
  if (excluido) {
    return (
      <span className="text-slate-500 dark:text-slate-400">
        {rotulo}: {nome} (excluído)
      </span>
    )
  }
  return (
    <button onClick={onAbrir} className="text-blue-700 dark:text-blue-400 hover:underline">
      {rotulo}: {nome}
    </button>
  )
}
