const express = require('express');
const ftp = require('basic-ftp');
const path = require('path');

const app = express();

app.get('*', async (req, res) => {
  const client = new ftp.Client();
  try {
    await client.access({
      host: '255.255.255.255',
      user: 'User',
      password: 'Password',
    });

    const remoteFilePath = req.originalUrl;
    const localFilePath = path.join(__dirname, 'revfiles', path.basename(remoteFilePath)); // 다운로드한 파일을 저장할 경로

    await client.downloadTo(localFilePath, remoteFilePath); // 파일 다운로드

    res.sendFile(localFilePath); // 다운로드한 파일을 클라이언트에게 전송
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
  client.close(); // FTP 서버 연결 종료
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
