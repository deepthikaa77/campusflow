import { getStudentAI } from '../../services/api';
import AIPredictionPage from '../shared/AIPredictionPage';

const StudentAI = () => (
  <AIPredictionPage
    title="AI Academic Analysis"
    subtitle="Personalized AI analysis of your performance in each subject"
    fetchFn={getStudentAI}
  />
);

export default StudentAI;
