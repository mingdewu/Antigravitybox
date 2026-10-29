import React from 'react';

interface AttributionBadgeProps {
  attributionText: string;
}

export const AttributionBadge: React.FC<AttributionBadgeProps> = ({
  attributionText,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        right: 24,
        padding: '4px 10px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        borderRadius: 6,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: 'rgba(255, 255, 255, 0.45)',
        fontSize: 11,
        fontFamily: 'monospace',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {attributionText}
    </div>
  );
};
