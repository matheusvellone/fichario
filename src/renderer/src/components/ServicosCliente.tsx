import { useCallback, useEffect, useState } from 'react'
import { MEIOS_PAGAMENTO, type Pagamento, type Servico } from '../../../shared/types'
import { formatarDia, formatarMoeda } from '../format'
import Botao from './Botao'
import Confirmar from './Confirmar'
import PagamentoForm from './PagamentoForm'
import ServicoForm from './ServicoForm'

const pago = (s: Servico): number => s.pagamentos.reduce((soma, p) => soma + p.valor_centavos, 0)

// Serviços de um cliente e os pagamentos de cada um, na tela do cliente
export default function ServicosCliente({ clienteId }: { clienteId: number }) {
  const [servicos, setServicos] = useState<Servico[]>([])
  // Serviço aberto no formulário: null = fechado, 'novo' = criando
  const [editando, setEditando] = useState<Servico | 'novo' | null>(null)
  const [excluindo, setExcluindo] = useState<Servico | null>(null)
  const [pagando, setPagando] = useState<{ servico: Servico; pagamento?: Pagamento } | null>(null)
  const [excluindoPagamento, setExcluindoPagamento] = useState<Pagamento | null>(null)

  const carregar = useCallback(async () => {
    setServicos(await window.api.servicos.list(clienteId))
  }, [clienteId])

  useEffect(() => {
    carregar()
  }, [carregar])

  const recebido = servicos.reduce((soma, s) => soma + pago(s), 0)
  const falta = servicos.reduce((soma, s) => soma + Math.max(s.valor_centavos - pago(s), 0), 0)

  async function excluirServico() {
    if (!excluindo) return
    await window.api.servicos.remove(excluindo.id)
    setExcluindo(null)
    carregar()
  }

  async function excluirPagamento() {
    if (!excluindoPagamento) return
    await window.api.pagamentos.remove(excluindoPagamento.id)
    setExcluindoPagamento(null)
    carregar()
  }

  return (
    <section className="rounded-lg bg-white dark:bg-slate-800 p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">Serviços</h2>
        {recebido > 0 && (
          <span className="text-slate-600 dark:text-slate-400">
            · Já recebeu{' '}
            <strong className="text-green-700 dark:text-green-400">{formatarMoeda(recebido)}</strong>{' '}
            deste cliente
          </span>
        )}
        {falta > 0 && (
          <span className="text-slate-600 dark:text-slate-400">
            · Falta receber{' '}
            <strong className="text-amber-700 dark:text-amber-400">{formatarMoeda(falta)}</strong>
          </span>
        )}
      </div>

      <div className="mb-3">
        <Botao variante="verde" onClick={() => setEditando('novo')}>
          + Serviço
        </Botao>
      </div>

      {servicos.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">Nenhum serviço anotado para este cliente.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700 rounded-md border border-slate-200 dark:border-slate-700">
          {servicos.map((s) => {
            const restante = s.valor_centavos - pago(s)
            return (
              <li key={s.id} className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-slate-500 dark:text-slate-400">
                    {formatarDia(s.data)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{s.descricao || 'Serviço'}</div>
                    <div className="text-xs">
                      {restante <= 0 ? (
                        <span className="text-green-700 dark:text-green-400">Pago</span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400">
                          Falta {formatarMoeda(restante)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 font-semibold">{formatarMoeda(s.valor_centavos)}</span>
                  <div className="flex shrink-0 gap-1">
                    {restante > 0 && (
                      <Botao
                        tamanho="pequeno"
                        variante="verde"
                        onClick={() => setPagando({ servico: s })}
                      >
                        + Pagamento
                      </Botao>
                    )}
                    <Botao tamanho="pequeno" variante="secundario" onClick={() => setEditando(s)}>
                      Editar
                    </Botao>
                    <Botao tamanho="pequeno" variante="perigo" onClick={() => setExcluindo(s)}>
                      Excluir
                    </Botao>
                  </div>
                </div>

                {s.pagamentos.length > 0 && (
                  <ul className="mt-2 ml-23 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                    {s.pagamentos.map((p) => (
                      <li key={p.id} className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-slate-500 dark:text-slate-400">
                          {formatarDia(p.data)}
                        </span>
                        <span className="flex-1 text-slate-600 dark:text-slate-400">
                          {MEIOS_PAGAMENTO[p.meio]}
                        </span>
                        <span className="shrink-0 text-green-700 dark:text-green-400">
                          + {formatarMoeda(p.valor_centavos)}
                        </span>
                        <div className="flex shrink-0 gap-1">
                          <Botao
                            tamanho="pequeno"
                            variante="secundario"
                            onClick={() => setPagando({ servico: s, pagamento: p })}
                          >
                            Editar
                          </Botao>
                          <Botao
                            tamanho="pequeno"
                            variante="perigo"
                            onClick={() => setExcluindoPagamento(p)}
                          >
                            Excluir
                          </Botao>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {editando && (
        <ServicoForm
          servico={editando === 'novo' ? undefined : editando}
          clienteId={clienteId}
          onSalvo={() => {
            setEditando(null)
            carregar()
          }}
          onCancelar={() => setEditando(null)}
        />
      )}

      {pagando && (
        <PagamentoForm
          servico={pagando.servico}
          pagamento={pagando.pagamento}
          onSalvo={() => {
            setPagando(null)
            carregar()
          }}
          onCancelar={() => setPagando(null)}
        />
      )}

      {excluindo && (
        <Confirmar
          mensagem={`Excluir o serviço "${excluindo.descricao || formatarMoeda(excluindo.valor_centavos)}" de ${formatarDia(excluindo.data)}${excluindo.pagamentos.length > 0 ? ' e os pagamentos dele' : ''}? Isso não pode ser desfeito.`}
          textoConfirmar="Sim, excluir"
          onConfirmar={excluirServico}
          onCancelar={() => setExcluindo(null)}
        />
      )}

      {excluindoPagamento && (
        <Confirmar
          mensagem={`Excluir o pagamento de ${formatarMoeda(excluindoPagamento.valor_centavos)} de ${formatarDia(excluindoPagamento.data)}? Isso não pode ser desfeito.`}
          textoConfirmar="Sim, excluir"
          onConfirmar={excluirPagamento}
          onCancelar={() => setExcluindoPagamento(null)}
        />
      )}
    </section>
  )
}
