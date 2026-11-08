export const FUSO = "America/Sao_Paulo"

export function diaLocal(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function hojeISO(): string {
  return diaLocal(new Date())
}

export function fmtNumero(n: number): string {
  return String(n).padStart(3, "0")
}

export function fmtData(iso: string): string {
  if (!iso) return "-"
  const d = new Date(iso + "T12:00:00")
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("pt-BR")
}

export function fmtDataHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
  } catch {
    return iso
  }
}
