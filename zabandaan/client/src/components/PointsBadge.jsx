import { usePoints } from '../context/PointsContext';

export default function PointsBadge() {
  const { points, animating } = usePoints();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: '#FFF8E1',
      border: '2px solid #FFA726',
      borderRadius: 20,
      padding: '6px 14px',
      fontWeight: 700,
      fontSize: 16,
      color: '#F57C00',
    }}>
      <span style={{ fontSize: 18 }}>⭐</span>
      <span className={animating ? 'points-pop' : ''}>{points}</span>
    </div>
  );
}
