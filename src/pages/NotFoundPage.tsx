import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { Button } from '../components/common/Button';
import { Store, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { t, isHindi } = useTranslation();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center mx-auto mb-4 text-terracotta-500 font-serif font-bold text-3xl">
        ४०४
      </div>

      <h1 className="font-serif text-3xl font-bold text-indigo-950 mb-2">
        {isHindi ? 'पृष्ठ नहीं मिला' : 'Craft Heritage Page Not Found'}
      </h1>
      <p className="text-sm text-stone-600 max-w-sm mb-6">
        {isHindi 
          ? 'शायद यह पृष्ठ हटा दिया गया है या पता गलत है।' 
          : 'The page you are looking for might have moved or the link is expired.'}
      </p>

      <div className="flex gap-3">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            {isHindi ? 'मुखपृष्ठ पर लौटें' : 'Return to Workshop'}
          </Button>
        </Link>
        <Link to="/marketplace">
          <Button variant="outline" size="md" leftIcon={<Store className="w-4 h-4" />}>
            {t('nav.marketplace')}
          </Button>
        </Link>
      </div>
    </div>
  );
};
