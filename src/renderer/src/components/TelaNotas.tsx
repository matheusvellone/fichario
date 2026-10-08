import { useCallback, useEffect, useState } from 'react'
import type { Nota, ResumoNotas, TipoCadastro, TipoNota } from '../../../shared/types'
import { formatarMoeda, hoje, mudarMes, nomeDoMes } from '../format'
import Botao from './Botao'
import ListaNotas from './ListaNotas'
import NotaForm from './NotaForm'

export default function TelaNotas({
  onAbrir
}: {
  onAbrir: (tipo: TipoCadastro, id: number) => void
}) {
  const [mes, setMes] = useState(hoje().slice(0, 7))
  const [notas, setNotas] = useState<Nota[]>([])
  const [resumo, setResumo] = useState<ResumoNotas>({ entrou: 0, saiu: 0 })
  const [nova, setNova] = useState<TipoNota | null>(null)

  const carregar = useCallback(async () => {
    const [lista, totais] = await Promise.all([
      window.api.notas.list({ mes }),
      window.api.notas.resumo({ mes })
    ])
    setNotas(lista)
    setResumo(totais)
  }, [mes])

  useEffect(() => {
    carregar()
  }, [carregar])

  const sobra = resumo.entrou - resumo.saiu

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <section className="rounded-lg bg-white dark:bg-slate-800 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Botao variante="secundario" onClick={() => setMes(mudarMes(mes, -1))}>
            ‹ Mês anterior
          </Botao>
          <h2 className="text-base font-semibold">{nomeDoMes(mes)}</h2>
          <Botao variante="secundario" onClick={() => setMes(mudarMes(mes, 1))}>
            Próximo mês ›
          </Botao>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-md bg-green-50 dark:bg-green-950/40 p-3">
            <div className="text-slate-600 dark:text-slate-400">Entrou</div>
            <div className="text-lg font-semibold text-green-700 dark:text-green-400">
              {formatarMoeda(resumo.entrou)}
            </div>
          </div>
          <div className="rounded-md bg-red-50 dark:bg-red-950/40 p-3">
            <div className="text-slate-600 dark:text-slate-400">Saiu</div>
            <div className="text-lg font-semibold text-red-700 dark:text-red-400">{formatarMoeda(resumo.saiu)}</div>
          </div>
          <div className={`rounded-md p-3 ${sobra >= 0 ? 'bg-slate-50 dark:bg-slate-700/40' : 'bg-red-50 dark:bg-red-950/40'}`}>
            <div className="text-slate-600 dark:text-slate-400">{sobra >= 0 ? 'Sobrou' : 'Faltou'}</div>
            <div
              className={`text-lg font-semibold ${sobra >= 0 ? 'text-slate-800 dark:text-slate-200' : 'text-red-700 dark:text-red-400'}`}
            >
              {formatarMoeda(Math.abs(sobra))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-white dark:bg-slate-800 p-5 shadow-sm">
        <div className="mb-3 flex gap-2">
          <Botao variante="verde" onClick={() => setNova('entrada')}>
            + Recebi dinheiro
          </Botao>
          <Botao variante="vermelho" onClick={() => setNova('saida')}>
            − Paguei uma conta
          </Botao>
        </div>
        <ListaNotas
          notas={notas}
          vazio="Nada anotado neste mês."
          onAbrir={onAbrir}
          onMudou={carregar}
        />
      </section>

      {nova && (
        <NotaForm
          tipo={nova}
          clienteId={null}
          fornecedorId={null}
          escolherFornecedor
          onSalvo={() => {
            setNova(null)
            // Se a data escolhida for de outro mês, a lista continua no mês atual
            carregar()
          }}
          onCancelar={() => setNova(null)}
        />
      )}
    </div>
  )
}
