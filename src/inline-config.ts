exports.handler = async () => {
  
  const configData = "{\"EMP_A01\":[{\"observation\":{\"observationType\":\"EMP_A\",\"observationTypeReason\":\"01\",\"senderPartyID\":\"78\"},\"processPhase\":{\"logisticProcessCategoryCode\":2,\"logisticProcessStateCode\":0,\"operatorCode\":98,\"operatorProcessCode\":101,\"operatorProcessStateCode\":0},\"destinations\":[\"ParcelReferenceHandler\"]}]}"
  const parsedConfigData = JSON.parse(configData);
         
  // add result limit code here

  const response = {
    statusCode: 200,
    body: parsedConfigData,
  };
  return response;
};