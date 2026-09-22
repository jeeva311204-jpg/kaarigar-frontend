import React, { useState } from 'react';
import { Product, InquiryChannel } from '../../types';
import { useTranslation } from '../../i18n';
import { useToast } from '../../context/ToastContext';
import { sendInquiry } from '../../lib/api';
import { 
  X, 
  MessageSquare, 
  Phone, 
  Send, 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from '../common/Button';

interface ContactModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  defaultChannel?: InquiryChannel;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  product,
  isOpen,
  onClose,
  defaultChannel = 'chat'
}) => {
  const { t, isHindi } = useTranslation();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<InquiryChannel>(defaultChannel);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const artisanPhone = product.artisanPhone || '+91 98290 44211';
  const cleanPhone = artisanPhone.replace(/\s+/g, '');
  const productTitle = isHindi && product.titleHi ? product.titleHi : product.title;

  const defaultSmsBody = encodeURIComponent(
    `Namaste ${product.artisanName} Ji! I am interested in purchasing "${productTitle}" (₹${product.finalPrice}) seen on Kaarigar platform. Is it available for delivery?`
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !message) {
      showToast({
        type: 'error',
        title: 'Missing Details',
        message: 'Please provide your name, phone number, and message.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await sendInquiry({
        productId: product.id,
        productTitle: product.title,
        productImage: product.images[0],
        artisanId: product.artisanId,
        buyerName,
        buyerPhone,
        channel: 'chat',
        message
      });

      setIsSuccess(true);
      showToast({
        type: 'success',
        title: 'Inquiry Sent Directly',
        message: `Your message was delivered to master artisan ${product.artisanName}.`
      });

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Failed to send inquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogCallAction = async () => {
    try {
      await sendInquiry({
        productId: product.id,
        productTitle: product.title,
        productImage: product.images[0],
        artisanId: product.artisanId,
        buyerName: buyerName || 'Patron (Direct Call)',
        buyerPhone: buyerPhone || 'Call Triggered',
        channel: 'call',
        message: `Buyer initiated direct telephone call for "${product.title}"`
      });
      showToast({
        type: 'info',
        title: 'Calling Master Artisan',
        message: `Connecting to ${product.artisanName} (${artisanPhone})`
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogSmsAction = async () => {
    try {
      await sendInquiry({
        productId: product.id,
        productTitle: product.title,
        productImage: product.images[0],
        artisanId: product.artisanId,
        buyerName: buyerName || 'Patron (SMS)',
        buyerPhone: buyerPhone || 'SMS Triggered',
        channel: 'sms',
        message: `Buyer opened SMS draft for "${product.title}"`
      });
      showToast({
        type: 'info',
        title: 'SMS Draft Opened',
        message: 'Pre-formatted message loaded in your messaging app.'
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-paper-50 rounded-3xl border border-paper-300 shadow-craft-lg max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-paper-200/90 border-b border-paper-300 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={product.images[0]}
              alt={productTitle}
              className="w-12 h-12 rounded-xl object-cover border border-paper-300 shadow-xs"
            />
            <div>
              <div className="text-[11px] font-bold text-terracotta-600 uppercase tracking-wider">
                {t('detail.contactHeading')}
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-indigo-950 line-clamp-1">
                {product.artisanName}
              </h3>
              <p className="text-xs text-stone-500 line-clamp-1">{productTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-2 rounded-xl hover:bg-paper-300/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Channels Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-paper-300 bg-paper-100/50">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer tap-target-accessible ${
              activeTab === 'chat'
                ? 'bg-paper-50 border-b-2 border-terracotta-500 text-terracotta-700 font-bold'
                : 'text-stone-600 hover:bg-paper-200/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('detail.btnChat')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('call')}
            className={`py-3 px-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer tap-target-accessible ${
              activeTab === 'call'
                ? 'bg-paper-50 border-b-2 border-terracotta-500 text-terracotta-700 font-bold'
                : 'text-stone-600 hover:bg-paper-200/50'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>{t('detail.btnCall')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sms')}
            className={`py-3 px-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer tap-target-accessible ${
              activeTab === 'sms'
                ? 'bg-paper-50 border-b-2 border-terracotta-500 text-terracotta-700 font-bold'
                : 'text-stone-600 hover:bg-paper-200/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{t('detail.btnSms')}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6">
          
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-serif text-lg font-bold text-indigo-950">
                {isHindi ? 'संदेश कारीगर को भेज दिया गया है!' : 'Inquiry Sent Directly to Artisan!'}
              </h4>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
                {isHindi 
                  ? 'कारीगर आपके फ़ोन नंबर पर जल्द ही संपर्क करेंगे।' 
                  : 'The master artisan will receive your request and reply directly.'}
              </p>
            </div>
          ) : activeTab === 'chat' ? (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-950 mb-1">
                  {isHindi ? 'आपका नाम (Your Name)' : 'Your Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder={isHindi ? 'उदा. अनीता देशमुख' : 'e.g. Anita Deshmukh'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-paper-300 bg-paper-100 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-950 mb-1">
                  {isHindi ? 'फ़ोन नंबर (Phone Number for Callback)' : 'Your Phone Number'} *
                </label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-paper-300 bg-paper-100 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-950 mb-1">
                  {isHindi ? 'संदेश या पूछताछ (Message / Customization Request)' : 'Message / Inquiries'} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isHindi ? 'मैं यह शिल्प खरीदना चाहता हूँ...' : 'I am interested in this craft piece and would like to know...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-paper-300 bg-paper-100 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400 resize-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="w-full font-bold"
                >
                  {isHindi ? 'संदेश भेजें' : 'Dispatch Direct Message'}
                </Button>
              </div>
            </form>
          ) : activeTab === 'call' ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-terracotta-100 border border-terracotta-200 flex items-center justify-center mx-auto text-terracotta-600 shadow-xs">
                <Phone className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-serif text-lg font-bold text-indigo-950">
                  {isHindi ? 'कारीगर को सीधे फ़ोन करें' : 'Call Master Artisan Directly'}
                </h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto mt-1">
                  {isHindi 
                    ? 'बिना किसी बिचौलिए के सीधे कारीगर से बात करें और शिल्प की जानकारी लें।' 
                    : 'Speak with zero platform markups directly with the creator of this craft.'}
                </p>
                <div className="font-mono text-base font-bold text-indigo-950 mt-2 bg-paper-200 inline-block px-4 py-1.5 rounded-full border border-paper-300">
                  {artisanPhone}
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`tel:${cleanPhone}`}
                  onClick={handleLogCallAction}
                  className="inline-flex items-center justify-center font-semibold rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-craft px-6 py-3.5 text-sm gap-2 w-full tap-target-accessible"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isHindi ? 'अभी कॉल करें' : 'Dial Artisan Now'}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-turmeric-100 border border-turmeric-200 flex items-center justify-center mx-auto text-turmeric-700 shadow-xs">
                <Smartphone className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-serif text-lg font-bold text-indigo-950">
                  {isHindi ? 'एसएमएस (SMS) द्वारा संदेश भेजें' : 'Send Instant SMS to Artisan'}
                </h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto mt-1">
                  {isHindi 
                    ? 'पूर्व-लिखित संदेश सीधे आपके संदेश ऐप में खुल जाएगा।' 
                    : 'A pre-filled text with craft name and price will open in your mobile SMS messenger.'}
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={`sms:${cleanPhone}?body=${defaultSmsBody}`}
                  onClick={handleLogSmsAction}
                  className="inline-flex items-center justify-center font-semibold rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white shadow-craft px-6 py-3.5 text-sm gap-2 w-full tap-target-accessible"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isHindi ? 'एसएमएस भेजें' : 'Launch Pre-Filled SMS'}</span>
                </a>
              </div>
            </div>
          )}

          {/* Transparent Direct Guarantee Notice */}
          <div className="mt-4 pt-3 border-t border-paper-300 flex items-center justify-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('detail.instantDirect')}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
