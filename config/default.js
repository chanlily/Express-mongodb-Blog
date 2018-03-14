module.exports = {
    port: 1000,
    session: {
      maxAge: 1000*60*30
    },
    mongodb: 'mongodb://localhost:27017/nodedb',
    upload: {
        path: process.cwd() + '/uploads'
    }

};
