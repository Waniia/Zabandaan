import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle({ compact = false }) {
  const { isUrdu, toggleLanguage, t } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={isUrdu ? 'Switch to English' : 'Translate to Urdu'}
      style={{ ...styles.button, ...(compact ? styles.compact : {}) }}
    >
      <span aria-hidden="true">文</span>
      {isUrdu ? t('english', 'English') : t('translate', 'Urdu')}
    </button>
  );
}

const styles = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#e4f0e5',
    border: '1px solid #8dbb96',
    borderRadius: 9,
    color: '#286448',
    padding: '7px 10px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
  },
  compact: {
    padding: '6px 8px',
    fontSize: 12,
  },
};
