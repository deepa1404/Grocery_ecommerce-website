import React, { createContext, useContext, useState } from 'react';

export interface IDeliveryLocation {
  city: string;
  area: string;
  pincode: string;
  deliveryTimeEstimate: string;
}

interface LocationContextValue {
  location: IDeliveryLocation;
  setLocation: (loc: IDeliveryLocation) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
}

const defaultLocation: IDeliveryLocation = {
  city: 'Bengaluru',
  area: 'Indiranagar',
  pincode: '560038',
  deliveryTimeEstimate: '10-15 mins'
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<IDeliveryLocation>(() => {
    const saved = localStorage.getItem('freshcart_selected_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultLocation;
      }
    }
    return defaultLocation;
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const updateLocation = (newLoc: IDeliveryLocation) => {
    setLocation(newLoc);
    localStorage.setItem('freshcart_selected_location', JSON.stringify(newLoc));
    setIsLocationModalOpen(false);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation: updateLocation,
        isLocationModalOpen,
        setIsLocationModalOpen
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
