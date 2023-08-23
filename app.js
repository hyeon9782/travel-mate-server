const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const port = 4000;
app.use(cors());
require("dotenv").config(); // 모듈 불러오기
app.use(express.json());

let plans = Array.from(Array(1).keys()).map((plan_id) => {
  const cities = [
    {
      city: "나가사키",
      country: "일본",
      isDomestic: false,
      region: "일본",
      location: { lat: 33.4825, lng: 126.5311 },
      related: ["나가사키", "사가", "사세보", "운젠"],
      isSelect: false,
    },
    {
      city: "오키나와",
      country: "일본",
      isDomestic: false,
      region: "일본",
      location: { lat: 33.4825, lng: 126.5311 },
      related: ["오키나와"],
      isSelect: false,
    },
  ];

  const selectedPlaces = [
    {
      place_id: "dasjhd8u6fduat",
      name: "황제짜장",
      user_ratings_total: "3.6",
      rating: "34",
      types: ["food"],
      geometry: {
        location: { lat: 33.4825, lng: 126.5311 },
      },
      memo: "테스트 메모입니다! 1",
      isSelect: true,
      day: 1,
      order: 1,
    },
    {
      place_id: "d892654d8u6fduat",
      name: "인천짜장",
      user_ratings_total: "7.6",
      rating: "67",
      types: ["food"],
      geometry: {
        location: { lat: 37.426998, lng: 126.674815 },
      },
      memo: "테스트 메모입니다! 2",
      isSelect: true,
      day: 1,
      order: 2,
    },
  ];
  return {
    plan_id,
    user_id: "hyeon9782@gmail.com",
    title: "먹부림 여행",
    cities,
    period: ["2023-08-10", "2023-08-12"],
    selectedPlaces,
  };
});

let posts = Array.from(Array(100).keys()).map((post_id) => {
  const tags = [];
  for (let i = 0; i < 3; i++) {
    tags.push(
      ["식도락", "빡빡한", "여유로운", "관광지", "휴양지", "자연"][
        Math.floor(Math.random() * 6)
      ]
    );
  }
  return {
    post_id,
    title: `테스트 제목입니다. ${post_id}`,
    content: `테스트 내용입니다. ${post_id}`,
    tags,
    category: ["동행 모집", "여행 질문"][Math.floor(Math.random() * 2)],
    deadline: ["2023.08.12", "2023.08.01", "2023.10.01"][
      Math.floor(Math.random() * 3)
    ],
    views: [35, 64, 13, 46, 23, 99, 0, 1, 82][Math.floor(Math.random() * 8)],
    user_name: ["개똥이", "복실이", "튼튼이"][Math.floor(Math.random() * 3)],
    user_id: Math.floor(Math.random() * 3),
    plan_id: Math.floor(Math.random() * 3),
  };
});

/////////////////////////////////////// 게시글 시작 ///////////////////////////////////////////

// 모든 게시글 조회 (페이징)
app.get("/api/post", async (req, res) => {
  const { page, category } = req.query;
  console.log(category);
  const pageSize = 5; // 한 페이지에 표시할 게시글 수
  const startIndex = (Number(page) - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  let newPosts = [];
  if (category !== "전체") {
    newPosts = posts.filter((post) => post.category === category);
  } else {
    console.log("없음");
    newPosts = [...posts];
  }
  // console.log(newPosts);

  res.json(newPosts.reverse().slice(startIndex, endIndex));
});

app.get("/api/post/:post_id", async (req, res) => {
  const { post_id } = req.params;
  console.log(post_id);
  const post = posts.find((post) => post.post_id === Number(post_id));
  console.log(post);
  res.json(post);
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
  const index = posts.findIndex((post) => post.post_id === Number(post_id));

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
    posts = posts.filter((post) => post.post_id !== Number(post_id));
  } catch (err) {
    console.log(err);
  }

  res.sendStatus(204);
});

/////////////////////////////////////// 게시글 끝 ///////////////////////////////////////////

/////////////////////////////////////// 플랜 시작 ///////////////////////////////////////////

// 사용자가 작성한 플랜 조회하는 API
app.get("/api/plan", async (req, res) => {
  const user_id = req.query.user_id;
  console.log(user_id);

  const newPlans = plans.filter((plan) => plan.user_id === user_id);
  res.json([...newPlans]);
});

// 특정 여행 계획을 조회하는 API
app.get("/api/plan/:plan_id", async (req, res) => {
  const plan_id = Number(req.params.plan_id);
  const plan = plans.find((plan) => plan.plan_id === plan_id);
  console.log(plan);
  res.json(plan);
});

let num = 425;

// 여행 계획을 저장하는 API
app.post("/api/plan", async (req, res) => {
  console.log("-----------------plan-------------------");
  console.log(req.body);
  const newPlan = {
    ...req.body,
    plan_id: num++,
  };

  plans.push(newPlan);
  res.status(201).json(newPlan);
});

// 여행 계획을 수정하는 API
app.put("/api/plan/:plan_id", async (req, res) => {
  const { plan_id } = req.params;
  const updatedPlan = req.body;
  const index = plans.findIndex((plan) => plan.plan_id === Number(plan_id));

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
    plans = plans.filter((plan) => plan.plan_id !== Number(plan_id));
  } catch (err) {
    console.log(err);
  }

  res.sendStatus(204);
});

/////////////////////////////////////// 플랜 끝 ///////////////////////////////////////////

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

///////////////////////////////////// 유저 시작 ////////////////////////////////////////////

// 포트 넘버 설정
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
