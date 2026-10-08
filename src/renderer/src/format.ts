const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const numero = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export function formatarMoeda(centavos: number): string {
  return moeda.format(centavos / 100)
}

// Valor para preencher o campo de edição: 150050 → "1.500,50"
export function valorParaCampo(centavos: number): string {
  return numero.format(centavos / 100)
}

// Campo de valor estilo maquininha: só dígitos, os dois últimos são os centavos.
// "1200" → 1200 centavos (12,00); apagar um dígito volta para 120 (1,20)
export function centavosDoCampo(texto: string): number {
  const digitos = texto.replace(/\D/g, '').slice(0, 11)
  return digitos ? Number(digitos) : 0
}

// "AAAA-MM-DD" → "DD/MM/AAAA"
export function formatarDia(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// Data de hoje no horário local, no formato "AAAA-MM-DD"
export function hoje(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// "AAAA-MM" → "Outubro de 2026"
export function nomeDoMes(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  const nome = new Date(ano, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })
  return `${nome[0].toUpperCase()}${nome.slice(1)} de ${ano}`
}

// Soma (ou subtrai) meses de "AAAA-MM"
export function mudarMes(mes: string, quantos: number): string {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m - 1 + quantos, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
