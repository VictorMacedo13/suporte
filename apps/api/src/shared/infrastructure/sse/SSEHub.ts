import type { Response } from 'express';

interface Subscriber {
  id: string;
  res: Response;
}

/**
 * Hub simples de SSE — clientes assinam por "topic" (ex: codigo do ticket)
 * e recebem eventos via res.write. Em producao com multiplos processos,
 * trocar por Redis pub/sub.
 */
export class SSEHub {
  private subscribers = new Map<string, Subscriber[]>();

  subscribe(topic: string, res: Response): () => void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(`: connected\n\n`);

    const subscriber: Subscriber = { id: crypto.randomUUID(), res };
    const list = this.subscribers.get(topic) ?? [];
    list.push(subscriber);
    this.subscribers.set(topic, list);

    const heartbeat = setInterval(() => {
      try {
        res.write(`: ping ${Date.now()}\n\n`);
      } catch {
        /* cliente caiu */
      }
    }, 25_000);

    const cleanup = () => {
      clearInterval(heartbeat);
      const current = this.subscribers.get(topic) ?? [];
      this.subscribers.set(
        topic,
        current.filter((s) => s.id !== subscriber.id),
      );
      try {
        res.end();
      } catch {
        /* ja fechado */
      }
    };

    res.on('close', cleanup);
    return cleanup;
  }

  publish(topic: string, event: string, data: unknown): void {
    const list = this.subscribers.get(topic) ?? [];
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const sub of list) {
      try {
        sub.res.write(payload);
      } catch {
        /* swallow */
      }
    }
  }
}

export const sseHub = new SSEHub();
