const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const port = 4000;
app.use(cors());
require("dotenv").config(); // 모듈 불러오기
app.use(express.json());

let plans = [
  // {
  //   user_id: "0",
  //   plan_id: "1",
  //   name: "일본 여행",
  //   city: ["도쿄", "오사카"],
  //   startDate: "2023.7.12",
  //   endDate: "2023.7.15",
  //   selectPlaces: [
  //     {
  //       palce_id: "d23152",
  //       name: "오마카세",
  //       rating: "",
  //       user_rating: "",
  //       isSelect: true,
  //       day: "",
  //     },
  //     {
  //       palce_id: "d231rqwe52",
  //       name: "오사카 성",
  //       rating: "",
  //       user_rating: "",
  //       isSelect: true,
  //       day: "",
  //     },
  //   ],
  // },
  // {
  //   user_id: "0",
  //   plan_id: "2",
  //   name: "중국 여행",
  //   city: ["베이징", "텐진", "청두"],
  //   startDate: "2023.8.12",
  //   endDate: "2023.8.20",
  //   selectPlaces: [
  //     {
  //       palce_id: "d23159823742",
  //       name: "중국집",
  //       rating: "",
  //       user_rating: "",
  //       isSelect: true,
  //       day: "",
  //     },
  //     {
  //       palce_id: "d2315760346552",
  //       name: "중국 성",
  //       rating: "",
  //       user_rating: "",
  //       isSelect: true,
  //       day: "",
  //     },
  //   ],
  // },
];

let posts = Array.from(Array(40).keys()).map((post_id) => {
  const tags = ["식도락", "빡빡한", "여유로운", "관광지", "휴양지", "자연"][
    Math.floor(Math.random() * 6)
  ];
  return {
    post_id,
    title: `테스트 제목입니다. ${post_id}`,
    content: `테스트 내용입니다. ${post_id}`,
    tags,
    user_id: Math.floor(Math.random() * 3),
    plan_id: Math.floor(Math.random() * 3),
  };
});

// 모든 게시글 조회
app.get("/api/post", async (req, res) => {
  res.json([...posts]);
});

let postId = 100;

// 게시글 등록
app.post("/api/post", async (req, res) => {
  const newPost = {
    ...req.body,
    post_id: postId++,
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// 게시글 수정
app.put("/api/post/:post_id", async (req, res) => {
  const { post_id } = req.params;
  const updatedPost = req.body;
  const index = posts.findIndex((post) => post.post_id === post_id);

  if (index === -1) {
    res.status(404).json({ message: "여행 계획이 없습니다." });
  } else {
    posts[index] = { ...updatedPost, post_id };
    res.json(posts[index]);
  }
});

// 게시글 삭제
app.delete("/api/post/:post_id", async (req, res) => {
  const { post_id } = req.params;

  try {
    posts = posts.filter((post) => post.post_id !== post_id);
  } catch (err) {
    console.log(err);
  }

  res.sendStatus(204);
});

// 사용자가 작성한 플랜 조회하는 API
app.get("/api/plan/:user_id", async (req, res) => {
  console.log(req.params);
  console.log(req.params.user_id);
  res.json(plans.filter((plan) => plan.user_id === req.params.user_id));
});

// 특정 여행 계획을 조회하는 API
app.get("/api/plan/:user_id/:plan_id", async (req, res) => {
  console.log(req.params);
  console.log(req.params.plan_id);
  res.json(plans.find((plan) => plan.plan_id === req.params.plan_id));
});

let num = 0;

// 여행 계획을 저장하는 API
app.post("/api/plan", async (req, res) => {
  const newPlan = {
    ...req.body,
    plan_id: String(num++),
  };
  plans.push(newPlan);
  res.status(201).json(newPlan);
});

// 여행 계획을 수정하는 API
app.put("/api/plan/:plan_id", async (req, res) => {
  const { plan_id } = req.params;
  const updatedPlan = req.body;
  const index = plans.findIndex((plan) => plan.plan_id === plan_id);

  if (index === -1) {
    res.status(404).json({ message: "여행 계획이 없습니다." });
  } else {
    plans[index] = { ...updatedPlan, plan_id };
    res.json(plans[index]);
  }
});

// 여행 계획을 삭제하는 API
app.delete("/api/plan/:plan_id", async (req, res) => {
  const { plan_id } = req.params;
  console.log(plan_id);
  try {
    plans = plans.filter((plan) => plan.plan_id !== plan_id);
  } catch (err) {
    console.log(err);
  }

  res.sendStatus(204);
});

app.get("/api/search", async (req, res) => {
  const { keyword, latitude, longitude, radius } = req.query;
  const params = new URLSearchParams();

  params.set("query", keyword);
  // 지정한 좌표와 검색 반경 추가
  params.set("location", `${latitude},${longitude}`);
  params.set("radius", radius);
  params.set("key", process.env.NODE_ENV_GOOGLE_API_KEY);

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;

  try {
    const result = await axios.get(url);
    console.log(result.data);
    nextPageToken = result.data.next_page_token || null;
    const test = result.data.results;
    res.send(test);
  } catch (error) {
    console.log(error);
    res.sendStatus(500).send("요청 처리에 실패했습니다.");
  }
});

// 포트 넘버 설정
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
