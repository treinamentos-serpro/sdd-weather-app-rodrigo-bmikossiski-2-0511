interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className="rounded-2xl border border-red-300/20 bg-white/5 p-6 text-center shadow-glass backdrop-blur-md">
      <p className="text-white/85" role="alert">
        {message}
      </p>
      <button
        className="mt-4 rounded-lg border border-white/15 bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </section>
  );
}