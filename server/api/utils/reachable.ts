export default defineEventHandler(event => {
    return fetch('http://localhost:3000/api/utils/ping')
    // TODO
    //     try {
    //       await axios(config.baseurl + '/api/ping')
    //       return res.sendStatus(200)
    //     } catch(e) {
    //       log.debug(e)
    //       return res.sendStatus(400)
    //     }
    //   },
    
})