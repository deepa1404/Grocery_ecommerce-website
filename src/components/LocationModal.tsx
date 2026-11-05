import React, { useState } from 'react';
import { MapPin, X, Check, Navigation } from 'lucide-react';
import { useLocation, IDeliveryLocation } from '../context/LocationContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

const POPULAR_LOCATIONS: IDeliveryLocation[] = [
  { city: 'Bengaluru', area: 'Indiranagar', pincode: '560038', deliveryTimeEstimate: '10-15 mins' },
  { city: 'Bengaluru', area: 'Koramangala', pincode: '560034', deliveryTimeEstimate: '12-18 mins' },
  { city: 'Bengaluru', area: 'Whitefield', pincode: '560066', deliveryTimeEstimate: '15-20 mins' },
  { city: 'Mumbai', area: 'Bandra West', pincode: '400050', deliveryTimeEstimate: '12-15 mins' },
  { city: 'Mumbai', area: 'Andheri East', pincode: '400069', deliveryTimeEstimate: '15-20 mins' },
  { city: 'Delhi NCR', area: 'Gurugram Sector 29', pincode: '122002', deliveryTimeEstimate: '12-15 mins' },
  { city: 'Hyderabad', area: 'Hitec City', pincode: '500081', deliveryTimeEstimate: '10-15 mins' },
  { city: 'Chennai', area: 'T. Nagar', pincode: '600017', deliveryTimeEstimate: '15-20 mins' },
];

export const LocationModal: React.FC = () => {
  const { location, setLocation, isLocationModalOpen, setIsLocationModalOpen } = useLocation();
  const { showToast } = useToast();
  const [customPincode, setCustomPincode] = useState('');
  const [customArea, setCustomArea] = useState('');

  if (!isLocationModalOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPincode || customPincode.length < 6) {
      showToast('Please enter a valid 6-digit PIN code', 'error');
      return;
    }

    const newLoc: IDeliveryLocation = {
      city: 'Local Region',
      area: customArea || 'Central Zone',
      pincode: customPincode,
      deliveryTimeEstimate: '15-25 mins'
    };

    setLocation(newLoc);
    showToast(`Delivery location set to ${newLoc.area} (${newLoc.pincode})`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={() => setIsLocationModalOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Choose Delivery Location</h3>
            <p className="text-xs text-slate-500">Superfast delivery available in select service zones</p>
          </div>
        </div>

        {/* Current Location Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
            <div>
              <p className="text-xs font-semibold text-emerald-900">Current active zone:</p>
              <p className="text-sm font-bold text-emerald-700">{location.area}, {location.city} - {location.pincode}</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-600 text-white rounded-full">
            {location.deliveryTimeEstimate}
          </span>
        </div>

        {/* Quick select list */}
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Popular Service Zones</h4>
        <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto mb-5 pr-1">
          {POPULAR_LOCATIONS.map((loc, idx) => {
            const isSelected = loc.pincode === location.pincode;
            return (
              <button
                key={idx}
                onClick={() => {
                  setLocation(loc);
                  showToast(`Delivery location set to ${loc.area}, ${loc.city}`, 'success');
                }}
                className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-medium ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold leading-tight">{loc.area}</p>
                  <p className="text-xs text-slate-500">{loc.city} ({loc.pincode})</p>
                  <span className="text-[10px] text-emerald-600 font-medium">⚡ {loc.deliveryTimeEstimate}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Enter Custom Pincode */}
        <form onSubmit={handleCustomSubmit} className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Or enter custom pincode</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Area / Colony name (optional)"
              value={customArea}
              onChange={(e) => setCustomArea(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              maxLength={6}
              placeholder="6-digit PIN"
              value={customPincode}
              onChange={(e) => setCustomPincode(e.target.value.replace(/\D/g, ''))}
              className="w-28 px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
