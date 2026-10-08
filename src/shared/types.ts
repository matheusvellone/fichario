export interface Cliente {
  id: number
  nome: string
  endereco: string | null
  telefone: string | null
  created_at: string
  updated_at: string
}

// Cliente retornado pela busca; `trecho` é o pedaço da anotação que bateu com a busca,
// com os termos encontrados entre MARCA_INICIO e MARCA_FIM
export interface ClienteBusca extends Cliente {
  trecho: string | null
}

export const MARCA_INICIO = '\u0001'
export const MARCA_FIM = '\u0002'

export interface ClienteInput {
  nome: string
  endereco: string | null
  telefone: string | null
}

export interface Nota {
  id: number
  cliente_id: number
  texto: string
  created_at: string
  updated_at: string
}

export interface Api {
  clientes: {
    list: (busca?: string) => Promise<ClienteBusca[]>
    get: (id: number) => Promise<Cliente | undefined>
    create: (input: ClienteInput) => Promise<Cliente>
    update: (id: number, input: ClienteInput) => Promise<Cliente>
    remove: (id: number) => Promise<void>
  }
  notas: {
    listByCliente: (clienteId: number) => Promise<Nota[]>
    create: (clienteId: number, texto: string) => Promise<Nota>
    update: (id: number, texto: string) => Promise<Nota>
    remove: (id: number) => Promise<void>
  }
  updater: {
    onUpdateDownloaded: (cb: (versao: string) => void) => () => void
    restart: () => Promise<void>
  }
  appVersion: () => Promise<string>
}
