import ui from './components.module.css';

interface Props {
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  loadingText: string;
  emptyText: string;
  onRetry(): void;
}

export function BranchStatus({ isLoading, error, isEmpty, loadingText, emptyText, onRetry }: Props) {
  if (error) {
    return (
      <div className={ui.errorBox} role="alert">
        <p>{error.message}</p>
        <button className={ui.secondaryButton} type="button" onClick={onRetry}>Reintentar</button>
      </div>
    );
  }

  if (isEmpty && isLoading) return <p className={ui.muted}>{loadingText}</p>;
  if (isEmpty) return <p className={ui.muted}>{emptyText}</p>;
  return null;
}
