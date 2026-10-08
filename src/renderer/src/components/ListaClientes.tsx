import { MARCA_FIM, MARCA_INICIO, type ClienteBusca } from '../../../shared/types'
import Botao from './Botao'

interface Props {
  busca: string
  onBusca: (v: string) => void
  clientes: ClienteBusca[]
  selecionadoId: number | null
  onSelecionar: (id: number) => void
  onNovo: () => void
}

export default function ListaClientes({
  busca,
  onBusca,
  clientes,
  selecionadoId,
  onSelecionar,
  onNovo
}: Props) {
  return (
    <>
      <div className="space-y-2 border-b border-slate-200 p-3">
        <Botao className="w-full" onClick={onNovo}>
          + Novo cliente
        </Botao>
        <input
          type="search"
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          placeholder="Buscar por nome, telefone, endereço ou anotação..."
          className="w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-blue-500"
        />
      </div>

      <ul className="flex-1 overflow-y-auto">
        {clientes.length === 0 && (
          <li className="p-3 text-slate-500">
            {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
          </li>
        )}
        {clientes.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onSelecionar(c.id)}
              className={`w-full border-b border-slate-100 px-3 py-2 text-left hover:bg-blue-50 ${
                c.id === selecionadoId ? 'bg-blue-100' : ''
              }`}
            >
              <div className="font-medium">{c.nome}</div>
              {c.telefone && <div className="text-xs text-slate-500">{c.telefone}</div>}
              {c.endereco && <div className="truncate text-xs text-slate-500">{c.endereco}</div>}
              {c.trecho && <Trecho texto={c.trecho} />}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

// Mostra o pedaço da anotação encontrado, destacando as palavras buscadas
function Trecho({ texto }: { texto: string }) {
  const partes = texto.split(new RegExp(`${MARCA_INICIO}(.*?)${MARCA_FIM}`, 'g'))
  return (
    <div className="mt-0.5 line-clamp-2 text-xs text-slate-600">
      <span className="text-slate-400">Anotação: </span>
      {partes.map((parte, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-yellow-200 px-0.5">
            {parte}
          </mark>
        ) : (
          parte
        )
      )}
    </div>
  )
}
