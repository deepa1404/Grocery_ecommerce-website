import React, { useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, ArrowLeft, Home, Building, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { IUserAddress } from '../types/index.ts';

interface AddressesPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const AddressesPage: React.FC<AddressesPageProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560038');
  const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDefault, setIsDefault] = useState(false);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !street || !pincode) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const res = await api.addAddress({
        name,
        mobile,
        street,
        city,
        state,
        pincode,
        type,
        isDefault
      });
      if (res.success) {
        showToast('Address added successfully', 'success');
        setIsAdding(false);
        setStreet('');
        await refreshUser();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add address', 'error');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await api.setDefaultAddress(id);
      if (res.success) {
        showToast('Default address updated', 'success');
        await refreshUser();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to set default', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.deleteAddress(id);
      if (res.success) {
        showToast('Address removed', 'info');
        await refreshUser();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete address', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Account</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Delivery Addresses</h1>
          <p className="text-xs text-slate-500">Manage your delivery locations for 10-minute dispatch</p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {isAdding ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs mb-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">Add New Delivery Address</h3>
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Complete Street Address</label>
              <input
                type="text"
                required
                placeholder="House No, Apartment name, Road, Landmark"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Address Type</label>
              <div className="flex gap-2">
                {(['Home', 'Work', 'Other'] as const).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      type === t
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Set as default delivery address</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                Save Address
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2.5 text-xs text-slate-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user?.addresses && user.addresses.length > 0 ? (
          user.addresses.map((addr: IUserAddress) => (
            <div
              key={addr.id}
              className={`bg-white rounded-3xl p-5 border transition-all ${
                addr.isDefault
                  ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                  : 'border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1">
                    {addr.type === 'Home' && <Home className="w-3 h-3" />}
                    {addr.type === 'Work' && <Building className="w-3 h-3" />}
                    {addr.type}
                  </span>
                  {addr.isDefault && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Default
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-xs font-bold text-slate-900">{addr.name}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{addr.street}</p>
              <p className="text-xs text-slate-500">{addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-2">📱 {addr.mobile}</p>

              {!addr.isDefault && (
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Set as Default
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-white rounded-3xl p-10 text-center border border-slate-200">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No saved addresses yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
