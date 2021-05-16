const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
const { fetchHtml, getSelector, createDir, createFile, downloadImage, sleep } = require('./helper/helper');
const jsonData = require('./data.json');

app.use(express.urlencoded({extended: true})); 
app.use(express.json());

app.use(express.static('resources'));

createDir(path.resolve(__dirname, 'Data'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.post('/download', async (req, res) => {
  // get manga name
  const url = req.body.link;
  if(jsonData.list.includes(url)) {
    return res.send({
      message: "duplicate"
    });
  }
  const folderName = "manga1000-" + jsonData.folder_id++;
  jsonData.list.push(url);

  const html = await fetchHtml(url);
  const $ = getSelector(html);
  const mangaName = $('h1.entry-title').text().trim();

  await createDir(path.resolve(__dirname, 'Data', folderName));
  await createFile(path.resolve(__dirname, 'Data', folderName, "note.txt"), `${mangaName} : ${url}`);
  await createFile('./data.json', JSON.stringify(jsonData));
  

  const chapList = [];
  $('tr td p a').each((i,e) => {
    const element = {
      chap: $(e).text().replace(/[^0-9.]/g,''),
      link: $(e).attr('href')
    };
    chapList[i] = element;
  });
  for (let i = 0; i < chapList.length; i++) {
    await createDir(path.resolve(__dirname, 'Data', folderName,chapList[i].chap));
    const html = await fetchHtml(chapList[i].link).then((fetchResult) => {
      return fetchResult;
    }).catch((fetchError) => {
      return fetchError;
    });
    const $ = getSelector(html);
    $('figure.wp-block-image img').each(async(j, e) => {
      const imgSrc = $(e).attr('data-src') ? $(e).attr('data-src') : $(e).attr('src');
      await downloadImage({url: imgSrc, path: path.resolve(__dirname, 'Data', folderName,chapList[i].chap, `${j}.jpg`), referer: chapList[i].link });
      sleep(2000);
    })
  }
  return res.send({
    message: "ok"
  });
});



app.listen(port, () => {
  console.log(port);
});