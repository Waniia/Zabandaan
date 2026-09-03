import { usePoints } from '../context/PointsContext';

export default function PointsBadge() {
  const { points, animating } = usePoints();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: '#fff4d9',
      border: '2px solid #e5b65d',
      borderRadius: 10,
      padding: '6px 14px',
      fontWeight: 700,
      fontSize: 16,
      color: '#9d6423',
    }}>
      <span style={{ fontSize: 18 }}>⭐</span>
      <span className={animating ? 'points-pop' : ''}>{points}</span>
    </div>
  );
}
