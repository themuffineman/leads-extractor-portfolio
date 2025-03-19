export class WebSocketService {
  private static instance: WebSocketService | null = null;
  private static instancePromise: Promise<WebSocketService> | null = null;
  private socket: WebSocket;
  private url: string;

  private constructor(socketUrl: string) {
    this.url = socketUrl;
    this.socket = new WebSocket(this.url);
  }

  public static async getInstance(url?: string): Promise<WebSocketService> {
    if (!WebSocketService.instancePromise) {
      if (!url) {
        throw new Error("WebSocketService instance not initialized with url");
      }

      WebSocketService.instancePromise = new Promise<WebSocketService>(
        (resolve, reject) => {
          const instance = new WebSocketService(url);
          instance.socket.addEventListener("open", () => {
            WebSocketService.instance = instance;
            resolve(instance);
          });
          instance.socket.addEventListener("error", (err) => {
            WebSocketService.instancePromise = null;
            reject(err);
          });
        }
      );
    }

    return WebSocketService.instancePromise;
  }

  public async subscribeToEvent(
    event: "open" | "message" | "error" | "close",
    callback: (data: any) => void
  ) {
    const instance = await WebSocketService.getInstance();
    instance.getSocket().addEventListener(event, (event) => {
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

  public close() {
    this.socket.close();
  }

  public async sendMessage(message: "ping" | "request", data?: string) {
    const instance = await WebSocketService.getInstance();
    if (message === "request") {
      if (!data) {
        throw new Error("Data not provided for message type: request");
      }
      instance.getSocket().send(JSON.stringify({ type: message, data }));
    } else {
      instance.getSocket().send(JSON.stringify({ message }));
    }
  }
}
