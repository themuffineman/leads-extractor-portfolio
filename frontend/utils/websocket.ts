export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket;
  private url: string;

  private constructor(socketUrl: string) {
    this.url = socketUrl;
    this.socket = new WebSocket(this.url);
  }

  public static getInstance(url?: string): WebSocketService {
    if (!WebSocketService.instance) {
      if (!url) {
        throw new Error("WebSocketService instance not initialized with url");
      }
      WebSocketService.instance = new WebSocketService(url);
    }

    return WebSocketService.instance;
  }

  public subscribeToEvent(
    event: "open" | "message" | "error" | "close",
    callback: (data: any) => void
  ) {
    WebSocketService.getInstance()
      .getSocket()
      .addEventListener(event, (event) => {
        if (event.type === "message") {
          callback((event as MessageEvent).data);
        } else {
          callback(event);
        }
      });
  }
  public getSocket(): WebSocket {
    return this.socket;
  }
}
