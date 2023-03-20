const axios = require("axios");

exports.test = async (req, res, next) => {
  try {
    if (!req.session.jwt) {
      const tokenResult = await axios.post("http://localhost:8002/v1/token", {
        clientSecret: process.env.CLIENT_SECRET,
      });
      if (tokenResult.data?.code === 200) {
        // 토큰 발급 성공했을 때
        req.session.jwt = tokenResult.data.token;
      } else {
        // 토큰 발급 실패했을 때
        return res.status(tokenResult.data?.code).json(tokenResult.data);
      }
    }
    const result = await axios.get("http://localhost:8002/v1/test", {
      headers: {
        authorization: req.session.jwt,
      },
    });
    return res.json(result.data);
  } catch (error) {
    console.error(error);
    if (error.response?.status === 419) {
      // 토큰 만료 됐을 경우
      return res.json(error.response.data);
    }
    return next(error);
  }
};
