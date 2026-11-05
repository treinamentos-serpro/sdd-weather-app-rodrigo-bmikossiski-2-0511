interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Carregando...",
}: LoadingStateProps) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80 shadow-glass backdrop-blur-md"
      role="status"
    >
      <span
        aria-hidden="true"
        className="mb-3 inline-block size-5 animate-spin rounded-full border-2 border-white/25 border-t-accent-400 motion-reduce:animate-none"
      />
      <p>{message}</p>
    </div>
  );
}