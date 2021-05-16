const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const fetch = require('node-fetch');

module.exports = {

  fetchHtml: async (url) => {
    return new Promise(async (resolve, reject) => {
      try {
        await axios.get(url).then((res) => {
          return resolve(res.data)
        });
      } catch (error) {
        return reject(error);
      }
    });
  },
  getSelector: (data) => {
    return cheerio.load(data, null, false);
  },
  createDir: (path) => {
    if(!fs.existsSync(path)) {
      fs.mkdir(path, { recursive: true}, err => {
        if (err) {
          return console.error(err);
        }
        console.log("created " + path);
      });
    } 
  },
  createFile: (path, content) => {
    fs.writeFileSync(path, content, (err) => {
      if(err) throw err;
      console.log("saved " + path);
    });
  },
  downloadImage: async ({url, path, referer}) => {  
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios({
          method: "GET",
          url,
          headers: {
            referer: referer
          },
          responseType: 'stream'
        })
        .then((data) => {
          // console.log(`downloaded`);
          return data;
        })
        .catch((error) => {
          // console.log(error);
          return error;
        });
        if (response && response.data) {
          response.data.pipe(fs.createWriteStream(path));
          // console.log({path, isSuccess: true})
          return resolve(path);
        } else {
          console.log({url,path, isSuccess: false})
          return reject('error data');
        }
      } catch(error) {
        return reject(error);
      }
    });
    
  },
  sleep: (ms) =>  {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 
    
}