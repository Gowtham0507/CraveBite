import React, { useState, useEffect } from 'react';

const PhonePeModal = ({ isOpen, onClose, amount, orderId, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [pin, setPin] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setPin('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSend = () => {
        setStep(2);
    };

    const handlePinInput = (num) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleSubmitPin = () => {
        if (pin.length >= 4) {
            setStep(3); // Processing
            setTimeout(() => {
                setStep(4); // Success
                setTimeout(() => {
                    onSuccess(orderId);
                }, 2000);
            }, 2500);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 font-sans">
            <div className="bg-white w-full max-w-sm h-[650px] max-h-full rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-fade-in-up">
                
                {/* Step 1: Send Money Screen */}
                {step === 1 && (
                    <div className="flex flex-col h-full bg-gray-50">
                        <div className="bg-[#5f259f] text-white p-4 flex items-center shadow-md z-10">
                            <button onClick={onClose} className="mr-4 p-1 hover:bg-white/20 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            </button>
                            <div>
                                <h2 className="font-bold text-lg leading-tight">Paying CraveBite</h2>
                                <p className="text-xs text-purple-200">cravebite@ybl</p>
                            </div>
                            <div className="ml-auto w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#5f259f] font-bold text-xl shadow-inner">
                                C
                            </div>
                        </div>
                        
                        <div className="flex-grow flex flex-col items-center pt-8 px-6">
                            <div className="text-gray-500 mb-1 font-medium">Amount</div>
                            <div className="text-4xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="text-2xl mr-1 text-gray-600">₹</span> {amount.toFixed(2)}
                            </div>
                            
                            <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                    SBI
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">State Bank of India</div>
                                    <div className="text-xs text-gray-500">**** 1234</div>
                                </div>
                                <div className="ml-auto">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-white border-t border-gray-100">
                            <button 
                                onClick={handleSend}
                                className="w-full bg-[#5f259f] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#4a1d7c] transition-colors"
                            >
                                Send ₹{amount.toFixed(2)}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: PIN Entry Screen */}
                {step === 2 && (
                    <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
                        <div className="p-4 flex items-center border-b border-gray-800">
                            <button onClick={() => setStep(1)} className="mr-4">
                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            </button>
                            <div className="flex-grow text-center">
                                <h2 className="font-bold">Enter UPI PIN</h2>
                                <p className="text-xs text-gray-400">State Bank of India **** 1234</p>
                            </div>
                            <div className="w-6"></div>
                        </div>
                        
                        <div className="flex-grow flex flex-col items-center justify-center p-6">
                            <div className="flex justify-center gap-4 mb-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className={`w-4 h-4 rounded-full border ${i < pin.length ? 'bg-white border-white' : 'border-gray-500'}`}></div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-[#2a2a2a] p-2 grid grid-cols-3 gap-1 rounded-t-3xl">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button key={num} onClick={() => handlePinInput(num)} className="py-4 text-2xl font-semibold active:bg-[#3a3a3a] rounded-lg transition-colors">{num}</button>
                            ))}
                            <button onClick={handleBackspace} className="py-4 flex justify-center items-center active:bg-[#3a3a3a] rounded-lg transition-colors">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"></path></svg>
                            </button>
                            <button onClick={() => handlePinInput(0)} className="py-4 text-2xl font-semibold active:bg-[#3a3a3a] rounded-lg transition-colors">0</button>
                            <button onClick={handleSubmitPin} className={`py-4 flex justify-center items-center rounded-lg transition-colors ${pin.length >= 4 ? 'bg-green-600 text-white shadow-lg shadow-green-900/50' : 'bg-[#3a3a3a] text-gray-500'}`}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Processing Screen */}
                {step === 3 && (
                    <div className="flex flex-col h-full bg-[#f4f6f8] items-center justify-center p-6 text-center">
                        <div className="w-24 h-24 mb-6 relative">
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-[#5f259f] rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-10 h-10 text-[#5f259f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h2>
                        <p className="text-gray-500 text-sm max-w-[200px]">Securely connecting to State Bank of India...</p>
                    </div>
                )}

                {/* Step 4: Success Screen */}
                {step === 4 && (
                    <div className="flex flex-col h-full bg-[#119c59] text-white items-center justify-center p-6 text-center relative overflow-hidden animate-fade-in">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl transform scale-0 animate-bounce-in">
                            <svg className="w-12 h-12 text-[#119c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
                        <div className="text-4xl font-black mb-8 flex items-center justify-center">
                            <span className="text-2xl mr-1 opacity-80">₹</span> {amount.toFixed(2)}
                        </div>
                        <p className="text-green-100 text-sm">Paid securely to CraveBite</p>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes bounce-in {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}</style>
        </div>
    );
};

export default PhonePeModal;
