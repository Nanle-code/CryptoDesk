import { DEMO_STEPS } from '../lib/demoWizard';

export default function DemoWizard({
  open,
  stepIndex,
  onClose,
  onStepChange,
  onRunStep,
  running,
}) {
  if (!open) return null;

  const step = DEMO_STEPS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / DEMO_STEPS.length) * 100);

  return (
    <div className="demo-wizard-backdrop" role="dialog" aria-modal="true" aria-label="Judge demo wizard">
      <div className="demo-wizard">
        <div className="demo-wizard-head">
          <div>
            <span className="demo-wizard-tag">Judge demo · Wave 3</span>
            <h2>{step.title}</h2>
            <p className="report-p dim">
              {step.step === 0 ? 'Setup · ' : `Step ${step.step} of 7 · `}
              {step.summary}
            </p>
          </div>
          <button type="button" className="demo-wizard-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="demo-wizard-progress">
          <div className="demo-wizard-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="api-proof">{step.proof}</p>

        <ol className="demo-wizard-steps">
          {DEMO_STEPS.map((s, i) => (
            <li key={s.id} className={i === stepIndex ? 'active' : i < stepIndex ? 'done' : ''}>
              <button type="button" onClick={() => onStepChange(i)}>
                <span>{s.step || '—'}</span> {s.title}
              </button>
            </li>
          ))}
        </ol>

        <div className="demo-wizard-actions">
          <button
            type="button"
            className="btn-ghost small"
            disabled={stepIndex === 0}
            onClick={() => onStepChange(stepIndex - 1)}
          >
            Back
          </button>
          <button
            type="button"
            className="briefing-trigger"
            disabled={running}
            onClick={() => onRunStep(stepIndex)}
          >
            {running ? 'Running…' : 'Run this step'}
          </button>
          <button
            type="button"
            className="btn-ghost small"
            disabled={stepIndex >= DEMO_STEPS.length - 1}
            onClick={() => onStepChange(stepIndex + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
