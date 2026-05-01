import { MoodOption } from "@/types";

export const moods: MoodOption[] = [
  {
    id: "healing",
    label: "ฮีลใจ",
    emoji: "🌿",
    description: "พักผ่อน ผ่อนคลาย ชาร์จพลัง",
    color: "#10B981",
  },
  {
    id: "foodie",
    label: "สายกิน",
    emoji: "🍜",
    description: "ตะลุยของอร่อย ร้านเด็ด",
    color: "#F59E0B",
  },
  {
    id: "photo",
    label: "ถ่ายรูป",
    emoji: "📸",
    description: "หามุมสวย ถ่ายรูปเก๋ๆ",
    color: "#EC4899",
  },
  {
    id: "nature",
    label: "ธรรมชาติ",
    emoji: "🌳",
    description: "สัมผัสธรรมชาติ ลมเย็นๆ",
    color: "#14B8A6",
  },
  {
    id: "culture",
    label: "วัฒนธรรม",
    emoji: "🏛️",
    description: "เรียนรู้ประวัติศาสตร์ ศิลปะ",
    color: "#8B5CF6",
  },
  {
    id: "solo",
    label: "คนเดียว",
    emoji: "🎧",
    description: "ใช้เวลากับตัวเอง อิสระ",
    color: "#6366F1",
  },
  {
    id: "couple",
    label: "กับแฟน",
    emoji: "💕",
    description: "โรแมนติก สร้างความทรงจำ",
    color: "#F472B6",
  },
  {
    id: "family",
    label: "ครอบครัว",
    emoji: "👨‍👩‍👧",
    description: "สบายๆ ไม่เหนื่อย ทุกวัย",
    color: "#F97316",
  },
  {
    id: "budget",
    label: "งบน้อย",
    emoji: "✨",
    description: "สนุกได้ไม่ต้องใช้เยอะ",
    color: "#06B6D4",
  },
];

export const provinces = [
  "กรุงเทพ",
  "เชียงใหม่",
  "เชียงราย",
  "พัทยา",
  "ภูเก็ต",
  "กระบี่",
  "น่าน",
  "อยุธยา",
  "กาญจนบุรี",
  "หัวหิน",
  "เขาใหญ่",
  "สุโขทัย",
];

export const transportModes = [
  { id: "public", label: "สาธารณะ", emoji: "🚇" },
  { id: "walk", label: "เดิน", emoji: "🚶" },
  { id: "car", label: "รถยนต์", emoji: "🚗" },
  { id: "bike", label: "จักรยาน", emoji: "🚲" },
  { id: "boat", label: "เรือ", emoji: "🚤" },
];
