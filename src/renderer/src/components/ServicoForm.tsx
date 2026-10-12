import { useState, type FormEvent } from 'react'
import type { Servico } from '../../../shared/types'
import { centavosDoCampo, hoje, valorParaCampo } from '../format'
import Botao from './Botao'
import { useEsc } from './useEsc'

const campo =
  'w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 outline-none focus:border-blue-500'

interface Props {
  // Editando um serviço existente, ou criando um novo para o cliente
  servico?: Servico
  clienteId: number
  onSalvo: () => void
  onCancelar: () => void
}

export default function ServicoForm({ servico, clienteId, onSalvo, onCancelar }: Props) {
  const [data, setData] = useState(servico?.data ?? hoje())
  const [centavos, setCentavos] = useState(servico?.valor_centavos ?? 0)
  const [descricao, setDescricao] = useState(servico?.descricao ?? '')

  const podeSalvar = centavos > 0 && data !== ''

  useEsc(onCancelar)

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!podeSalvar) return
    const input = { cliente_id: clienteId, data, valor_centavos: centavos, descricao }
    if (servico) await window.api.servicos.update(servico.id, input)
    else await window.api.servicos.create(input)
    onSalvo()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={salvar}
        className="w-full max-w-md space-y-3 rounded-lg bg-white dark:bg-slate-800 p-5 shadow-xl"
      >
        <h2 className="text-base font-semibold">{servico ? 'Editar serviço' : 'Novo serviço'}</h2>

        <label className="block">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">Valor (R$)</span>
          <input
            value={centavos > 0 ? valorParaCampo(centavos) : ''}
            onChange={(e) => setCentavos(centavosDoCampo(e.target.value))}
            placeholder="0,00"
            inputMode="numeric"
            autoFocus
            className={`${campo} text-right`}
          />
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

        <label className="block">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">Descrição</span>
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex.: pintura da fachada"
            className={campo}
          />
        </label>

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
