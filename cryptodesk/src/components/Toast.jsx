import { useConfig } from '../context/ConfigContext';

export default function Toast() {
  const { toast } = useConfig();
  if (!toast) return null;
  return <div className="toast show">{toast}</div>;
}
