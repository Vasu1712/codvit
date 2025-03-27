export async function getCodingProblem(level: number): Promise<{ level: number; problem: string }> {
  const problems = {
    1: "Write a function to reverse a string.",
    2: "Implement a binary search algorithm.",
    3: "Find the longest palindrome in a string.",
  };
  console.log('Fetching problem for level:', level);

  return {
    level,
    problem: problems[level] || "No problem found for this level.",
  };
  
}
