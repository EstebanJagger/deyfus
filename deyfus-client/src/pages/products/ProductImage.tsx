import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api';

type ProductImageProps = {
  imageUrl?: string | null;
  name: string;
  imageCredit?: string | null;
  imageSourceUrl?: string | null;
  className?: string;
  compact?: boolean;
};

export default function ProductImage({
  imageUrl,
  name,
  imageCredit,
  imageSourceUrl,
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
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={src}
          alt={name}
          className={`h-full w-full object-cover ${className}`}
          onError={() => setFailed(true)}
        />
        {imageCredit && imageSourceUrl && (
          <a
            href={imageSourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className={`absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-1 text-center text-white ${
              compact ? 'text-[8px]' : 'text-[10px]'
            }`}
            title={`Foto de ${imageCredit} en Pexels`}
          >
            Foto: {imageCredit} / Pexels
          </a>
        )}
      </div>
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
