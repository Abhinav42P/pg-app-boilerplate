

export const restFetchWrapper = function(restFetch) {
  return async function(...args){
    var data;
    await restFetch(...args).then((res) => {
      if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        error.status = res.status;
        throw error;
      } else {
        return res.json();
      }
    })
    .then((res) => {
      if (res.success) {
        data = res.data;
      }
    });

    return data;
  };
}

export const postRequest = function (restFetch, options = {})  {

  return async function(uri, data){
    var success = false, responseData;
    await restFetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) {
          const error = new Error("An error occurred while fetching the data.");
          error.status = res.status;
          throw error;
        } else {
          return res.json();
        }
      })
      .then((res) => {
        if (res.success) {
          success = true;
          responseData = options.getResponseData && res;
        }
      });

    if(options.getResponseData){
      return responseData;
    }else{
      return success;
    }
  }


}

