import { useState, type FormEvent } from 'react'
import {
  MEIOS_PAGAMENTO,
  type MeioPagamento,
  type Pagamento,
  type Servico
} from '../../../shared/types'
import { centavosDoCampo, formatarMoeda, hoje, valorParaCampo } from '../format'
import Botao from './Botao'
import { useEsc } from './useEsc'

const campo =
  'w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 outline-none focus:border-blue-500'

interface Props {
  servico: Servico
  // Editando um pagamento existente, ou registrando um novo no serviço
  pagamento?: Pagamento
  onSalvo: () => void
  onCancelar: () => void
}

export default function PagamentoForm({ servico, pagamento, onSalvo, onCancelar }: Props) {
  // Quanto ainda pode ser pago neste serviço, sem contar o pagamento sendo editado
  const pagoOutros = servico.pagamentos
    .filter((p) => p.id !== pagamento?.id)
    .reduce((soma, p) => soma + p.valor_centavos, 0)
  const restante = Math.max(servico.valor_centavos - pagoOutros, 0)

  const [data, setData] = useState(pagamento?.data ?? hoje())
  // Novo pagamento já vem com o que falta, que é o caso mais comum (pagou tudo)
  const [centavos, setCentavos] = useState(pagamento?.valor_centavos ?? restante)
  const [meio, setMeio] = useState<MeioPagamento>(pagamento?.meio ?? 'dinheiro')

  const passou = centavos > restante
  const podeSalvar = centavos > 0 && !passou && data !== ''

  useEsc(onCancelar)

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!podeSalvar) return
    const input = { data, valor_centavos: centavos, meio }
    if (pagamento) await window.api.pagamentos.update(pagamento.id, input)
    else await window.api.pagamentos.create(servico.id, input)
    onSalvo()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={salvar}
        className="w-full max-w-md space-y-3 rounded-lg bg-white dark:bg-slate-800 p-5 shadow-xl"
      >
        <div>
          <h2 className="text-base font-semibold">
            {pagamento ? 'Editar pagamento' : 'Pagamento recebido'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {servico.descricao || 'Serviço'} · falta {formatarMoeda(restante)}
          </p>
        </div>

        <label className="block">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">Valor (R$)</span>
          <input
            value={centavos > 0 ? valorParaCampo(centavos) : ''}
            onChange={(e) => setCentavos(centavosDoCampo(e.target.value))}
            placeholder="0,00"
            inputMode="numeric"
            autoFocus
            className={`${campo} text-right ${passou ? 'border-red-400 dark:border-red-500' : ''}`}
          />
          {passou && (
            <span className="mt-1 block text-red-700 dark:text-red-400">
              Maior do que falta receber ({formatarMoeda(restante)}).
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">Data</span>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className={campo}
          />
        </label>

        <div>
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
            Meio de pagamento
          </span>
          <div className="flex gap-2">
            {(Object.keys(MEIOS_PAGAMENTO) as MeioPagamento[]).map((m) => (
              <Botao
                key={m}
                type="button"
                variante={meio === m ? 'primario' : 'secundario'}
                onClick={() => setMeio(m)}
                className="flex-1"
              >
                {MEIOS_PAGAMENTO[m]}
              </Botao>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Botao type="button" variante="secundario" onClick={onCancelar}>
            Cancelar
          </Botao>
          <Botao type="submit" disabled={!podeSalvar}>
            Salvar
          </Botao>
        </div>
      </form>
    </div>
  )
}
