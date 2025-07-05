import {
  Languages,
  Brain,
  TrendingUp,
  Briefcase,
  Lightbulb,
  Heart,
  BookOpen,
  DollarSign,
  Megaphone,
  Activity,
  MessageCircle,
  Users,
  Laptop,
  Eye,
  Star,
} from "lucide-react";

export interface Category {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: any;
  color: string;
  bgColor: string;
}

export const COURSE_CATEGORIES: Category[] = [
  {
    id: "languages",
    nameKey: "languages",
    descriptionKey: "languagesDesc",
    icon: Languages,
    color: "text-blue-900",
    bgColor: "bg-blue-50 border-blue-200",
  },
  {
    id: "mind-thinking",
    nameKey: "mindThinking", 
    descriptionKey: "mindThinkingDesc",
    icon: Brain,
    color: "text-purple-900",
    bgColor: "bg-purple-50 border-purple-200",
  },
  {
    id: "finance-economics",
    nameKey: "financeEconomics",
    descriptionKey: "financeEconomicsDesc", 
    icon: TrendingUp,
    color: "text-green-900",
    bgColor: "bg-green-50 border-green-200",
  },
  {
    id: "career-skills",
    nameKey: "careerSkills",
    descriptionKey: "careerSkillsDesc",
    icon: Briefcase,
    color: "text-gray-900",
    bgColor: "bg-gray-50 border-gray-200",
  },
  {
    id: "future-thinking",
    nameKey: "futureThinking",
    descriptionKey: "futureThinkingDesc",
    icon: Lightbulb,
    color: "text-yellow-900", 
    bgColor: "bg-yellow-50 border-yellow-200",
  },
  {
    id: "health-body",
    nameKey: "healthBody",
    descriptionKey: "healthBodyDesc",
    icon: Heart,
    color: "text-red-900",
    bgColor: "bg-red-50 border-red-200",
  },
];

export const BOOK_CATEGORIES: Category[] = [
  {
    id: "psychology-thinking-development",
    nameKey: "psychologyThinkingDevelopment",
    descriptionKey: "psychologyThinkingDevelopmentDesc",
    icon: Brain,
    color: "text-purple-900",
    bgColor: "bg-purple-50 border-purple-200",
  },
  {
    id: "financial-literacy-economics", 
    nameKey: "financialLiteracyEconomics",
    descriptionKey: "financialLiteracyEconomicsDesc",
    icon: DollarSign,
    color: "text-green-900",
    bgColor: "bg-green-50 border-green-200",
  },
  {
    id: "marketing",
    nameKey: "marketing",
    descriptionKey: "marketingDesc",
    icon: Megaphone,
    color: "text-orange-900",
    bgColor: "bg-orange-50 border-orange-200",
  },
  {
    id: "health-fitness-nutrition",
    nameKey: "healthFitnessNutrition", 
    descriptionKey: "healthFitnessNutritionDesc",
    icon: Activity,
    color: "text-green-900",
    bgColor: "bg-green-50 border-green-200",
  },
  {
    id: "communication-soft-skills",
    nameKey: "communicationSoftSkills",
    descriptionKey: "communicationSoftSkillsDesc", 
    icon: MessageCircle,
    color: "text-blue-900",
    bgColor: "bg-blue-50 border-blue-200",
  },
  {
    id: "entrepreneurship-career",
    nameKey: "entrepreneurshipCareer",
    descriptionKey: "entrepreneurshipCareerDesc",
    icon: Briefcase,
    color: "text-gray-900",
    bgColor: "bg-gray-50 border-gray-200",
  },
  {
    id: "technology-future",
    nameKey: "technologyFuture",
    descriptionKey: "technologyFutureDesc",
    icon: Laptop,
    color: "text-indigo-900",
    bgColor: "bg-indigo-50 border-indigo-200",
  },
  {
    id: "relationships",
    nameKey: "relationships", 
    descriptionKey: "relationshipsDesc",
    icon: Users,
    color: "text-pink-900",
    bgColor: "bg-pink-50 border-pink-200",
  },
  {
    id: "popular-personalities",
    nameKey: "popularPersonalities",
    descriptionKey: "popularPersonalitiesDesc",
    icon: Star,
    color: "text-yellow-900",
    bgColor: "bg-yellow-50 border-yellow-200",
  },
];

export function getCategoryById(categories: Category[], id: string): Category | undefined {
  return categories.find(cat => cat.id === id);
}

export function getCourseCategory(id: string): Category | undefined {
  return getCategoryById(COURSE_CATEGORIES, id);
}

export function getBookCategory(id: string): Category | undefined {
  return getCategoryById(BOOK_CATEGORIES, id);
}