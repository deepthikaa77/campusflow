import { getStaffAI } from '../../services/api';
import AIPredictionPage from '../shared/AIPredictionPage';

const StaffAI = () => (
  <AIPredictionPage
    title="AI Subject Analysis"
    subtitle="AI-powered performance analysis for your assigned subjects"
    fetchFn={getStaffAI}
  />
);

export default StaffAI;
