// frontend/src/components/ai/AIStatusBanner.jsx
export default function AIStatusBanner({ aiStatus }) {
  if (!aiStatus) return null;

  const modelReady = aiStatus.modelStatus?.model_loaded;
  const aiReady    = aiStatus.health?.status === 'ok';

  if (aiReady && modelReady) return null; // hide when everything is fine

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm mb-4
      ${!aiReady
        ? 'bg-red-500/10 border border-red-500/30 text-red-400'
        : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
      }`}
    >
      <span>{!aiReady ? '⚠' : 'ℹ'}</span>
      <span>
        {!aiReady
          ? 'AI service unreachable — anomaly detection offline'
          : 'Model not trained yet — run python scripts/train_model.py'}
      </span>
    </div>
  );
}