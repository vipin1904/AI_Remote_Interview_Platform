export const getDifficultyBadgeClass = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "text-[#00B8A3] bg-[#00B8A3]/15 border border-[#00B8A3]/30 font-semibold";
    case "medium":
      return "text-[#FFC01E] bg-[#FFC01E]/15 border border-[#FFC01E]/30 font-semibold";
    case "hard":
      return "text-[#FF375F] bg-[#FF375F]/15 border border-[#FF375F]/30 font-semibold";
    default:
      return "text-gray-400 bg-gray-500/15 border border-gray-500/30 font-semibold";
  }
};
