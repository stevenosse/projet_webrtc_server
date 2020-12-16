import Application from "./core/Application.js";
import roomEvents from "./listeners/room.listener.js";

import mainRoutes  from "./routes/main.js"

const application = new Application({
  name: "Supervisor",
  port: 3000,
  version: 0.1,
  created: () => {
    application.registerIoListeners(roomEvents);
  },
  routes: [
    ...mainRoutes
  ],
});

application.run();
