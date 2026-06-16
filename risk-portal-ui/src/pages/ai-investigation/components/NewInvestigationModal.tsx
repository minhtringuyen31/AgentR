import { useState } from 'react';
import { Modal, ModalBody, ModalContent, ModalHeader, KeenIcon } from '@/components';
import { triggerEmail, triggerPostmortem, RunOut } from '@/services/apis/Agent';

type TabType = 'email' | 'postmortem';

interface NewInvestigationModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (run: RunOut) => void;
}

const NewInvestigationModal = ({ open, onClose, onCreated }: NewInvestigationModalProps) => {
  const [tab, setTab] = useState<TabType>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email form state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailSender, setEmailSender] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Post-mortem form state
  const [pmIncidentId, setPmIncidentId] = useState('');
  const [pmSummary, setPmSummary] = useState('');
  const [pmRecord, setPmRecord] = useState('{}');

  // Thresholds
  const [minPrecision, setMinPrecision] = useState('0.80');
  const [minRecall, setMinRecall] = useState('0.60');
  const [maxIterations, setMaxIterations] = useState('10');

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const thresholds = {
        min_precision: parseFloat(minPrecision),
        min_recall: parseFloat(minRecall),
        max_iterations: parseInt(maxIterations),
      };

      let run: RunOut;
      if (tab === 'email') {
        if (!emailBody.trim()) {
          setError('Email body is required.');
          setLoading(false);
          return;
        }
        run = await triggerEmail({
          subject: emailSubject || undefined,
          sender: emailSender || undefined,
          body: emailBody,
          ...thresholds,
        });
      } else {
        let record: Record<string, unknown> = {};
        try {
          record = JSON.parse(pmRecord);
        } catch {
          setError('Post-mortem record must be valid JSON.');
          setLoading(false);
          return;
        }
        run = await triggerPostmortem({
          incident_id: pmIncidentId || undefined,
          summary: pmSummary || undefined,
          record,
          ...thresholds,
        });
      }
      onCreated(run);
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start investigation.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalContent className="w-[600px] max-w-[95vw]">
        <ModalHeader className="pb-0 border-b-0">
          <h3 className="modal-title">New Investigation</h3>
          <button className="btn btn-xs btn-icon btn-light" onClick={handleClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="pt-4 pb-6 px-6">
          {/* Source tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-5">
            {(['email', 'postmortem'] as TabType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <KeenIcon icon={t === 'email' ? 'sms' : 'document'} className="text-base" />
                {t === 'email' ? 'Email' : 'Post-mortem'}
              </button>
            ))}
          </div>

          {/* Email form */}
          {tab === 'email' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label text-gray-700 text-sm mb-1 block">Subject</label>
                <input
                  className="input"
                  placeholder="Optional"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label text-gray-700 text-sm mb-1 block">Sender</label>
                <input
                  className="input"
                  placeholder="Optional"
                  value={emailSender}
                  onChange={(e) => setEmailSender(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label text-gray-700 text-sm mb-1 block">
                  Email Body <span className="text-danger">*</span>
                </label>
                <textarea
                  className="textarea min-h-[140px]"
                  placeholder="Paste the full fraud report email here..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Post-mortem form */}
          {tab === 'postmortem' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label text-gray-700 text-sm mb-1 block">Incident ID</label>
                <input
                  className="input"
                  placeholder="Optional"
                  value={pmIncidentId}
                  onChange={(e) => setPmIncidentId(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label text-gray-700 text-sm mb-1 block">Summary</label>
                <textarea
                  className="textarea min-h-[80px]"
                  placeholder="Brief description of the incident..."
                  value={pmSummary}
                  onChange={(e) => setPmSummary(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label text-gray-700 text-sm mb-1 block">
                  Record <span className="text-gray-400 font-normal">(JSON)</span>
                </label>
                <textarea
                  className="textarea font-mono text-xs min-h-[100px]"
                  placeholder="{}"
                  value={pmRecord}
                  onChange={(e) => setPmRecord(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Thresholds */}
          <div className="mt-5 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
              Thresholds
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="form-label text-gray-600 text-xs mb-1 block">Min Precision</label>
                <input
                  className="input input-sm"
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={minPrecision}
                  onChange={(e) => setMinPrecision(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label text-gray-600 text-xs mb-1 block">Min Recall</label>
                <input
                  className="input input-sm"
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={minRecall}
                  onChange={(e) => setMinRecall(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label text-gray-600 text-xs mb-1 block">Max Iterations</label>
                <input
                  className="input input-sm"
                  type="number"
                  min="1"
                  max="20"
                  value={maxIterations}
                  onChange={(e) => setMaxIterations(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-danger-light rounded-lg text-danger text-sm">
              <KeenIcon icon="information-2" className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2.5 mt-6">
            <button className="btn btn-light" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Starting...
                </>
              ) : (
                <>
                  <KeenIcon icon="rocket" />
                  Start Investigation
                </>
              )}
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { NewInvestigationModal };
