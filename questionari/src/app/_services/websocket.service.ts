import { Injectable } from "@angular/core";
import { Subject, Observer, Observable } from "rxjs";

export interface Message {
  what_has_changed: 'questionari'|'progetti'|'utenti'|'questionariCompilati';
  key: string | number;
  note: string;
}

/**
 * Questo servizio crea e mantiene internamente un WebSocket
 * 
 * Il websocket è configurato per inviare Object di qualsiasi tipo
 * (ma non Blob e Arraybuffer, perchè esegue uno stringify)
 */
@Injectable({ providedIn: 'root' })
export class WebsocketService {

  public messages: Subject<Message>;

  constructor() {
    this.messages = this.create(config.websocketUrl);
  }


  public create(url: string): Subject<Message> {
    let ws = new WebSocket(url);

    let observable = Observable.create((obs: Observer<Message>) => {
      ws.onmessage = function(evt : MessageEvent) {
        // Quando spedisco, spedisco l'oggetto Message
        // Quando ricevo, ricevo un MessageEvent, che contiene un attributo data : Message
        let msg : Message = JSON.parse(evt.data);
        obs.next(msg);
      };
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer = {
      next: (msg: Message) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      }
    };
    let subject = Subject.create(observer, observable);
    console.log("Successfully connected: " + url);
    return subject;
  }

  sendMsg(message : Message) {
    console.log("new message from client to websocket: ", message);
    this.messages.next(message);
  }
}