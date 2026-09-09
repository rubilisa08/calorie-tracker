// 2026-09-09 확장: 국밥/면류/한식일품/탕찌개/죽/일식/중식/양식/빵/음료/견과/분식
// 각 항목: 1인분(또는 표준 단위) 총량 기준 자료를 100g당으로 환산.
// countUnit: true면 unitType:"count" (그램 대신 "몇 인분/개"로 입력), false면 기존처럼 그램 입력.
const NEW_FOODS = [
  // ---- 국밥·덮밥 (count) ----
  { id: "sundae_gukbap", name: "순대국밥", emoji: "🍲", category: "국밥·덮밥", countUnit: true, servingG: 600, servingLabel: "1그릇", cal: 61, carb: 8.6, protein: 4.6, fat: 0.9 },
  { id: "dwaeji_gukbap", name: "돼지국밥", emoji: "🍲", category: "국밥·덮밥", countUnit: true, servingG: 600, servingLabel: "1그릇", cal: 74, carb: 5.6, protein: 6.5, fat: 2.9 },
  { id: "beef_gukbap", name: "소고기국밥", emoji: "🍲", category: "국밥·덮밥", countUnit: true, servingG: 600, servingLabel: "1그릇", cal: 48, carb: 5.4, protein: 3.6, fat: 1.3 },
  { id: "kongnamul_gukbap", name: "콩나물국밥", emoji: "🍲", category: "국밥·덮밥", countUnit: true, servingG: 600, servingLabel: "1그릇", cal: 74, carb: 11.1, protein: 3.7, fat: 1.7 },
  { id: "bibimbap", name: "비빔밥", emoji: "🍚", category: "국밥·덮밥", countUnit: true, servingG: 450, servingLabel: "1인분", cal: 127, carb: 17.5, protein: 4.8, fat: 4.2 },
  { id: "hoe_bibimbap", name: "회비빔밥", emoji: "🍚", category: "국밥·덮밥", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 147, carb: 25.8, protein: 7.2, fat: 1.7 },
  { id: "japchae_bap", name: "잡채밥", emoji: "🍚", category: "국밥·덮밥", countUnit: true, servingG: 650, servingLabel: "1인분", cal: 136, carb: 18.7, protein: 4.1, fat: 5.0 },
  { id: "omurice", name: "오므라이스", emoji: "🍳", category: "국밥·덮밥", countUnit: true, servingG: 400, servingLabel: "1인분", cal: 183, carb: 22.8, protein: 6.9, fat: 7.1 },
  { id: "curry_rice", name: "카레라이스", emoji: "🍛", category: "국밥·덮밥", countUnit: true, servingG: 400, servingLabel: "1인분", cal: 121, carb: 18.1, protein: 4.5, fat: 3.4 },
  { id: "egg_fried_rice", name: "계란볶음밥", emoji: "🍳", category: "국밥·덮밥", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 155, carb: 21.3, protein: 4.7, fat: 5.7 },

  // ---- 면류 (count) ----
  { id: "kalguksu", name: "칼국수", emoji: "🍜", category: "면류", countUnit: true, servingG: 600, servingLabel: "1인분", cal: 70, carb: 12.3, protein: 2.6, fat: 1.2 },
  { id: "janchi_guksu", name: "잔치국수", emoji: "🍜", category: "면류", countUnit: true, servingG: 600, servingLabel: "1인분", cal: 55, carb: 9.6, protein: 2.1, fat: 0.9 },
  { id: "kong_guksu", name: "콩국수", emoji: "🍜", category: "면류", countUnit: true, servingG: 600, servingLabel: "1인분", cal: 86, carb: 8.6, protein: 7.5, fat: 2.4 },
  { id: "makguksu", name: "막국수", emoji: "🍜", category: "면류", countUnit: true, servingG: 250, servingLabel: "1인분", cal: 182, carb: 31.9, protein: 6.8, fat: 3.0 },
  { id: "rabokki", name: "라볶이", emoji: "🍜", category: "면류", countUnit: true, servingG: 200, servingLabel: "1인분", cal: 203, carb: 30.5, protein: 6.1, fat: 6.3 },
  { id: "jjolmyeon", name: "쫄면", emoji: "🍜", category: "면류", countUnit: true, servingG: 200, servingLabel: "1인분", cal: 115, carb: 20.1, protein: 3.5, fat: 2.3 },
  { id: "bibim_guksu", name: "비빔국수", emoji: "🍜", category: "면류", countUnit: true, servingG: 350, servingLabel: "1인분", cal: 121, carb: 21.2, protein: 3.6, fat: 2.4 },
  { id: "bokkeum_udon", name: "볶음우동", emoji: "🍜", category: "면류", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 128, carb: 17.6, protein: 4.8, fat: 4.3 },
  { id: "naeng_soba", name: "냉모밀(소바)", emoji: "🍜", category: "면류", countUnit: true, servingG: 250, servingLabel: "1인분", cal: 112, carb: 20.6, protein: 3.2, fat: 1.9 },

  // ---- 한식 일품요리 (count) ----
  { id: "japchae", name: "잡채", emoji: "🍜", category: "한식일품", countUnit: true, servingG: 200, servingLabel: "1인분", cal: 144, carb: 21.6, protein: 3.6, fat: 4.8 },
  { id: "galbijjim", name: "갈비찜", emoji: "🍖", category: "한식일품", countUnit: true, servingG: 250, servingLabel: "1인분", cal: 198, carb: 7.4, protein: 14.9, fat: 12.1 },
  { id: "jjimdak", name: "찜닭", emoji: "🍗", category: "한식일품", countUnit: true, servingG: 200, servingLabel: "1인분", cal: 143, carb: 12.5, protein: 10.7, fat: 5.6 },
  { id: "dakgalbi", name: "닭갈비", emoji: "🍗", category: "한식일품", countUnit: true, servingG: 400, servingLabel: "1인분", cal: 98, carb: 6.1, protein: 7.4, fat: 4.9 },
  { id: "bulgogi", name: "불고기", emoji: "🥩", category: "한식일품", countUnit: true, servingG: 200, servingLabel: "1인분", cal: 220, carb: 8, protein: 22, fat: 11 },
  { id: "ojingeo_bokkeum", name: "오징어볶음", emoji: "🦑", category: "한식일품", countUnit: true, servingG: 180, servingLabel: "1인분", cal: 175, carb: 10.9, protein: 13.1, fat: 8.8 },
  { id: "gochujang_bulgogi", name: "고추장불고기", emoji: "🥩", category: "한식일품", countUnit: true, servingG: 200, servingLabel: "1인분", cal: 230, carb: 9, protein: 21, fat: 12 },
  { id: "dubu_jorim", name: "두부조림", emoji: "🍲", category: "한식일품", countUnit: true, servingG: 150, servingLabel: "1인분", cal: 95, carb: 3.5, protein: 8.5, fat: 5.2 },
  { id: "gyeranjjim", name: "계란찜", emoji: "🥚", category: "한식일품", countUnit: true, servingG: 150, servingLabel: "1인분", cal: 119, carb: 1.5, protein: 10.4, fat: 7.9 },
  { id: "gamja_jorim", name: "감자조림", emoji: "🥔", category: "한식일품", countUnit: true, servingG: 150, servingLabel: "1인분", cal: 115, carb: 22, protein: 2.2, fat: 1.5 },
  { id: "myeolchi_bokkeum", name: "멸치볶음", emoji: "🐟", category: "한식일품", countUnit: true, servingG: 50, servingLabel: "1인분", cal: 138, carb: 6.9, protein: 15.5, fat: 5.4 },
  { id: "jinmichae_bokkeum", name: "진미채볶음", emoji: "🦑", category: "한식일품", countUnit: true, servingG: 90, servingLabel: "1인분", cal: 289, carb: 18.1, protein: 21.7, fat: 14.4 },

  // ---- 탕·찌개 (count) ----
  { id: "gamjatang", name: "감자탕", emoji: "🍲", category: "탕·찌개", countUnit: true, servingG: 430, servingLabel: "1인분", cal: 60, carb: 3.3, protein: 6.7, fat: 2.3 },
  { id: "maeuntang", name: "매운탕", emoji: "🐟", category: "탕·찌개", countUnit: true, servingG: 400, servingLabel: "1인분", cal: 53, carb: 2.7, protein: 6.6, fat: 1.8 },
  { id: "altang", name: "알탕", emoji: "🐟", category: "탕·찌개", countUnit: true, servingG: 400, servingLabel: "1인분", cal: 94, carb: 2.4, protein: 10.6, fat: 4.7 },
  { id: "cheonggukjang_jjigae", name: "청국장찌개", emoji: "🍲", category: "탕·찌개", countUnit: true, servingG: 480, servingLabel: "1인분", cal: 57, carb: 7.3, protein: 5.2, fat: 0.8 },
  { id: "sogogi_muguk", name: "소고기무국", emoji: "🍲", category: "탕·찌개", countUnit: true, servingG: 400, servingLabel: "1인분", cal: 27, carb: 1.4, protein: 3.4, fat: 0.9 },
  { id: "bugeoguk", name: "북엇국", emoji: "🐟", category: "탕·찌개", countUnit: true, servingG: 400, servingLabel: "1인분", cal: 35, carb: 2, protein: 4.5, fat: 1 },
  { id: "gyeranguk", name: "계란국", emoji: "🥚", category: "탕·찌개", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 40, carb: 2, protein: 3.5, fat: 2 },
  { id: "tteokguk", name: "떡국", emoji: "🍲", category: "탕·찌개", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 115, carb: 20.1, protein: 5.8, fat: 1.3 },

  // ---- 밑반찬·김치 (weight — 그램 정밀 기록이 자연스러운 카테고리) ----
  { id: "baechu_kimchi", name: "배추김치", emoji: "🥬", category: "밑반찬·김치", countUnit: false, servingG: 50, servingLabel: "1인분", cal: 30, carb: 5.2, protein: 1.6, fat: 0.2 },
  { id: "kkakdugi", name: "깍두기", emoji: "🥬", category: "밑반찬·김치", countUnit: false, servingG: 50, servingLabel: "1인분", cal: 28, carb: 5.5, protein: 1.1, fat: 0.1 },
  { id: "yeolmu_kimchi", name: "열무김치", emoji: "🥬", category: "밑반찬·김치", countUnit: false, servingG: 50, servingLabel: "1인분", cal: 26, carb: 4.8, protein: 1.3, fat: 0.2 },
  { id: "doraji_muchim", name: "도라지무침", emoji: "🥗", category: "밑반찬·김치", countUnit: false, servingG: 50, servingLabel: "1인분", cal: 65, carb: 11, protein: 1.8, fat: 1.5 },
  { id: "kongjaban", name: "콩자반", emoji: "🫘", category: "밑반찬·김치", countUnit: false, servingG: 50, servingLabel: "1인분", cal: 180, carb: 20, protein: 14, fat: 5 },
  { id: "eomuk_bokkeum", name: "어묵볶음", emoji: "🍢", category: "밑반찬·김치", countUnit: false, servingG: 50, servingLabel: "1인분", cal: 155, carb: 12, protein: 8, fat: 8 },
  { id: "gyeranmari", name: "계란말이", emoji: "🥚", category: "밑반찬·김치", countUnit: false, servingG: 100, servingLabel: "1인분", cal: 218, carb: 6.4, protein: 12.5, fat: 14.8 },

  // ---- 죽 (count) ----
  { id: "huinjuk", name: "흰죽", emoji: "🥣", category: "죽", countUnit: true, servingG: 400, servingLabel: "1인분", cal: 54, carb: 12.2, protein: 1.1, fat: 0.1 },
  { id: "jeonbokjuk", name: "전복죽", emoji: "🥣", category: "죽", countUnit: true, servingG: 270, servingLabel: "1인분", cal: 56, carb: 11.1, protein: 1.5, fat: 0.7 },
  { id: "yachaejuk", name: "야채죽", emoji: "🥣", category: "죽", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 62, carb: 12, protein: 1.8, fat: 0.8 },
  { id: "danhobakjuk", name: "단호박죽", emoji: "🥣", category: "죽", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 68, carb: 14.5, protein: 1.4, fat: 0.5 },

  // ---- 일식 (count) ----
  { id: "modum_sushi", name: "초밥(모둠)", emoji: "🍣", category: "일식", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 154, carb: 19.3, protein: 9.6, fat: 4.3 },
  { id: "modum_hoe", name: "회(모둠)", emoji: "🐟", category: "일식", countUnit: true, servingG: 250, servingLabel: "1인분", cal: 120, carb: 1, protein: 22, fat: 3 },
  { id: "gyudon", name: "규동", emoji: "🍚", category: "일식", countUnit: true, servingG: 350, servingLabel: "1인분", cal: 150, carb: 19.7, protein: 3.4, fat: 5.4 },
  { id: "katsudon", name: "가츠동", emoji: "🍚", category: "일식", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 217, carb: 24.4, protein: 13.5, fat: 7.2 },
  { id: "ramen_japanese", name: "라멘(일본식)", emoji: "🍜", category: "일식", countUnit: true, servingG: 500, servingLabel: "1그릇", cal: 100, carb: 11.3, protein: 5.0, fat: 3.9 },
  { id: "onigiri", name: "오니기리", emoji: "🍙", category: "일식", countUnit: true, servingG: 110, servingLabel: "1개", cal: 170, carb: 30, protein: 4, fat: 3.5 },
  { id: "takoyaki", name: "타코야키", emoji: "🐙", category: "일식", countUnit: true, servingG: 120, servingLabel: "1인분(6개)", cal: 210, carb: 28, protein: 7, fat: 7.5 },

  // ---- 중식 (count) ----
  { id: "kkanpunggi", name: "깐풍기", emoji: "🍗", category: "중식", countUnit: true, servingG: 150, servingLabel: "1인분", cal: 230, carb: 18.3, protein: 12.6, fat: 11.8 },
  { id: "yurinji", name: "유린기", emoji: "🍗", category: "중식", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 190, carb: 15, protein: 14, fat: 9 },
  { id: "palbochae", name: "팔보채", emoji: "🦐", category: "중식", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 110, carb: 8, protein: 9, fat: 5.5 },
  { id: "yangjangpi", name: "양장피", emoji: "🥗", category: "중식", countUnit: true, servingG: 200, servingLabel: "1인분", cal: 286, carb: 25, protein: 14.3, fat: 14.3 },
  { id: "gochu_japchae", name: "고추잡채", emoji: "🫑", category: "중식", countUnit: true, servingG: 200, servingLabel: "1인분", cal: 160, carb: 8, protein: 12, fat: 9.5 },
  { id: "mapo_tofu", name: "마파두부", emoji: "🌶️", category: "중식", countUnit: true, servingG: 250, servingLabel: "1인분", cal: 134, carb: 5.0, protein: 10.1, fat: 8.2 },
  { id: "menbosha", name: "멘보샤", emoji: "🍤", category: "중식", countUnit: true, servingG: 90, servingLabel: "3조각", cal: 247, carb: 15.4, protein: 12.4, fat: 15.1 },
  { id: "dimsum", name: "딤섬(모둠)", emoji: "🥟", category: "중식", countUnit: true, servingG: 200, servingLabel: "1인분(6개)", cal: 200, carb: 22, protein: 9, fat: 8.5 },

  // ---- 양식 (count) ----
  { id: "steak_sirloin", name: "스테이크(안심)", emoji: "🥩", category: "양식", countUnit: true, servingG: 200, servingLabel: "1인분", cal: 220, carb: 1, protein: 27, fat: 12 },
  { id: "risotto", name: "리조또", emoji: "🍚", category: "양식", countUnit: true, servingG: 250, servingLabel: "1인분", cal: 140, carb: 15.8, protein: 4.2, fat: 6.7 },
  { id: "cream_pasta", name: "크림파스타", emoji: "🍝", category: "양식", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 217, carb: 19, protein: 8.1, fat: 12.1 },
  { id: "tomato_pasta", name: "토마토파스타", emoji: "🍝", category: "양식", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 143, carb: 19.7, protein: 5.4, fat: 4.8 },
  { id: "omelette", name: "오믈렛", emoji: "🍳", category: "양식", countUnit: true, servingG: 150, servingLabel: "1인분", cal: 200, carb: 3, protein: 14, fat: 15 },
  { id: "caesar_salad", name: "시저샐러드", emoji: "🥗", category: "양식", countUnit: true, servingG: 230, servingLabel: "1인분", cal: 185, carb: 9.3, protein: 9.3, fat: 12.3 },
  { id: "green_salad", name: "그린샐러드", emoji: "🥗", category: "양식", countUnit: true, servingG: 150, servingLabel: "1인분", cal: 45, carb: 5, protein: 1.5, fat: 2 },
  { id: "hamburg_steak", name: "함박스테이크", emoji: "🍖", category: "양식", countUnit: true, servingG: 200, servingLabel: "1인분", cal: 175, carb: 8, protein: 14, fat: 10.5 },
  { id: "gratin", name: "그라탱", emoji: "🧀", category: "양식", countUnit: true, servingG: 250, servingLabel: "1인분", cal: 190, carb: 15, protein: 8, fat: 11 },
  { id: "lasagna", name: "라자냐", emoji: "🍝", category: "양식", countUnit: true, servingG: 380, servingLabel: "1인분", cal: 168, carb: 21.4, protein: 13.4, fat: 3.3 },
  { id: "meatball_pasta", name: "미트볼파스타", emoji: "🍝", category: "양식", countUnit: true, servingG: 300, servingLabel: "1인분", cal: 165, carb: 18, protein: 9, fat: 6 },
  { id: "eggs_benedict", name: "에그베네딕트", emoji: "🍳", category: "양식", countUnit: true, servingG: 200, servingLabel: "1인분", cal: 220, carb: 14, protein: 10, fat: 14 },
  { id: "caprese_salad", name: "카프레제샐러드", emoji: "🍅", category: "양식", countUnit: true, servingG: 250, servingLabel: "1인분", cal: 128, carb: 4.8, protein: 8.0, fat: 8.5 },
  { id: "cream_soup", name: "크림수프", emoji: "🍵", category: "양식", countUnit: true, servingG: 250, servingLabel: "1인분", cal: 90, carb: 7, protein: 2.5, fat: 6 },
  { id: "pilaf", name: "필라프", emoji: "🍚", category: "양식", countUnit: true, servingG: 250, servingLabel: "1인분", cal: 155, carb: 22, protein: 4, fat: 5.5 },

  // ---- 빵·베이커리 (weight — 기존 식빵·토스트와 동일 컨벤션) ----
  { id: "baguette", name: "바게트", emoji: "🥖", category: "빵·베이커리", countUnit: false, servingG: 40, servingLabel: "1쪽", cal: 270, carb: 56, protein: 9, fat: 0.5 },
  { id: "ciabatta", name: "치아바타", emoji: "🍞", category: "빵·베이커리", countUnit: false, servingG: 57, servingLabel: "1쪽", cal: 271, carb: 50.9, protein: 8.8, fat: 8.8 },
  { id: "bagel", name: "베이글", emoji: "🥯", category: "빵·베이커리", countUnit: false, servingG: 100, servingLabel: "1개", cal: 275, carb: 49, protein: 10, fat: 0.8 },
  { id: "dinner_roll", name: "모닝빵", emoji: "🍞", category: "빵·베이커리", countUnit: false, servingG: 35, servingLabel: "1개", cal: 280, carb: 50, protein: 9, fat: 5 },
  { id: "pizza_bread", name: "피자빵", emoji: "🍕", category: "빵·베이커리", countUnit: false, servingG: 80, servingLabel: "1개", cal: 260, carb: 35, protein: 9, fat: 9 },

  // ---- 음료 (weight — 기존 유제품·음료와 동일 컨벤션) ----
  { id: "strawberry_smoothie", name: "딸기스무디", emoji: "🍓", category: "음료", countUnit: false, servingG: 300, servingLabel: "1잔", cal: 40, carb: 9, protein: 0.8, fat: 0.3 },
  { id: "grapefruit_ade", name: "자몽에이드", emoji: "🍊", category: "음료", countUnit: false, servingG: 350, servingLabel: "1잔", cal: 45, carb: 11, protein: 0.1, fat: 0 },
  { id: "beer", name: "맥주", emoji: "🍺", category: "음료", countUnit: false, servingG: 355, servingLabel: "1캔", cal: 43, carb: 3.6, protein: 0.5, fat: 0 },
  { id: "makgeolli", name: "막걸리", emoji: "🍶", category: "음료", countUnit: false, servingG: 300, servingLabel: "1병", cal: 46, carb: 6, protein: 1.5, fat: 0 },
  { id: "sports_drink", name: "이온음료", emoji: "🥤", category: "음료", countUnit: false, servingG: 500, servingLabel: "1병", cal: 24, carb: 6, protein: 0, fat: 0 },
  { id: "iced_tea", name: "아이스티", emoji: "🧊", category: "음료", countUnit: false, servingG: 300, servingLabel: "1잔", cal: 25, carb: 6.2, protein: 0, fat: 0 },
  { id: "ice_americano", name: "아이스아메리카노", emoji: "🧊", category: "음료", countUnit: false, servingG: 500, servingLabel: "1잔", cal: 2, carb: 0.3, protein: 0.1, fat: 0 },

  // ---- 견과·건강식품 (weight) ----
  { id: "walnut", name: "호두", emoji: "🌰", category: "견과·건강식품", countUnit: false, servingG: 20, servingLabel: "1줌", cal: 688, carb: 7.9, protein: 15.5, fat: 72 },
  { id: "peanut", name: "땅콩", emoji: "🥜", category: "견과·건강식품", countUnit: false, servingG: 20, servingLabel: "1줌", cal: 567, carb: 16, protein: 26, fat: 49 },
  { id: "granola", name: "그래놀라", emoji: "🥣", category: "견과·건강식품", countUnit: false, servingG: 40, servingLabel: "1회분", cal: 471, carb: 64, protein: 10, fat: 17 },
  { id: "protein_bar", name: "프로틴바", emoji: "💪", category: "견과·건강식품", countUnit: false, servingG: 60, servingLabel: "1개", cal: 380, carb: 40, protein: 30, fat: 12 },

  // ---- 분식 (count) ----
  { id: "eomuk_kkochi", name: "어묵꼬치", emoji: "🍢", category: "분식", countUnit: true, servingG: 100, servingLabel: "1인분", cal: 140, carb: 12, protein: 9, fat: 7 },
  { id: "gunmandu", name: "군만두", emoji: "🥟", category: "분식", countUnit: true, servingG: 150, servingLabel: "1인분", cal: 130, carb: 11.4, protein: 6.5, fat: 6.5 },
];

module.exports = NEW_FOODS;
