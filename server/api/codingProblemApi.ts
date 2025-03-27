import { getCodingProblem } from '../coding'; 

export default async function handler(req, res) {
  const level = parseInt(req.query.level, 10);

  if (isNaN(level)) {
    return res.status(400).json({ error: 'Invalid level parameter' });
  }

  const problem = await getCodingProblem(level);
  res.status(200).json(problem);
}
