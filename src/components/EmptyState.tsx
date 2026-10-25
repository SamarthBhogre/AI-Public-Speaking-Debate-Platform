import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9998a9' }}>
      <div style={{ width: 56, height: 56, background: '#f0efff', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: '#7066f5' }}>
        <Icon size={24} />
      </div>
      <h3 style={{ fontSize: 16, color: '#292744', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13, maxWidth: 300, margin: '0 auto 22px', lineHeight: 1.6 }}>{description}</p>
      {action && (
        <button className="primary" onClick={action.onClick}>{action.label}</button>
      )}
    </div>
  );
}
