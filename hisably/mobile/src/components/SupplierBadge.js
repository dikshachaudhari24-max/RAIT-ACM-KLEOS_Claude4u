import React from 'react';
import { StatusChip } from './StatusChip';
import { useT } from '../i18n';

const config = {
  green: { key: 'supplier.reliable', tone: 'success' },
  yellow: { key: 'supplier.caution', tone: 'warning' },
  red: { key: 'supplier.problematic', tone: 'danger' },
};

export const SupplierBadge = ({ tier }) => {
  const t = useT();
  const c = config[tier] || config.green;
  return <StatusChip label={t(c.key)} tone={c.tone} />;
};
