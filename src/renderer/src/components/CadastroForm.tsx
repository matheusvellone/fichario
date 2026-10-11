import { useEffect, useState, type FormEvent } from 'react'
import type { Cadastro, TipoCadastro } from '../../../shared/types'
import { CADASTROS, ESTADOS } from '../cadastros'
import { cpfValido, formatarCpf, formatarTelefone, telefoneValido } from '../format'
import Botao from './Botao'
import Confirmar from './Confirmar'

const campo =
  'w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 outline-none focus:border-blue-500'
const rotulo = 'mb-1 block font-medium text-slate-700 dark:text-slate-300'

interface Props {
  tipo: TipoCadastro
  cadastro?: Cadastro
  onSalvo: (c: Cadastro) => void
  onCancelar?: () => void
  onExcluido?: () => void
}

export default function CadastroForm({ tipo, cadastro, onSalvo, onCancelar, onExcluido }: Props) {
  const textos = CADASTROS[tipo]
  const api = textos.api()
  const [nome, setNome] = useState(cadastro?.nome ?? '')
  const [endereco, setEndereco] = useState(cadastro?.endereco ?? '')
  const telefoneSalvo = formatarTelefone(cadastro?.telefone ?? '')
  const [telefone, setTelefone] = useState(telefoneSalvo)
  const [cidade, setCidade] = useState(cadastro?.cidade ?? '')
  const [estado, setEstado] = useState(cadastro?.estado ?? '')
  const [rg, setRg] = useState(cadastro?.rg ?? '')
  const cpfSalvo = formatarCpf(cadastro?.cpf ?? '')
  const [cpf, setCpf] = useState(cpfSalvo)
  const [observacoes, setObservacoes] = useState(cadastro?.observacoes ?? '')
  const [salvo, setSalvo] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    if (!salvo) return
    const t = setTimeout(() => setSalvo(false), 2500)
    return () => clearTimeout(t)
  }, [salvo])

  const alterado =
    !cadastro ||
    nome !== cadastro.nome ||
    endereco !== (cadastro.endereco ?? '') ||
    telefone !== telefoneSalvo ||
    cidade !== (cadastro.cidade ?? '') ||
    estado !== (cadastro.estado ?? '') ||
    rg !== (cadastro.rg ?? '') ||
    cpf !== cpfSalvo ||
    observacoes !== (cadastro.observacoes ?? '')
  const valido = telefoneValido(telefone) && cpfValido(cpf)

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    const input = textos.dadosPessoais
      ? { nome, telefone, endereco, cidade, estado, rg, cpf, observacoes }
      : { nome, telefone, endereco, observacoes }
    const resultado = cadastro ? await api.update(cadastro.id, input) : await api.create(input)
    setSalvo(true)
    onSalvo(resultado)
  }

  async function excluir() {
    if (!cadastro) return
    await api.remove(cadastro.id)
    setConfirmando(false)
    onExcluido?.()
  }

  return (
    <section className="mx-auto max-w-4xl rounded-lg bg-white dark:bg-slate-800 p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold">
        {cadastro ? `Dados do ${textos.singular}` : textos.novo}
      </h2>
      <form onSubmit={salvar} className="space-y-3">
        <label className="block">
          <span className={rotulo}>Nome</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus={!cadastro}
            required
            className={campo}
          />
        </label>
        <label className="block">
          <span className={rotulo}>Telefone</span>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            placeholder="(11) 99999-9999"
            inputMode="numeric"
            className={campo}
          />
          {!telefoneValido(telefone) && (
            <span className="mt-1 block text-xs text-red-700 dark:text-red-400">
              Telefone incompleto: digite o DDD e o número
            </span>
          )}
        </label>
        {textos.dadosPessoais && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={rotulo}>CPF</span>
              <input
                value={cpf}
                onChange={(e) => setCpf(formatarCpf(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                className={campo}
              />
              {!cpfValido(cpf) && (
                <span className="mt-1 block text-xs text-red-700 dark:text-red-400">
                  CPF inválido: confira os números
                </span>
              )}
            </label>
            <label className="block">
              <span className={rotulo}>RG</span>
              <input value={rg} onChange={(e) => setRg(e.target.value)} className={campo} />
            </label>
          </div>
        )}
        <label className="block">
          <span className={rotulo}>Endereço</span>
          <input
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className={campo}
          />
        </label>
        {textos.dadosPessoais && (
          <div className="grid grid-cols-[1fr_14rem] gap-3">
            <label className="block">
              <span className={rotulo}>Cidade</span>
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} className={campo} />
            </label>
            <label className="block">
              <span className={rotulo}>Estado</span>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className={campo}>
                <option value="">Escolha...</option>
                {ESTADOS.map((uf) => (
                  <option key={uf.sigla} value={uf.sigla}>
                    {uf.sigla} - {uf.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <label className="block">
          <span className={rotulo}>Observações</span>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
            placeholder={textos.exemploObservacoes}
            className={campo}
          />
        </label>

        <div className="flex items-center gap-3">
          <Botao type="submit" disabled={!nome.trim() || !alterado || !valido}>
            {cadastro ? 'Salvar alterações' : `Cadastrar ${textos.singular}`}
          </Botao>
          {onCancelar && (
            <Botao type="button" variante="secundario" onClick={onCancelar}>
              Cancelar
            </Botao>
          )}
          {salvo && <span className="font-medium text-green-700 dark:text-green-400">✓ Salvo!</span>}
          {cadastro && (
            <Botao
              type="button"
              variante="perigo"
              className="ml-auto"
              onClick={() => setConfirmando(true)}
            >
              Excluir {textos.singular}
            </Botao>
          )}
        </div>
      </form>

      {confirmando && cadastro && (
        <Confirmar
          mensagem={`Tem certeza que deseja excluir o ${textos.singular} "${cadastro.nome}"? Ele sai da lista, mas as notas dele continuam na aba Notas.`}
          textoConfirmar="Sim, excluir"
          onConfirmar={excluir}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </section>
  )
}
