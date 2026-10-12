// Clientes e fornecedores têm os mesmos campos e telas
export type TipoCadastro = 'cliente' | 'fornecedor'

export interface Cadastro {
  id: number
  nome: string
  telefone: string | null
  endereco: string | null
  observacoes: string | null
  // Só clientes têm estes campos
  rg?: string | null
  cpf?: string | null
  cidade?: string | null
  estado?: string | null // sigla: SP, RJ...
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Cadastro retornado pela busca; `trecho` é o pedaço das observações que bateu com a busca
// e `trecho_nota` o da descrição de uma nota dele, com os termos encontrados entre
// MARCA_INICIO e MARCA_FIM
export interface CadastroBusca extends Cadastro {
  trecho: string | null
  trecho_nota: string | null
}

export const MARCA_INICIO = '\u0001'
export const MARCA_FIM = '\u0002'

export interface CadastroInput {
  nome: string
  telefone: string | null
  endereco: string | null
  observacoes: string | null
  rg?: string | null
  cpf?: string | null
  cidade?: string | null
  estado?: string | null
}

export interface CadastroApi {
  list: (busca?: string) => Promise<CadastroBusca[]>
  get: (id: number) => Promise<Cadastro | undefined>
  create: (input: CadastroInput) => Promise<Cadastro>
  update: (id: number, input: CadastroInput) => Promise<Cadastro>
  remove: (id: number) => Promise<void>
}

export type TipoNota = 'entrada' | 'saida'

export interface Nota {
  id: number
  cliente_id: number | null
  fornecedor_id: number | null
  data: string // AAAA-MM-DD
  tipo: TipoNota
  valor_centavos: number
  descricao: string | null
  created_at: string
  updated_at: string
  cliente_nome: string | null
  fornecedor_nome: string | null
  // Preenchido quando o cliente/fornecedor da nota foi excluído
  cliente_excluido_em: string | null
  fornecedor_excluido_em: string | null
}

export interface NotaInput {
  cliente_id: number | null
  fornecedor_id: number | null
  data: string
  tipo: TipoNota
  valor_centavos: number
  descricao: string | null
}

// mes no formato AAAA-MM
export interface FiltroNotas {
  clienteId?: number
  fornecedorId?: number
  mes?: string
}

// `entrou` inclui os pagamentos de serviços
export interface ResumoNotas {
  entrou: number
  saiu: number
}

// Serviço feito para um cliente, com os pagamentos dele (pode ser pago em partes)
export interface Servico {
  id: number
  cliente_id: number
  data: string // AAAA-MM-DD
  valor_centavos: number
  descricao: string | null
  created_at: string
  updated_at: string
  pagamentos: Pagamento[]
}

export interface ServicoInput {
  cliente_id: number
  data: string
  valor_centavos: number
  descricao: string | null
}

export type MeioPagamento = 'dinheiro' | 'pix' | 'cartao'

export const MEIOS_PAGAMENTO: Record<MeioPagamento, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao: 'Cartão'
}

export interface Pagamento {
  id: number
  servico_id: number
  data: string // AAAA-MM-DD
  valor_centavos: number
  meio: MeioPagamento
  created_at: string
  updated_at: string
}

export interface PagamentoInput {
  data: string
  valor_centavos: number
  meio: MeioPagamento
}

// Pagamento listado na aba Notas, com o serviço e o cliente dele
export interface PagamentoDoMes extends Pagamento {
  servico_descricao: string | null
  cliente_id: number
  cliente_nome: string
  cliente_excluido_em: string | null
}

export interface Api {
  clientes: CadastroApi
  fornecedores: CadastroApi
  notas: {
    list: (filtro: FiltroNotas) => Promise<Nota[]>
    resumo: (filtro: FiltroNotas) => Promise<ResumoNotas>
    create: (input: NotaInput) => Promise<Nota>
    update: (id: number, input: NotaInput) => Promise<Nota>
    remove: (id: number) => Promise<void>
  }
  servicos: {
    list: (clienteId: number) => Promise<Servico[]>
    create: (input: ServicoInput) => Promise<void>
    update: (id: number, input: ServicoInput) => Promise<void>
    remove: (id: number) => Promise<void>
  }
  pagamentos: {
    // mes no formato AAAA-MM
    list: (mes: string) => Promise<PagamentoDoMes[]>
    create: (servicoId: number, input: PagamentoInput) => Promise<void>
    update: (id: number, input: PagamentoInput) => Promise<void>
    remove: (id: number) => Promise<void>
  }
  updater: {
    onUpdateDownloaded: (cb: (versao: string) => void) => () => void
    restart: () => Promise<void>
  }
  appVersion: () => Promise<string>
}
