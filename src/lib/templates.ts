export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  questions: {
    type: string;
    label: string;
    required: boolean;
    options: string[];
  }[];
}

const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: "customer-satisfaction",
    name: "Customer Satisfaction",
    description: "Measure how satisfied customers are with your product or service",
    category: "Business",
    icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "from-emerald-500 to-teal-500",
    questions: [
      { type: "rating", label: "How satisfied are you with our product/service overall?", required: true, options: [] },
      { type: "radio", label: "How likely are you to recommend us to a friend?", required: true, options: ["Very Likely", "Likely", "Neutral", "Unlikely", "Very Unlikely"] },
      { type: "radio", label: "How would you rate the quality of our product?", required: true, options: ["Excellent", "Good", "Average", "Poor"] },
      { type: "textarea", label: "What do you like most about our product/service?", required: false, options: [] },
      { type: "textarea", label: "What can we improve?", required: false, options: [] },
    ],
  },
  {
    id: "employee-feedback",
    name: "Employee Feedback",
    description: "Gather insights about workplace satisfaction and culture",
    category: "HR",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    color: "from-blue-500 to-indigo-500",
    questions: [
      { type: "rating", label: "How satisfied are you with your current role?", required: true, options: [] },
      { type: "radio", label: "Do you feel valued at work?", required: true, options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"] },
      { type: "rating", label: "How would you rate the work-life balance?", required: true, options: [] },
      { type: "radio", label: "How effective is communication within your team?", required: true, options: ["Excellent", "Good", "Average", "Poor"] },
      { type: "textarea", label: "What changes would improve your work experience?", required: false, options: [] },
      { type: "yesno", label: "Would you recommend this company as a great place to work?", required: true, options: [] },
    ],
  },
  {
    id: "event-feedback",
    name: "Event Feedback",
    description: "Collect attendee feedback after events, webinars, or workshops",
    category: "Events",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    color: "from-purple-500 to-pink-500",
    questions: [
      { type: "rating", label: "How would you rate the event overall?", required: true, options: [] },
      { type: "radio", label: "How relevant was the content to your needs?", required: true, options: ["Very Relevant", "Relevant", "Somewhat Relevant", "Not Relevant"] },
      { type: "radio", label: "How was the event organized?", required: true, options: ["Excellent", "Good", "Average", "Poor"] },
      { type: "textarea", label: "What was the most valuable part of the event?", required: false, options: [] },
      { type: "textarea", label: "Any suggestions for future events?", required: false, options: [] },
      { type: "yesno", label: "Would you attend a similar event in the future?", required: true, options: [] },
    ],
  },
  {
    id: "product-feedback",
    name: "Product Feedback",
    description: "Understand how users feel about your product features and usability",
    category: "Product",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    color: "from-orange-500 to-red-500",
    questions: [
      { type: "rating", label: "How easy is our product to use?", required: true, options: [] },
      { type: "checkbox", label: "Which features do you use most?", required: true, options: ["Dashboard", "Reports", "Notifications", "Settings", "Integrations"] },
      { type: "radio", label: "How often do you use our product?", required: true, options: ["Daily", "Weekly", "Monthly", "Rarely"] },
      { type: "textarea", label: "What feature would you like us to add?", required: false, options: [] },
      { type: "rating", label: "How likely are you to continue using our product?", required: true, options: [] },
    ],
  },
  {
    id: "course-evaluation",
    name: "Course Evaluation",
    description: "Evaluate teaching quality, course content, and learning outcomes",
    category: "Education",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    color: "from-cyan-500 to-blue-500",
    questions: [
      { type: "rating", label: "How would you rate the course content?", required: true, options: [] },
      { type: "rating", label: "How effective was the instructor?", required: true, options: [] },
      { type: "radio", label: "Was the course pace appropriate?", required: true, options: ["Too Fast", "Just Right", "Too Slow"] },
      { type: "radio", label: "How well did the course meet your expectations?", required: true, options: ["Exceeded", "Met", "Partially Met", "Did Not Meet"] },
      { type: "textarea", label: "What topics would you like covered in more detail?", required: false, options: [] },
      { type: "yesno", label: "Would you recommend this course to others?", required: true, options: [] },
    ],
  },
  {
    id: "website-feedback",
    name: "Website Feedback",
    description: "Improve your website based on visitor experience and usability feedback",
    category: "Product",
    icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
    color: "from-violet-500 to-purple-500",
    questions: [
      { type: "rating", label: "How easy was it to find what you were looking for?", required: true, options: [] },
      { type: "radio", label: "How would you rate the website design?", required: true, options: ["Excellent", "Good", "Average", "Poor"] },
      { type: "rating", label: "How fast did the website load?", required: true, options: [] },
      { type: "radio", label: "What device are you using?", required: false, options: ["Desktop", "Mobile", "Tablet"] },
      { type: "textarea", label: "Any issues or suggestions?", required: false, options: [] },
    ],
  },
  {
    id: "market-research",
    name: "Market Research",
    description: "Understand your target audience, preferences, and buying behavior",
    category: "Business",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    color: "from-amber-500 to-orange-500",
    questions: [
      { type: "radio", label: "What is your age group?", required: true, options: ["18-24", "25-34", "35-44", "45-54", "55+"] },
      { type: "radio", label: "How did you hear about us?", required: true, options: ["Social Media", "Search Engine", "Friend/Referral", "Advertisement", "Other"] },
      { type: "checkbox", label: "What factors influence your purchasing decision?", required: true, options: ["Price", "Quality", "Brand", "Reviews", "Convenience"] },
      { type: "radio", label: "How often do you purchase similar products?", required: true, options: ["Weekly", "Monthly", "Quarterly", "Yearly", "First Time"] },
      { type: "email", label: "Your email (for follow-up)", required: false, options: [] },
      { type: "phone", label: "Your phone number (optional)", required: false, options: [] },
    ],
  },
  {
    id: "contact-form",
    name: "Contact Form",
    description: "Simple contact form to collect inquiries with name, email, and phone",
    category: "General",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "from-rose-500 to-pink-500",
    questions: [
      { type: "text", label: "Full Name", required: true, options: [] },
      { type: "email", label: "Email Address", required: true, options: [] },
      { type: "phone", label: "Phone Number", required: false, options: [] },
      { type: "radio", label: "Subject", required: true, options: ["General Inquiry", "Support", "Sales", "Partnership", "Other"] },
      { type: "textarea", label: "Your Message", required: true, options: [] },
    ],
  },
];

export default SURVEY_TEMPLATES;
