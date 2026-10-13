export function formatRelativeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (isNaN(diffMs) || diffMs < 0) {
      return 'Recién publicado';
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Hace un momento';
    }
    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    }
    if (diffHours === 1) {
      return 'Hace 1 hora';
    }
    if (diffHours < 24) {
      return `Hace ${diffHours} horas`;
    }
    if (diffDays === 1) {
      return 'Ayer';
    }
    if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    }

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Fecha no disponible';
  }
}
