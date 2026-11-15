import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api';

type ProductImageProps = {
  imageUrl?: string | null;
  name: string;
  className?: string;
  compact?: boolean;
};

export default function ProductImage({
  imageUrl,
  name,
  className = 'h-full w-full',
  compact = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveImageUrl(imageUrl);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        className={`h-full w-full object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-500 ${className}`}>
      <ShoppingBag className={compact ? 'mb-1 h-5 w-5 text-slate-400' : 'mb-2 h-10 w-10 text-slate-400'} />
      <span className={compact ? 'text-center text-[10px]' : 'text-center text-sm'}>
        {imageUrl ? 'Imagen no disponible' : 'Sin imagen'}
      </span>
    </div>
  );
}
