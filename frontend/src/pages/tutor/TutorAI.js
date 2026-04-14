import { getTutorAI } from '../../services/api';
import AIPredictionPage from '../shared/AIPredictionPage';

const TutorAI = () => (
  <AIPredictionPage
    title="AI Subject Analysis"
    subtitle="AI-powered performance analysis for all subjects in your class"
    fetchFn={getTutorAI}
  />
);

export default TutorAI;
