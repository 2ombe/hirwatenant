import React, { useState } from "react";

export default function MoMoEscrowPayment({ rentAmount = 250000, depositAmount = 250000, propertyName = "Kimironko Modern Flat" }) {
  const [provider, setProvider] = useState("mtn"); // "mtn" or "airtel"
  const [phone, setPhone] = useState("078");
  const [includeDeposit, setIncludeDeposit] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const intermediaryFee = 5000;
  const totalAmount = (Number(rentAmount) || 0) + (includeDeposit ? Number(depositAmount) : 0) + intermediaryFee;

  const handlePayNow = (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate instant MoMo Push notification
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
    }, 2500);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white text-center">
        <div className="text-3xl mb-1">📱</div>
        <h2 className="text-xl font-bold">MTN MoMo & Airtel Escrow</h2>
        <p className="text-xs text-amber-100 mt-1">
          Instant Rent Collection & Protected Deposit Escrow
        </p>
      </div>

      <div className="p-6 space-y-5">
        {paymentSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h3 className="font-bold text-slate-900 text-base">Payment Prompt Approved</h3>
            <p className="text-xs text-slate-500">
              The transaction of <strong className="text-slate-800">{totalAmount.toLocaleString()} RWF</strong> has been verified. The security caution is securely locked in the Hirwa Escrow vault.
            </p>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded">
              Transaction ID: TX-{Date.now().toString().slice(-8)}
            </div>
            <button
              onClick={() => setPaymentSuccess(false)}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Make another payment
            </button>
          </div>
        ) : (
          <form onSubmit={handlePayNow} className="space-y-4">
            {/* Amount Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Property:</span>
                <span className="font-semibold text-slate-900">{propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Monthly Rent:</span>
                <span className="font-semibold text-slate-900">{rentAmount.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDeposit}
                    onChange={(e) => setIncludeDeposit(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span className="text-slate-700 font-medium">Include Move-in Caution Deposit</span>
                </label>
                <span className="font-semibold text-slate-900">
                  {includeDeposit ? `+${depositAmount.toLocaleString()} RWF` : "0 RWF"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Hirwa Legal Escrow Fee:</span>
                <span>{intermediaryFee.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-300 font-bold text-slate-900 text-sm">
                <span>Total Payable:</span>
                <span className="text-amber-700">{totalAmount.toLocaleString()} RWF</span>
              </div>
            </div>

            {/* Provider Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Mobile Network</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider("mtn")}
                  className={`p-3 rounded-xl border-2 text-center text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    provider === "mtn"
                      ? "border-amber-500 bg-amber-50 text-amber-900"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span>MTN MoMo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("airtel")}
                  className={`p-3 rounded-xl border-2 text-center text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    provider === "airtel"
                      ? "border-red-500 bg-red-50 text-red-900"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span>Airtel Money</span>
                </button>
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {provider === "mtn" ? "MTN Phone Number" : "Airtel Phone Number"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="078XXXXXXX"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                A USSD push notification will be sent to this phone.
              </span>
            </div>

            <button
              type="submit"
              disabled={processing || phone.length < 10}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow"
            >
              {processing ? "Sending USSD Prompt..." : `Pay ${totalAmount.toLocaleString()} RWF via MoMo`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
