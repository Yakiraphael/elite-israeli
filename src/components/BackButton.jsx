import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Generic "back" control — returns to the actual previous screen (browser history)
// instead of always jumping to the marketing homepage.
export default function BackButton({ label = 'חזרה', fallback = '/', className, style }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (window.history.length > 2) navigate(-1);
    else navigate(fallback);
  };
  return (
    <button onClick={handleClick} className={className} style={style}>
      <ArrowRight size={16} /> {label}
    </button>
  );
}