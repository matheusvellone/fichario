import type { ReactNode } from 'react'
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
              <div className="font-medium">
                <DestacadoBusca texto={c.nome} busca={busca} />
              </div>
              {c.telefone && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <Destacado
                    texto={c.telefone}
                    faixas={[...faixasTexto(c.telefone, busca), ...faixasDigitos(c.telefone, busca)]}
                  />
                </div>
              )}
              {(c.endereco || c.cidade || c.estado) && (
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                  <DestacadoBusca
                    texto={[c.endereco, [c.cidade, c.estado].filter(Boolean).join(' - ')]
                      .filter(Boolean)
                      .join(', ')}
                    busca={busca}
                  />
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

type Faixa = [inicio: number, fim: number]

// Sem acento e em minúsculas, guardando de qual posição do texto original veio cada
// caractere, para destacar no texto original o que foi achado no normalizado
function normalizar(texto: string): { normal: string; origem: number[] } {
  let normal = ''
  const origem: number[] = []
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i].normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    normal += c
    for (let j = 0; j < c.length; j++) origem.push(i)
  }
  return { normal, origem }
}

// Onde os termos da busca aparecem no texto, com as mesmas regras da busca: começo de
// palavra sempre; no meio da palavra só termos com 3 ou mais caracteres
function faixasTexto(texto: string, busca: string): Faixa[] {
  const termos = normalizar(busca).normal.match(/[\p{L}\p{N}]+/gu) ?? []
  const { normal, origem } = normalizar(texto)
  const faixas: Faixa[] = []
  for (const termo of termos) {
    for (let pos = normal.indexOf(termo); pos >= 0; pos = normal.indexOf(termo, pos + 1)) {
      const comecoPalavra = pos === 0 || !/[\p{L}\p{N}]/u.test(normal[pos - 1])
      if (comecoPalavra || termo.length >= 3) {
        faixas.push([origem[pos], origem[pos + termo.length - 1] + 1])
      }
    }
  }
  return faixas
}

// Busca só com números acha o telefone pelos dígitos ("996214" em "(18) 99621-4038")
function faixasDigitos(texto: string, busca: string): Faixa[] {
  if (/\p{L}/u.test(busca)) return []
  const digitos = busca.replace(/\D/g, '')
  if (!digitos) return []
  const posicoes: number[] = []
  for (let i = 0; i < texto.length; i++) if (/\d/.test(texto[i])) posicoes.push(i)
  const soDigitos = posicoes.map((i) => texto[i]).join('')
  const faixas: Faixa[] = []
  for (let pos = soDigitos.indexOf(digitos); pos >= 0; pos = soDigitos.indexOf(digitos, pos + 1)) {
    faixas.push([posicoes[pos], posicoes[pos + digitos.length - 1] + 1])
  }
  return faixas
}

function DestacadoBusca({ texto, busca }: { texto: string; busca: string }) {
  return <Destacado texto={texto} faixas={faixasTexto(texto, busca)} />
}

// Texto com as faixas destacadas (faixas sobrepostas viram uma só)
function Destacado({ texto, faixas }: { texto: string; faixas: Faixa[] }) {
  const ordenadas = [...faixas].sort((a, b) => a[0] - b[0])
  const unidas: Faixa[] = []
  for (const [ini, fim] of ordenadas) {
    const ultima = unidas[unidas.length - 1]
    if (ultima && ini <= ultima[1]) ultima[1] = Math.max(ultima[1], fim)
    else unidas.push([ini, fim])
  }
  const partes: ReactNode[] = []
  let pos = 0
  for (const [ini, fim] of unidas) {
    if (ini > pos) partes.push(texto.slice(pos, ini))
    partes.push(<Marca key={ini}>{texto.slice(ini, fim)}</Marca>)
    pos = fim
  }
  partes.push(texto.slice(pos))
  return <>{partes}</>
}

function Marca({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-yellow-200 dark:bg-yellow-500/40 dark:text-inherit px-0.5">
      {children}
    </mark>
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
          <Marca key={i}>{parte}</Marca>
        ) : (
          parte
        )
      )}
    </div>
  )
}
