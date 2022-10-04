const http = require('http');

exports.handler = async () => {
  
  const res:any = await new Promise((resolve, reject) => {
    http.get(
      "http://localhost:2772/applications/Test/environments/sandbox/configurations/AppConfigHosted",
      resolve
    );
  });
  
  let configData:string = await new Promise((resolve, reject) => {
    let data = '';
    res.on('data', (chunk:any) => data += chunk);
    res.on('error', (err:any) => reject(err));
    res.on('end', () => resolve(data));
  });
  
  const parsedConfigData = JSON.parse(configData);

  const response = {
    statusCode: 200,
    body: parsedConfigData,
  };
  return response;
};