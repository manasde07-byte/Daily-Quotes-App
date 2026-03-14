export type Category = 'Love' | 'Motivation' | 'Life' | 'Funny' | 'Sad';

export interface Quote {
  id: string;
  text: string;
  category: Category;
}

export const CATEGORIES: { name: Category; label: string; icon: string; color: string }[] = [
  { name: 'Love', label: 'ভালোবাসা', icon: '❤️', color: 'bg-pink-500' },
  { name: 'Motivation', label: 'অনুপ্রেরণা', icon: '🚀', color: 'bg-blue-500' },
  { name: 'Life', label: 'জীবন', icon: '🌱', color: 'bg-green-500' },
  { name: 'Funny', label: 'মজা', icon: '😂', color: 'bg-yellow-500' },
  { name: 'Sad', label: 'দুঃখ', icon: '😢', color: 'bg-indigo-500' },
];

export const INITIAL_QUOTES: Quote[] = [
  { id: '1', category: 'Love', text: 'ভালোবাসা মানে একে অপরের পরিপূরক হওয়া।' },
  { id: 'l2', category: 'Love', text: 'তুমি আমার জীবনের সেই আলো যা অন্ধকার দূর করে দেয়।' },
  { id: 'l3', category: 'Love', text: 'ভালোবাসা মানে শুধু কাছে আসা নয়, দূরে থেকেও পাশে থাকা।' },
  { id: '2', category: 'Motivation', text: 'সাফল্য মানেই শেষ নয়, ব্যর্থতা মানেই মৃত্যু নয়; আসল হলো এগিয়ে যাওয়ার সাহস ধরে রাখা।' },
  { id: 'm2', category: 'Motivation', text: 'কষ্ট ছাড়া কখনো কেষ্ট মেলে না।' },
  { id: 'm3', category: 'Motivation', text: 'স্বপ্ন সেটা নয় যা তুমি ঘুমিয়ে দেখো, স্বপ্ন সেটাই যা তোমাকে ঘুমাতে দেয় না।' },
  { id: '3', category: 'Life', text: 'জীবন হলো একটি আয়নার মতো, আপনি হাসলে এটিও হাসবে।' },
  { id: 'li2', category: 'Life', text: 'জীবন মানেই সংগ্রাম, আর সংগ্রাম মানেই এগিয়ে চলা।' },
  { id: 'li3', category: 'Life', text: 'মানুষের জীবন ছোট, কিন্তু কর্মের মাধ্যমে তা অমর হতে পারে।' },
  { id: '4', category: 'Funny', text: 'পড়াশোনা করলে জ্ঞান বাড়ে, আর না করলে ঘুম বাড়ে!' },
  { id: 'f2', category: 'Funny', text: 'বিয়ে হলো এমন এক দিল্লি কা লাড্ডু, যে খায় সেও পস্তায়, যে না খায় সেও পস্তায়।' },
  { id: 'f3', category: 'Funny', text: 'ফেসবুক হলো এমন এক জায়গা যেখানে সবাই সুখী, শুধু আমি ছাড়া!' },
  { id: '5', category: 'Sad', text: 'কিছু স্মৃতি খুব কষ্টের হয়, যা চাইলেও ভোলা যায় না।' },
  { id: 's2', category: 'Sad', text: 'মানুষ হাসলে সবাই হাসে, কিন্তু কাঁদলে কেউ পাশে থাকে না।' },
  { id: 's3', category: 'Sad', text: 'অভিমান হলো ভালোবাসার এক গোপন ভাষা।' },
];
