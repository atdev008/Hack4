// Districts mapped by province name (both TH and EN)
export const districtsByProvince: Record<string, string[]> = {
  // TH
  กรุงเทพ: ["พระนคร", "ปทุมวัน", "สาทร", "บางรัก", "สีลม", "ราชเทวี", "จตุจักร", "ลาดพร้าว", "บางนา", "วัฒนา", "คลองเตย", "ห้วยขวาง", "ดินแดง", "พญาไท", "บางซื่อ", "ดุสิต", "บางกะปิ", "มีนบุรี", "หนองจอก", "ตลิ่งชัน", "ทวีวัฒนา", "บางแค", "ภาษีเจริญ", "บางพลัด", "บางกอกน้อย", "บางกอกใหญ่", "ธนบุรี", "คลองสาน", "ราษฎร์บูรณะ", "บางขุนเทียน", "จอมทอง", "ทุ่งครุ", "ประเวศ", "สวนหลวง", "พระโขนง", "บางเขน", "สายไหม", "ดอนเมือง", "หลักสี่", "ลาดกระบัง"],
  เชียงใหม่: ["เมืองเชียงใหม่", "เมืองเก่า", "นิมมานเหมินท์", "ช้างคลาน", "สันทราย", "หางดง", "แม่ริม", "สันกำแพง", "ดอยสะเก็ด", "สารภี", "แม่แตง", "เชียงดาว", "ฝาง", "แม่อาย", "พร้าว", "จอมทอง", "ฮอด", "ดอยเต่า"],
  เชียงราย: ["เมืองเชียงราย", "แม่สาย", "เชียงแสน", "เชียงของ", "แม่จัน", "พาน", "เวียงป่าเป้า", "แม่สรวย", "ดอยหลวง", "เทิง"],
  พัทยา: ["พัทยาเหนือ", "พัทยากลาง", "พัทยาใต้", "จอมเทียน", "นาเกลือ", "บางละมุง", "ศรีราชา", "สัตหีบ"],
  ภูเก็ต: ["เมืองภูเก็ต", "ป่าตอง", "กะรน", "กะตะ", "ราไวย์", "กมลา", "เชิงทะเล", "ถลาง", "ไม้ขาว"],
  กระบี่: ["เมืองกระบี่", "อ่าวนาง", "คลองม่วง", "เกาะลันตา", "เหนือคลอง", "คลองท่อม"],
  น่าน: ["เมืองน่าน", "ปัว", "เชียงกลาง", "ท่าวังผา", "บ่อเกลือ", "สันติสุข", "ภูเพียง"],
  อยุธยา: ["เมืองอยุธยา", "บางปะอิน", "อุทัย", "เสนา", "บางบาล", "นครหลวง", "ภาชี"],
  กาญจนบุรี: ["เมืองกาญจนบุรี", "ไทรโยค", "ศรีสวัสดิ์", "สังขละบุรี", "ทองผาภูมิ", "เอราวัณ", "ท่ามะกา"],
  หัวหิน: ["หัวหิน", "ชะอำ", "ปราณบุรี", "สามร้อยยอด", "กุยบุรี"],
  เขาใหญ่: ["ปากช่อง", "วังน้ำเขียว", "เขาใหญ่", "มวกเหล็ก", "นครราชสีมา"],
  สุโขทัย: ["เมืองสุโขทัย", "อุทยานประวัติศาสตร์", "ศรีสัชนาลัย", "สวรรคโลก", "ทุ่งเสลี่ยม"],
  // EN
  Bangkok: ["Phra Nakhon", "Pathum Wan", "Sathorn", "Bang Rak", "Silom", "Ratchathewi", "Chatuchak", "Lat Phrao", "Bang Na", "Watthana", "Khlong Toei", "Huai Khwang", "Din Daeng", "Phaya Thai", "Bang Sue", "Dusit", "Bang Kapi", "Min Buri", "Nong Chok", "Taling Chan", "Thawi Watthana", "Bang Khae", "Phasi Charoen", "Bang Phlat", "Bangkok Noi", "Bangkok Yai", "Thon Buri", "Khlong San", "Rat Burana", "Bang Khun Thian", "Chom Thong", "Thung Khru", "Prawet", "Suan Luang", "Phra Khanong", "Bang Khen", "Sai Mai", "Don Mueang", "Lak Si", "Lat Krabang"],
  "Chiang Mai": ["Mueang", "Old City", "Nimman", "Chang Klan", "San Sai", "Hang Dong", "Mae Rim", "San Kamphaeng", "Doi Saket", "Saraphi", "Mae Taeng", "Chiang Dao", "Fang", "Mae Ai", "Phrao", "Chom Thong", "Hot", "Doi Tao"],
  "Chiang Rai": ["Mueang", "Mae Sai", "Chiang Saen", "Chiang Khong", "Mae Chan", "Phan", "Wiang Pa Pao", "Mae Suai", "Doi Luang", "Thoeng"],
  Pattaya: ["North Pattaya", "Central Pattaya", "South Pattaya", "Jomtien", "Naklua", "Bang Lamung", "Si Racha", "Sattahip"],
  Phuket: ["Mueang Phuket", "Patong", "Karon", "Kata", "Rawai", "Kamala", "Cherng Talay", "Thalang", "Mai Khao"],
  Krabi: ["Mueang Krabi", "Ao Nang", "Khlong Muang", "Koh Lanta", "Nuea Khlong", "Khlong Thom"],
  Nan: ["Mueang Nan", "Pua", "Chiang Klang", "Tha Wang Pha", "Bo Kluea", "Santisuk", "Phu Phiang"],
  Ayutthaya: ["Mueang", "Bang Pa-in", "Uthai", "Sena", "Bang Ban", "Nakhon Luang", "Phachi"],
  Kanchanaburi: ["Mueang", "Sai Yok", "Si Sawat", "Sangkhla Buri", "Thong Pha Phum", "Erawan", "Tha Maka"],
  "Hua Hin": ["Hua Hin", "Cha-am", "Pran Buri", "Sam Roi Yot", "Kui Buri"],
  "Khao Yai": ["Pak Chong", "Wang Nam Khiao", "Khao Yai", "Muak Lek", "Nakhon Ratchasima"],
  Sukhothai: ["Mueang", "Historical Park", "Si Satchanalai", "Sawankhalok", "Thung Saliam"],
};
