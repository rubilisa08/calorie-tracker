// Round 6 — 신규 98개 중 나머지 90개 검증 결과 반영 (2026-09-09)
// 각 항목: [기존값] → [수정값], 근거는 DATA_ACCURACY.md Round 6 참고
const CORRECTIONS = {
  hoe_bibimbap:        { carb: 22.9, protein: 6.4, fat: 3.4 }, // cal 147 유지, 육회비빔밥 300g 자료 매칭
  omurice:             { carb: 28.1, protein: 5.4, fat: 5.4 }, // cal 183 유지, 730kcal 1인분 자료의 직접 macro 채택
  egg_fried_rice:      { cal: 225, carb: 24.2, protein: 6.6, fat: 11.3 }, // 260g/584.71kcal 구체 자료
  rabokki:             { cal: 202, carb: 41, protein: 5, fat: 2 }, // 200g/405kcal 자료의 직접 macro 채택
  bibim_guksu:         { cal: 103, carb: 20.5, protein: 3, fat: 1 }, // 500g/512kcal 자료
  galbijjim:           { cal: 298, carb: 7.7, protein: 17.3, fat: 21.8 }, // 100g당 직접 명시 자료
  dakgalbi:            { cal: 182, carb: 12, protein: 17, fat: 7 }, // 100g당 126~182kcal, 단백질 15~20g 범위 자료
  myeolchi_bokkeum:    { cal: 235, carb: 12, protein: 18.5, fat: 10.3 }, // 100g당 220~250kcal 자료
  jinmichae_bokkeum:   { cal: 278, carb: 22.5, protein: 12.2, fat: 17.6 }, // 100g당 직접 명시 자료
  maeuntang:           { cal: 71, carb: 2.1, protein: 11.4, fat: 1.8 }, // 300g 자료 환산
  cheonggukjang_jjigae:{ cal: 47, carb: 1.9, protein: 5.0, fat: 1.9 }, // 200g 자료 환산
  yeolmu_kimchi:       { cal: 32, carb: 5.0, protein: 2.4, fat: 0.3 }, // 100g당 32kcal 자료
  doraji_muchim:       { cal: 93, carb: 16.7, protein: 2.8, fat: 2.8 }, // 93g 자료 환산
  eomuk_bokkeum:       { cal: 196, carb: 24.3, protein: 8.4, fat: 7.3 }, // 140g/275kcal 자료 환산
  huinjuk:             { cal: 72, carb: 16.3, protein: 1.5, fat: 0.1 }, // 100g당 72kcal 자료
  jeonbokjuk:          { cal: 134, carb: 26.6, protein: 3.6, fat: 1.7 }, // 100g당 134kcal 자료 (죽류 일괄 상향)
  yachaejuk:           { cal: 145, carb: 28.1, protein: 4.2, fat: 1.9 }, // 100g당 145kcal 자료
  danhobakjuk:         { cal: 142, carb: 30.3, protein: 2.9, fat: 1.04 }, // 100g당(호박죽) 142kcal 자료
  takoyaki:            { cal: 141, carb: 20, protein: 6.8, fat: 4 }, // 100g당 141kcal 자료
  cream_pasta:         { cal: 275, carb: 30.3, protein: 9.4, fat: 12.9 }, // 100g당 직접 명시 자료
  tomato_pasta:        { cal: 116, carb: 21.1, protein: 3.9, fat: 1.7 }, // 100g당 직접 명시 자료
  dinner_roll:         { cal: 316, carb: 59, protein: 9.1, fat: 4.9 }, // 100g당 316kcal 자료
  strawberry_smoothie: { cal: 87, carb: 16.4, protein: 0.9, fat: 2.0 }, // 100g당 86.6kcal + 비율 자료
  walnut:              { cal: 655, carb: 13.7, protein: 15.2, fat: 65.2 }, // USDA/한국 영양DB 인용 자료
  eomuk_kkochi:        { cal: 90, carb: 8, protein: 5, fat: 4 }, // 100g당 직접 명시 자료
  gunmandu:            { cal: 230, carb: 27, protein: 5, fat: 11.3 }, // 브랜드 제품(곰곰) 100g 표기
};

module.exports = CORRECTIONS;
