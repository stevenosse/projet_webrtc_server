/**
 * The route structure is
 *    - path: the binded path
 *    - method: one of [get, post, put, patch, options, delete]
 *    - callback: the callback to execute when the url is visited
 */
const routes = [
  {
    path: "/",
    method: "get",
    callback: (req, res) => {
      res.json({
        name: process.env.APPNAME,
        version: process.env.VERSION,
      });
    },
  },
];

export default routes;
