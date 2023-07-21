const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const port = 4000;
app.use(cors());
require("dotenv").config(); // 모듈 불러오기

const plans = [
  {
    userId: "0",
    planId: "1",
    name: "일본 여행",
    city: ["도쿄", "오사카"],
    startDate: "2023.7.12",
    endDate: "2023.7.15",
    selectPlaces: [
      {
        name: "오마카세",
        rating: "",
        user_rating: "",
        isSelect: true,
        day: "",
      },
      {
        name: "오사카 성",
        rating: "",
        user_rating: "",
        isSelect: true,
        day: "",
      },
    ],
  },
  {
    userId: "0",
    planId: "2",
    name: "중국 여행",
    city: ["베이징", "텐진", "청두"],
    startDate: "2023.8.12",
    endDate: "2023.8.20",
    selectPlaces: [
      {
        name: "중국집",
        rating: "",
        user_rating: "",
        isSelect: true,
        day: "",
      },
      {
        name: "중국 성",
        rating: "",
        user_rating: "",
        isSelect: true,
        day: "",
      },
    ],
  },
];

// 사용자가 작성한 플랜 조회하는 API
app.get("/api/plan/:userId", async (req, res) => {
  console.log(req.params);
  console.log(req.params.userId);
  res.json(plans.filter((plan) => plan.userId === req.params.userId));
});

// 특정 여행 계획을 조회하는 API
app.get("/api/plan/:planId", async (req, res) => {
  console.log(req.params);
  console.log(req.params.planId);
  res.json(plans.find((plan) => plan.planId === req.params.planId));
});

// 여행 계획을 저장하는 API
app.post("/api/plan", async (req, res) => {
  const newPlan = req.body;
  plans.push(newPlan);
  res.status(201).json(newPlan);
});

// 여행 계획을 수정하는 API
app.put("/api/plan/:planId", async (req, res) => {
  const { planId } = req.params;
  const updatedPlan = req.body;
  const index = plans.findIndex((plan) => plan.planId === planId);

  if (index === -1) {
    res.status(404).json({ message: "여행 계획이 없습니다." });
  } else {
    plans[index] = { ...updatedPlan, planId };
    res.json(plans[index]);
  }
});

// 여행 계획을 삭제하는 API
app.delete("/api/plan/:planId", async (req, res) => {
  const { planId } = req.params;
  plans = plans.filter((plan) => plan.planId !== planId);
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
