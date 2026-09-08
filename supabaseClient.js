// Supabase 프로젝트 설정
// Project Settings > API 에서 확인 가능한 값. anon/publishable key는 클라이언트에 노출되어도 안전한 키입니다.
const SUPABASE_URL = "https://ksrdizqubmeklkuawoin.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LAnHvCO0fz6gCg2IIVCbCg_CNb5bPqM";

const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
