const dns = require("dns");

dns.resolveSrv(
    "_mongodb._tcp.community-ai-cluster.m6gjjux.mongodb.net",
    (err, addresses) => {
        if (err) {
            console.error("Error:", err);
        } else {
            console.log(addresses);
        }
    }
);