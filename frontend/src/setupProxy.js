const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Proxy middleware sayesinde frontend ve backend arasındaki istekleri yönlendirmede kullanılır.
 * Asıl amaç frontend ve backend'in farklı portlarda çalışması durumunda CORS sorununu çözmektir.
 */
module.exports = function (app) {
  const target =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:2626";
  app.use(
    "/api",
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/api", //  /api istekleri için
      },
    })
  );
};
