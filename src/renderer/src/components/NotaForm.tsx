import { useEffect, useState, type FormEvent } from 'react'
import type { Cadastro, Nota, TipoNota } from '../../../shared/types'
import { centavosDoCampo, hoje, valorParaCampo } from '../format'
import Botao from './Botao'
import { useEsc } from './useEsc'

const campo =
  'w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-blue-500'

interface Props {
  // Editando uma nota existente, ou criando uma nova com tipo/cliente definidos
  nota?: Nota
  tipo: TipoNota
  clienteId: number | null
  fornecedorId: number | null
  // Fora da tela do fornecedor, a pessoa pode escolher de qual fornecedor é a nota
  escolherFornecedor: boolean
  onSalvo: () => void
  onCancelar: () => void
}

export default function NotaForm({
  nota,
  tipo,
  clienteId,
  fornecedorId: fornecedorInicial,
  escolherFornecedor,
  onSalvo,
  onCancelar
}: Props) {
  const [data, setData] = useState(nota?.data ?? hoje())
  const [centavos, setCentavos] = useState(nota?.valor_centavos ?? 0)
  const [descricao, setDescricao] = useState(nota?.descricao ?? '')
  const [fornecedorId, setFornecedorId] = useState(fornecedorInicial)
  const [fornecedores, setFornecedores] = useState<Cadastro[]>([])

  useEffect(() => {
    if (escolherFornecedor) window.api.fornecedores.list().then(setFornecedores)
  }, [escolherFornecedor])

  const podeSalvar = centavos > 0 && data !== ''

  useEsc(onCancelar)

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!podeSalvar) return
    const input = {
      cliente_id: clienteId,
      fornecedor_id: fornecedorId,
      data,
      tipo,
      valor_centavos: centavos,
      descricao
    }
    if (nota) await window.api.notas.update(nota.id, input)
    else await window.api.notas.create(input)
    onSalvo()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={salvar}
        className="w-full max-w-md space-y-3 rounded-lg bg-white p-5 shadow-xl"
      >
        <h2 className="text-base font-semibold">
          {tipo === 'entrada' ? 'Dinheiro recebido' : 'Conta paga'}
        </h2>

        <label className="block">
          <span className="mb-1 block font-medium text-slate-700">Valor (R$)</span>
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
          <span className="mb-1 block font-medium text-slate-700">Data</span>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className={campo}
          />
        </label>

        {escolherFornecedor && fornecedores.length > 0 && (
          <label className="block">
            <span className="mb-1 block font-medium text-slate-700">Fornecedor</span>
            <select
              value={fornecedorId ?? ''}
              onChange={(e) => setFornecedorId(e.target.value ? Number(e.target.value) : null)}
              className={campo}
            >
              <option value="">Nenhum</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="mb-1 block font-medium text-slate-700">Descrição</span>
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder={tipo === 'entrada' ? 'Ex.: pintura da fachada' : 'Ex.: conta de luz'}
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
