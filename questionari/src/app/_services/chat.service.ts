import { Injectable } from "@angular/core";
import { Subject, ObjectUnsubscribedError } from "rxjs";
import { WebsocketService } from "./websocket.service";

export interface Message {
  what_has_changed: 'questionari'|'progetti'|'utenti'|'questionariCompilati';
  key: string | number;
  note: string;
}

/**
 * Questo servizio gestisce l'invio/ricezione di messaggi a/da un WebSocket dato
 * 
 * Sostanzialmente, traduce i MessageEvent in Message e viceversa
 * 
 * Per 
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  public messages = new Subject<Message>();
  private _messages = new Subject<Object>();

  constructor(wsService: WebsocketService) {
    this._messages = wsService.connect(config.websocketUrl);
    this._messages.subscribe(
      response => {
        // L'oggetto response e' un MessageEvent, i dati stanno nel campo data
        let data = JSON.parse(response["data"]);
        let msg = {
          what_has_changed: data.what_has_changed,
          key: data.key,
          note: data.note
        };
        this.messages.next(msg);
      },
      error => {
        console.log(error);
      }
    );

  }

  sendMsg(message : Message) {
    console.log("new message from client to websocket: ", message);
    this._messages.next(message);
  }
}