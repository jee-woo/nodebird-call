const axios = require("axios");
const URL = process.env.API_URL;
axios.defaults.headers.origin = process.env.ORIGIN;
// 요즘엔 common 넣는게 맞지만 없어도 동작함
// axios.defaults.headers.common.origin = 'http://localhost:4000';

/*
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
*/

const request = async (req, api) => {
  try {
    if (!req.session.jwt) {
      const tokenResult = await axios.post(`${URL}/token`, {
        clientSecret: process.env.CLIENT_SECRET,
      });
      req.session.jwt = tokenResult.data.token;
    }
    return await axios.get(`${URL}${api}`, {
      headers: { authorization: req.session.jwt },
    });
  } catch (error) {
    if (error.response?.status === 419) {
      // 토큰의 유효기간이 지난 경우
      delete req.session.jwt;
      return request(req, api); // 재귀 함수로 호출하면 토큰이 없어서 다시 발급 받게 됨
    }
    return error.response;
  }
};

exports.getMyPosts = async (req, res, next) => {
  try {
    const result = await request(req, "/posts/my");
    res.json(result.data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.searchByHashtag = async (req, res, next) => {
  try {
    const result = await request(
      req,
      `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}` // 한글 때문에 encodeURIComponent로 감싸줌
    );
    res.json(result.data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.renderMain = (req, res) => {
  res.render("main", { key: process.env.CLIENT_SECRET });
};
