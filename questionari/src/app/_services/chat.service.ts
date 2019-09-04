import { Injectable } from "@angular/core";
import { Subject, ObjectUnsubscribedError } from "rxjs";
import { WebsocketService } from "./websocket.service";

export interface Message {
  author: string;
  message: string;
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
  private messageEvents = new Subject<MessageEvent>();

  constructor(wsService: WebsocketService) {
    this.messageEvents = wsService.connect(config.websocketUrl);
    this.messageEvents.subscribe(
      response => {
        let data = JSON.parse(response.data);
        let msg = {
          author: data.author,
          message: data.message
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
    let msgEvt = new MessageEvent('aa', {});
    Object.assign(msgEvt, message); // Di fatto, la classe Message può essere qualsiasi
    console.log("Going to send:", msgEvt);
    this.messageEvents.next(msgEvt);
  }
}