import cors from "cors";
import https from "https";
import dotenv from "dotenv";
import SocketIO from "socket.io";
import httpsLocalhostHost from "https-localhost";

export default class Application {
  /**
   * Socket io listeners
   */
  ioListeners = [];
  /**
   *
   * @param {*} config The initial configuration for the app
   *    - name: The application name
   *    - port: The application PORT
   *    - version: The application version
   *    - created: A call back initiated when the app has been initialised.
   *    - routes: The list of routes to use by the app
   */
  config = {
    name: "MS2D-2020-APP",
    port: 3000,
    version: 0.1,
    routes: []
  };

  constructor(config) {
    this.config = config;
  }

  async initialize() {
    dotenv.config();
    this.app = httpsLocalhostHost();
    this.app.use(cors());

    const certs = await this.app.getCerts();

    this.server = https.createServer(certs, this.app);
    this.io = SocketIO(this.server, { origins: "*:*" });

    this?.config?.routes?.forEach((route) => {
      try {
        this.app.route(route.path)[route.method](route.callback);
      } catch (err) {
        console.error(err);
      }
    });

    this?.config?.created();
  }

  /**
   * returns the app name
   * @return String
   */

  get router() {
    return this.app;
  }

  async run() {
    await this.initialize();
    this.bindEvents();

    this.server.listen(this?.config?.port, () => {
      console.log(`${this.name} server started on port ${this?.config?.port}`);
    });
  }

  /**
   *
   * @param  {...any} listeners
   */
  registerIoListeners(...listeners) {
    this.ioListeners = listeners;
  }

  bindEvents() {
    this.io.on("connection", (socket) => {
      this.ioListeners.forEach((listener) => {
        listener(socket, this.io);
      });
    });
  }
}
