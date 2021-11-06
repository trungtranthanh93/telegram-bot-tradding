const axios = require("axios");
const url = "http://localhost:5555/api/trade/v1/auto-bet";
module.exports.sendApiToCopyTrade =  function (order, price, isQuickOrder, botId) {
  let data = {
    betType: "UP",
    betAmount: "10",
    betAccountType: "DEMO",
    botId: 1,
    percent: 1,
  };
  axios
    .post(url, data)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
}
