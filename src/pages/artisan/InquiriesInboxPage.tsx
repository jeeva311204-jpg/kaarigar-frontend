import React, { useState, useEffect } from 'react';
import { Inquiry, InquiryChannel } from '../../types';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchInquiries, replyToInquiryRecord } from '../../lib/firebase';
import { Button } from '../../components/common/Button';
import { 
  MessageSquare, 
  Phone, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  Clock, 
  User, 
  ArrowLeft,
  X
} from 'lucide-react';

export const InquiriesInboxPage: React.FC = () => {
  const { t, isHindi } = useTranslation();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | InquiryChannel>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const loadInquiries = async () => {
    const list = await fetchInquiries(currentUser.id);
    setInquiries(list);
  };

  useEffect(() => {
    loadInquiries();

    const handleStoreChange = () => {
      loadInquiries();
    };
    window.addEventListener('kaarigar_store_updated', handleStoreChange);
    return () => {
      window.removeEventListener('kaarigar_store_updated', handleStoreChange);
    };
  }, [currentUser.id]);

  const filteredInquiries = inquiries.filter((inq) => {
    if (activeTab === 'all') return true;
    return inq.channel === activeTab;
  });

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;

    setIsReplying(true);
    try {
      await replyToInquiryRecord(selectedInquiry.id, {
        id: `rep-${Date.now().toString(36)}`,
        sender: 'artisan',
        message: replyText.trim(),
        timestamp: new Date().toISOString()
      });

      showToast({
        type: 'success',
        title: isHindi ? 'उत्तर भेज दिया गया' : 'Reply Sent to Patron',
        message: `Replied to ${selectedInquiry.buyerName}`
      });

      setReplyText('');
      await loadInquiries();
      // Update selected inquiry reference
      const updated = (await fetchInquiries(currentUser.id)).find(i => i.id === selectedInquiry.id);
      if (updated) setSelectedInquiry(updated);

    } catch (e) {
      console.error(e);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-indigo-950">
            {t('inbox.title')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            {t('inbox.subtitle')}
          </p>
        </div>

        {/* Channel Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-paper-200 rounded-2xl border border-paper-300 self-start sm:self-auto overflow-x-auto">
          {(['all', 'chat', 'call', 'sms'] as ('all' | InquiryChannel)[]).map((tab) => {
            const isSelected = activeTab === tab;
            let label = t('inbox.allInquiries');
            if (tab === 'chat') label = t('inbox.tabChat');
            if (tab === 'call') label = t('inbox.tabCall');
            if (tab === 'sms') label = t('inbox.tabSms');

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer tap-target-accessible min-h-[38px] ${
                  isSelected
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-indigo-950'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inquiries List & Detail Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Inquiries List */}
        <div className={`space-y-3 ${selectedInquiry ? 'hidden md:block md:col-span-5' : 'col-span-12 md:col-span-5'}`}>
          {filteredInquiries.length === 0 ? (
            <div className="bg-paper-100 border border-dashed border-paper-300 rounded-3xl p-8 text-center text-stone-500 text-sm">
              {isHindi ? 'इस श्रेणी में अभी कोई पूछताछ नहीं है।' : 'No inquiries found in this category.'}
            </div>
          ) : (
            filteredInquiries.map((inq) => {
              const isSelected = selectedInquiry?.id === inq.id;
              return (
                <div
                  key={inq.id}
                  onClick={() => setSelectedInquiry(inq)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-craft ${
                    isSelected
                      ? 'bg-paper-100 border-terracotta-500 ring-2 ring-terracotta-400/30'
                      : 'bg-paper-100/90 border-paper-300 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={inq.productImage}
                      alt={inq.productTitle}
                      className="w-12 h-12 rounded-xl object-cover border border-paper-300 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-serif font-bold text-sm text-indigo-950 truncate">
                          {inq.buyerName}
                        </span>

                        {/* Channel Badge */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inq.channel === 'call'
                            ? 'bg-terracotta-100 text-terracotta-800'
                            : inq.channel === 'sms'
                            ? 'bg-turmeric-100 text-turmeric-900'
                            : 'bg-indigo-100 text-indigo-900'
                        }`}>
                          {inq.channel === 'call' ? <Phone className="w-3 h-3" /> : inq.channel === 'sms' ? <Smartphone className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                          <span className="capitalize">{inq.channel}</span>
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {inq.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-paper-200 text-[11px] text-stone-500">
                        <span className="truncate max-w-[140px] font-medium">{inq.productTitle}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(inq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Inquiry Detail & Reply Thread */}
        <div className={`md:col-span-7 ${!selectedInquiry ? 'hidden md:flex flex-col items-center justify-center bg-paper-100 border border-paper-300 rounded-3xl p-10 text-center text-stone-500 min-h-[350px]' : 'block'}`}>
          {selectedInquiry ? (
            <div className="bg-paper-100 border border-paper-300 rounded-3xl p-5 sm:p-6 shadow-craft space-y-5">
              
              {/* Top Header of Selected Inquiry */}
              <div className="flex items-start justify-between pb-4 border-b border-paper-300">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="md:hidden p-2 -ml-2 rounded-xl text-stone-600 hover:text-indigo-950"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={selectedInquiry.productImage}
                    alt={selectedInquiry.productTitle}
                    className="w-14 h-14 rounded-2xl object-cover border border-paper-300 shadow-xs shrink-0"
                  />

                  <div>
                    <h3 className="font-serif text-lg font-bold text-indigo-950">
                      {selectedInquiry.buyerName}
                    </h3>
                    <div className="text-xs text-stone-600 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-terracotta-500" />
                      <a href={`tel:${selectedInquiry.buyerPhone.replace(/\s+/g, '')}`} className="hover:underline font-mono">
                        {selectedInquiry.buyerPhone}
                      </a>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">{selectedInquiry.productTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedInquiry.buyerPhone.replace(/\s+/g, '')}`}
                    className="p-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-xs flex items-center gap-1.5 text-xs font-semibold tap-target-accessible"
                    title="Call Buyer"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">{isHindi ? 'कॉल करें' : 'Call'}</span>
                  </a>
                </div>
              </div>

              {/* Message Thread History */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {/* Initial Buyer Message */}
                <div className="bg-paper-50 border border-paper-300 rounded-2xl p-4 text-left">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span className="font-bold text-indigo-950">{selectedInquiry.buyerName}</span>
                    <span>{new Date(selectedInquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-indigo-950 leading-relaxed font-sans">
                    {selectedInquiry.message}
                  </p>
                </div>

                {/* Artisan Replies */}
                {selectedInquiry.replies?.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-indigo-900 text-white rounded-2xl p-4 ml-6 shadow-xs text-left"
                  >
                    <div className="flex items-center justify-between text-xs text-turmeric-300 mb-1">
                      <span className="font-bold">{currentUser.name} ({isHindi ? 'कारीगर' : 'Artisan'})</span>
                      <span className="opacity-80 font-mono text-[10px]">
                        {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-paper-50 leading-relaxed">
                      {rep.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-2 border-t border-paper-300 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t('inbox.typeReply')}
                  className="flex-1 px-4 py-3 rounded-xl border border-paper-300 bg-paper-50 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-indigo-950"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isReplying}
                  disabled={!replyText.trim()}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  {t('inbox.btnSendReply')}
                </Button>
              </form>

            </div>
          ) : (
            <div>
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-stone-400" />
              <p className="font-serif text-base font-bold text-indigo-950">
                {isHindi ? 'संदेश का विवरण देखने के लिए सूची से चुनें' : 'Select an inquiry to view details & reply'}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
