import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useTranslation } from '../../i18n';
import { Badge } from '../common/Badge';
import { MapPin, Phone, MessageSquare, ShieldCheck, Sparkles, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onContactClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onContactClick
}) => {
  const { t, isHindi } = useTranslation();

  const title = isHindi && product.titleHi ? product.titleHi : product.title;
  const description = isHindi && product.descriptionHi ? product.descriptionHi : product.description;

  return (
    <div className="bg-paper-100 rounded-2xl border border-paper-300 overflow-hidden shadow-craft hover:shadow-craft-md transition-all duration-200 flex flex-col group">
      
      {/* Product Image with Badges */}
      <Link to={`/product/${product.id}`} className="relative aspect-4/3 overflow-hidden block bg-stone-100">
        <img
          src={product.images[0]}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[80%]">
          {product.giTagged && (
            <Badge giCertified={true} giTagNumber={product.giTagNumber} />
          )}
          <Badge status={product.status} />
        </div>

        {/* In-Stock Pill */}
        <div className="absolute bottom-2.5 right-2.5 bg-indigo-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Package className="w-3 h-3" />
          <span>{product.stockQuantity} {t('common.pieces')}</span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Provenance & Origin */}
          <div className="flex items-center gap-1 text-xs text-terracotta-700 font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{product.artisanLocation || product.craftOrigin}</span>
          </div>

          {/* Title */}
          <Link to={`/product/${product.id}`}>
            <h4 className="font-serif font-bold text-base text-indigo-950 group-hover:text-terracotta-600 transition-colors line-clamp-2 leading-snug mb-1.5">
              {title}
            </h4>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {description}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="pt-3 border-t border-paper-300 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              {t('marketplace.fairPrice')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif font-bold text-base sm:text-lg text-indigo-950">
                ₹{product.finalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-stone-500">
                (₹{product.priceMin} - ₹{product.priceMax})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onContactClick ? (
              <button
                type="button"
                onClick={() => onContactClick(product)}
                className="p-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-xs transition-transform active:scale-95 cursor-pointer tap-target-accessible flex items-center gap-1 text-xs font-semibold"
                title={t('marketplace.contactArtisan')}
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('marketplace.contactArtisan')}</span>
              </button>
            ) : (
              <Link
                to={`/product/${product.id}`}
                className="px-3 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {t('marketplace.viewDetails')}
              </Link>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
