const cds = require("@sap/cds");
const con2ap = require("@sap/cds-odata-v2-adapter-proxy");
cds.on("bootstrap", function(app) {
    app.use(function(req, res, next) {
        const { origin } = req.headers;
        if (origin) {
            res.set('access-control-allow-origin', origin);
            res.set('access-control-allow-headers', "*");
            if (req.method === 'OPTIONS')
                return res.set(
                    'access-control-allow-methods',
                    'GET,HEAD,PUT,PATCH,POST,DELETE'
                ).end()
        }
        next()
    });
    app.use(con2ap());
    
});

module.exports = cds.server;