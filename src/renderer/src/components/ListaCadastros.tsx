import {
  MARCA_FIM,
  MARCA_INICIO,
  type CadastroBusca,
  type TipoCadastro
} from '../../../shared/types'
import { CADASTROS } from '../cadastros'
import Botao from './Botao'

interface Props {
  tipo: TipoCadastro
  busca: string
  onBusca: (v: string) => void
  cadastros: CadastroBusca[]
  selecionadoId: number | null
  onSelecionar: (id: number) => void
  onNovo: () => void
}

export default function ListaCadastros({
  tipo,
  busca,
  onBusca,
  cadastros,
  selecionadoId,
  onSelecionar,
  onNovo
}: Props) {
  const textos = CADASTROS[tipo]
  return (
    <>
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-700 p-3">
        <Botao className="w-full" onClick={onNovo}>
          + {textos.novo}
        </Botao>
        <input
          type="search"
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          placeholder={textos.exemploBusca}
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 outline-none focus:border-blue-500"
        />
      </div>

      <ul className="flex-1 overflow-y-auto">
        {cadastros.length === 0 && (
          <li className="p-3 text-slate-500 dark:text-slate-400">
            {busca
              ? `Nenhum ${textos.singular} encontrado.`
              : `Nenhum ${textos.singular} cadastrado ainda.`}
          </li>
        )}
        {cadastros.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onSelecionar(c.id)}
              className={`w-full border-b border-slate-100 dark:border-slate-700 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-700 ${
                c.id === selecionadoId ? 'bg-blue-100 dark:bg-blue-900/50' : ''
              }`}
            >
              <div className="font-medium">{c.nome}</div>
              {c.telefone && <div className="text-xs text-slate-500 dark:text-slate-400">{c.telefone}</div>}
              {(c.endereco || c.cidade || c.estado) && (
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {[c.endereco, [c.cidade, c.estado].filter(Boolean).join(' - ')]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
              {c.trecho && <Trecho rotulo="Observação" texto={c.trecho} />}
              {c.trecho_nota && <Trecho rotulo="Nota" texto={c.trecho_nota} />}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

// Mostra o pedaço do texto encontrado, destacando as palavras buscadas
function Trecho({ rotulo, texto }: { rotulo: string; texto: string }) {
  const partes = texto.split(new RegExp(`${MARCA_INICIO}(.*?)${MARCA_FIM}`, 'g'))
  return (
    <div className="mt-0.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
      <span className="text-slate-400 dark:text-slate-500">{rotulo}: </span>
      {partes.map((parte, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-yellow-200 dark:bg-yellow-500/40 dark:text-inherit px-0.5">
            {parte}
          </mark>
        ) : (
          parte
        )
      )}
    </div>
  )
}
