export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  crowdLevel: "low" | "medium" | "high";
  currentCount: number;
  capacity: number;
  cleanlinessScore: number;
  bestTime: string;
  type: string;
}

export interface Alert {
  id: string;
  locationId: string;
  locationName: string;
  type: "crowd" | "safety" | "cleanliness";
  severity: "low" | "medium" | "high";
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface HourlyPrediction {
  hour: string;
  predicted: number;
  actual?: number;
}

export interface DailyTrend {
  day: string;
  visitors: number;
  avgDensity: number;
}

export const locations: Location[] = [
  { id: "1", name: "Marina Beach", lat: 13.0499, lng: 80.2824, crowdLevel: "high", currentCount: 2450, capacity: 3000, cleanlinessScore: 72, bestTime: "6:00 AM - 8:00 AM", type: "Beach" },
  { id: "2", name: "Fort St. George", lat: 13.0797, lng: 80.2875, crowdLevel: "medium", currentCount: 890, capacity: 1500, cleanlinessScore: 85, bestTime: "9:00 AM - 11:00 AM", type: "Monument" },
  { id: "3", name: "Kapaleeshwarar Temple", lat: 13.0339, lng: 80.2695, crowdLevel: "low", currentCount: 320, capacity: 2000, cleanlinessScore: 91, bestTime: "7:00 AM - 9:00 AM", type: "Temple" },
  { id: "4", name: "Government Museum", lat: 13.0674, lng: 80.2540, crowdLevel: "low", currentCount: 150, capacity: 800, cleanlinessScore: 94, bestTime: "10:00 AM - 12:00 PM", type: "Museum" },
  { id: "5", name: "Elliot's Beach", lat: 12.9988, lng: 80.2718, crowdLevel: "medium", currentCount: 780, capacity: 1200, cleanlinessScore: 68, bestTime: "5:00 PM - 7:00 PM", type: "Beach" },
  { id: "6", name: "VGP Universal Kingdom", lat: 12.9656, lng: 80.2594, crowdLevel: "high", currentCount: 1800, capacity: 2500, cleanlinessScore: 76, bestTime: "10:00 AM - 12:00 PM", type: "Amusement Park" },
];

export const alerts: Alert[] = [
  { id: "a1", locationId: "1", locationName: "Marina Beach", type: "crowd", severity: "high", message: "Crowd level exceeding 80% capacity. Recommend traffic diversion.", timestamp: "2 min ago", resolved: false },
  { id: "a2", locationId: "6", locationName: "VGP Universal Kingdom", type: "crowd", severity: "medium", message: "Approaching peak capacity. Monitor closely.", timestamp: "15 min ago", resolved: false },
  { id: "a3", locationId: "5", locationName: "Elliot's Beach", type: "cleanliness", severity: "medium", message: "Littering detected in Zone B. Cleanup crew notified.", timestamp: "32 min ago", resolved: false },
  { id: "a4", locationId: "1", locationName: "Marina Beach", type: "safety", severity: "low", message: "Unauthorized vendor setup detected near entry point C.", timestamp: "1 hour ago", resolved: true },
];

export const hourlyPredictions: HourlyPrediction[] = [
  { hour: "6 AM", predicted: 120, actual: 95 },
  { hour: "7 AM", predicted: 280, actual: 310 },
  { hour: "8 AM", predicted: 520, actual: 490 },
  { hour: "9 AM", predicted: 890, actual: 920 },
  { hour: "10 AM", predicted: 1200, actual: 1150 },
  { hour: "11 AM", predicted: 1580, actual: 1620 },
  { hour: "12 PM", predicted: 1800, actual: 1750 },
  { hour: "1 PM", predicted: 1650 },
  { hour: "2 PM", predicted: 1400 },
  { hour: "3 PM", predicted: 1550 },
  { hour: "4 PM", predicted: 1900 },
  { hour: "5 PM", predicted: 2200 },
  { hour: "6 PM", predicted: 2450 },
  { hour: "7 PM", predicted: 2100 },
  { hour: "8 PM", predicted: 1500 },
  { hour: "9 PM", predicted: 800 },
];

export const weeklyTrends: DailyTrend[] = [
  { day: "Mon", visitors: 12400, avgDensity: 45 },
  { day: "Tue", visitors: 11200, avgDensity: 42 },
  { day: "Wed", visitors: 13800, avgDensity: 51 },
  { day: "Thu", visitors: 14200, avgDensity: 53 },
  { day: "Fri", visitors: 18900, avgDensity: 68 },
  { day: "Sat", visitors: 24500, avgDensity: 82 },
  { day: "Sun", visitors: 22100, avgDensity: 76 },
];

export const monthlyData = [
  { month: "Jan", visitors: 285000 },
  { month: "Feb", visitors: 312000 },
  { month: "Mar", visitors: 298000 },
  { month: "Apr", visitors: 265000 },
  { month: "May", visitors: 245000 },
  { month: "Jun", visitors: 189000 },
  { month: "Jul", visitors: 210000 },
  { month: "Aug", visitors: 232000 },
  { month: "Sep", visitors: 267000 },
  { month: "Oct", visitors: 310000 },
  { month: "Nov", visitors: 342000 },
  { month: "Dec", visitors: 380000 },
];

export const teamMembers = [
  { name: "Waylen Barreto", role: "Project Lead & ML Engineer", avatar: "WB" },
  { name: "Geetesh Naik", role: "Frontend Developer", avatar: "GN" },
  { name: "Amey Kapdi", role: "Backend Developer", avatar: "AK" },
  { name: "User", role: "Contributor", avatar: "U" },
];
