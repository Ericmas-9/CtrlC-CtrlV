import React, { createContext, useContext, useState, useEffect } from 'react';

const UserLocationContext = createContext();

const FALLBACK_LOCATION = { lat: 41.3851, lng: 2.1734 }; // Barcelona

export const UserLocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | granted | denied

  const requestLocation = async () => {
    setLocationStatus('loading');
    
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setUserLocation(FALLBACK_LOCATION);
      return FALLBACK_LOCATION;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setLocationStatus('granted');
          resolve(loc);
        },
        (error) => {
          console.warn("Geolocation error or denied:", error);
          setUserLocation(FALLBACK_LOCATION);
          setLocationStatus('denied');
          resolve(FALLBACK_LOCATION);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  useEffect(() => {
    // Automatically request location when the app loads
    if (locationStatus === 'idle') {
      requestLocation();
    }
  }, [locationStatus]);

  return (
    <UserLocationContext.Provider value={{ userLocation, locationStatus, requestLocation }}>
      {children}
    </UserLocationContext.Provider>
  );
};

export const useUserLocation = () => useContext(UserLocationContext);
