exports.handler = async () => {        
  // add result limit code here
  const dummy = process.env.TABLE_NAME
  const alt_dummy = process.env.ALT_TABLE_NAME
  
  const response = {
    statusCode: 200,
    body: { 
      "DDB_EXECUTION_PLANS": {
        "PRIMARY": dummy,
        "SECONDARY": alt_dummy
      }
    },
  };
  return response;
};