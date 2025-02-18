const express = require('express');
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

const app = express();

app.get('*', async (req, res) => {
  const client = new ftp.Client();
  try {
    await client.access({
      host: '127.0.0.1',
      user: 'User',
      password: 'Password',
    });

    const remoteFilePath = req.originalUrl;
    const localFilePath = path.join(__dirname, 'ftpfiles', path.basename(remoteFilePath));

    // 파일 존재 여부 확인
    try {
      await client.size(remoteFilePath);
    } catch (err) {
      console.error(`File not found: ${remoteFilePath}`);
      return res.status(404).send('File not found');
    }

    await client.downloadTo(localFilePath, remoteFilePath);
    res.sendFile(localFilePath, (err) => {
      if (err) {
        console.error(`Error sending file: ${err}`);
      }

      // 일정 시간 후 파일 삭제 (예: 10초 후)
      setTimeout(() => {
        fs.unlink(localFilePath, (err) => {
          if (err) console.error(`Error deleting file: ${err}`);
          else console.log(`Deleted file: ${localFilePath}`);
        });
      }, 10000);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
  client.close();
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
