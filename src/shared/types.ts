// Clientes e fornecedores têm os mesmos campos e telas
export type TipoCadastro = 'cliente' | 'fornecedor'

export interface Cadastro {
  id: number
  nome: string
  telefone: string | null
  endereco: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

// Cadastro retornado pela busca; `trecho` é o pedaço das observações que bateu com a busca,
// com os termos encontrados entre MARCA_INICIO e MARCA_FIM
export interface CadastroBusca extends Cadastro {
  trecho: string | null
}

export const MARCA_INICIO = '\u0001'
export const MARCA_FIM = '\u0002'

export interface CadastroInput {
  nome: string
  telefone: string | null
  endereco: string | null
  observacoes: string | null
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

export interface ResumoNotas {
  entrou: number
  saiu: number
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
  updater: {
    onUpdateDownloaded: (cb: (versao: string) => void) => () => void
    restart: () => Promise<void>
  }
  appVersion: () => Promise<string>
}
