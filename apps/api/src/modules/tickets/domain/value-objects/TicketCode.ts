/**
 * Codigo amigavel exibido ao cliente (ex: "DG-0001"). O sequencial e gerado
 * pelo Postgres (coluna `serial`); esta classe apenas formata.
 */
export class TicketCode {
  private constructor(public readonly value: string) {}

  static fromSequence(sequence: number): TicketCode {
    const padded = String(sequence).padStart(4, '0');
    return new TicketCode(`DG-${padded}`);
  }

  static fromString(raw: string): TicketCode {
    return new TicketCode(raw);
  }

  equals(other: TicketCode): boolean {
    return this.value === other.value;
  }
}
