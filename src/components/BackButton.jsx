import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Generic "back" control — returns to the actual previous screen within the SPA stack.
// Falls back to the role hub (/transfer-portal) on direct URL arrivals so admins/coaches
// are never sent back to the public marketing homepage unexpectedly.
export default function BackButton({ label = 'חזרה', fallback = '/transfer-portal', className, style }) {
  const navigate = useNavigate();
  const handleClick = () => {
    // idx is the React Router stack position — only go back if there's something to go back to
    const idx = window.history.state?.idx;
    if (typeof idx === 'number' && idx > 0) navigate(-1);
    else navigate(fallback);
  };
  return (
    <button onClick={handleClick} className={className} style={style}>
      <ArrowRight size={16} /> {label}
    </button>
  );
}