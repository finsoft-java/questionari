import { Injectable } from "@angular/core";
import { Subject, Observer, Observable } from "rxjs";
import { Message } from "@angular/compiler/src/i18n/i18n_ast";

/**
 * Questo servizio banalmente crea e mantiene internamente un WebSocket
 * 
 * Il websocket è configurato per inviare Object di qualsiasi tipo
 * (ma non Blob e Arraybuffer, perchè esegue uno stringify)
 */
@Injectable({ providedIn: 'root' })
export class WebsocketService {
  constructor() {}

  private subject: Subject<Object>;

  public connect(url : string): Subject<Object> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("Successfully connected: " + url);
    }
    return this.subject;
  }

  private create(url: string): Subject<Object> {
    let ws = new WebSocket(url);

    let observable = Observable.create((obs: Observer<Object>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };
    return Subject.create(observer, observable);
  }
}