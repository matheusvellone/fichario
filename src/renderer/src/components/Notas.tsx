import { useCallback, useEffect, useState } from 'react'
import type { Nota } from '../../../shared/types'
import { formatarData } from '../format'
import Botao from './Botao'
import Confirmar from './Confirmar'

const campoTexto =
  'w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-blue-500'

export default function Notas({ clienteId }: { clienteId: number }) {
  const [notas, setNotas] = useState<Nota[]>([])
  const [nova, setNova] = useState('')
  const [editando, setEditando] = useState<{ id: number; texto: string } | null>(null)
  const [excluindo, setExcluindo] = useState<Nota | null>(null)

  const carregar = useCallback(async () => {
    setNotas(await window.api.notas.listByCliente(clienteId))
  }, [clienteId])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function adicionar() {
    if (!nova.trim()) return
    await window.api.notas.create(clienteId, nova)
    setNova('')
    await carregar()
  }

  async function salvarEdicao() {
    if (!editando || !editando.texto.trim()) return
    await window.api.notas.update(editando.id, editando.texto)
    setEditando(null)
    await carregar()
  }

  async function excluir() {
    if (!excluindo) return
    await window.api.notas.remove(excluindo.id)
    setExcluindo(null)
    await carregar()
  }

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold">Anotações</h2>

      <div className="mb-5 space-y-2">
        <textarea
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          rows={3}
          placeholder="Escreva aqui o serviço realizado, observações, valores..."
          className={campoTexto}
        />
        <Botao onClick={adicionar} disabled={!nova.trim()}>
          Adicionar anotação
        </Botao>
      </div>

      {notas.length === 0 && <p className="text-slate-500">Nenhuma anotação para este cliente.</p>}

      <ul className="space-y-3">
        {notas.map((n) => (
          <li key={n.id} className="rounded-md border border-slate-200 p-3">
            <div className="mb-1 text-xs font-medium text-slate-500">
              {formatarData(n.created_at)}
              {n.updated_at !== n.created_at && ' (editada)'}
            </div>

            {editando?.id === n.id ? (
              <div className="space-y-2">
                <textarea
                  value={editando.texto}
                  onChange={(e) => setEditando({ id: n.id, texto: e.target.value })}
                  rows={3}
                  autoFocus
                  className={campoTexto}
                />
                <div className="flex gap-3">
                  <Botao onClick={salvarEdicao} disabled={!editando.texto.trim()}>
                    Salvar
                  </Botao>
                  <Botao variante="secundario" onClick={() => setEditando(null)}>
                    Cancelar
                  </Botao>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap">{n.texto}</p>
                <div className="mt-2 flex gap-2">
                  <Botao
                    variante="secundario"
                    tamanho="pequeno"
                    onClick={() => setEditando({ id: n.id, texto: n.texto })}
                  >
                    Editar
                  </Botao>
                  <Botao
                    variante="perigo"
                    tamanho="pequeno"
                    onClick={() => setExcluindo(n)}
                  >
                    Excluir
                  </Botao>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {excluindo && (
        <Confirmar
          mensagem="Tem certeza que deseja excluir esta anotação? Isso não pode ser desfeito."
          textoConfirmar="Sim, excluir"
          onConfirmar={excluir}
          onCancelar={() => setExcluindo(null)}
        />
      )}
    </section>
  )
}
